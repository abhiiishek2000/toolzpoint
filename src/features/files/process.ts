import {
  imageDimensions,
  rotationDegrees,
  fitDimensions,
  validateFiles,
  parsePageRange,
  parsePageOrder,
  watermarkOptions,
  centeredRotatedTextOrigin,
  coverCropRect,
  replaceBackground,
  hexToRgb,
  type FileTask,
  type FileResult,
} from "./domain";
async function bitmap(file: File) {
  imageDimensions(new Uint8Array(await file.arrayBuffer()));
  const image = await createImageBitmap(file);
  if (image.width * image.height > 12000000) {
    image.close();
    throw new Error("Use images with no more than 12 million pixels.");
  }
  return image;
}
export async function processFiles(task: FileTask): Promise<FileResult> {
  const isPdfInput =
    task.kind === "merge-pdf" ||
    task.kind === "split-pdf" ||
    task.kind === "rotate-pdf" ||
    task.kind === "add-page-numbers-to-pdf" ||
    task.kind === "organize-pdf-pages" ||
    task.kind === "watermark-pdf";
  validateFiles(
    task.files,
    isPdfInput ? "pdf" : "image",
    task.kind === "merge-pdf" || task.kind === "images-to-pdf",
  );
  const report = (
    title: string,
    headers: string[],
    rows: (string | number)[][],
  ) => ({ title, headers, rows });
  if (task.kind === "rotate-pdf" || task.kind === "add-page-numbers-to-pdf") {
    const { PDFDocument, degrees, StandardFonts, rgb } =
      await import("pdf-lib");
    const doc = await PDFDocument.load(await task.files[0]!.arrayBuffer());
    const pages = doc.getPages();
    if (!pages.length || pages.length > 200)
      throw new Error("Use a PDF with 1–200 pages.");
    if (task.kind === "rotate-pdf") {
      const angle = rotationDegrees(task.rotation ?? 90);
      for (const page of pages)
        page.setRotation(degrees((page.getRotation().angle + angle) % 360));
    } else {
      const font = await doc.embedFont(StandardFonts.Helvetica);
      for (const [i, page] of pages.entries()) {
        const box = page.getCropBox();
        if (box.width < 100 || box.height < 60)
          throw new Error(
            "Pages must be at least 100 × 60 points to add readable numbers.",
          );
        const label = `${i + 1} / ${pages.length}`;
        page.drawText(label, {
          x: box.x + (box.width - font.widthOfTextAtSize(label, 10)) / 2,
          y: box.y + 18,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      }
    }
    return {
      blob: new Blob([new Uint8Array(await doc.save())], {
        type: "application/pdf",
      }),
      report:
        task.kind === "rotate-pdf"
          ? report(
              "Rotation by page",
              ["Page", "Applied rotation", "Final rotation"],
              pages.map((p, i) => [
                i + 1,
                task.rotation ?? 90,
                p.getRotation().angle,
              ]),
            )
          : report(
              "Page number placement",
              ["Page", "Printed label", "Placement"],
              pages.map((_, i) => [
                i + 1,
                `${i + 1} / ${pages.length}`,
                "Bottom center, 18 pt from crop edge",
              ]),
            ),
      pages: pages.length,
    };
  }
  if (task.kind === "merge-pdf") {
    const { PDFDocument } = await import("pdf-lib");
    const out = await PDFDocument.create();
    let total = 0;
    const sources: (string | number)[][] = [];
    for (const file of task.files) {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const first = total + 1;
      total += src.getPageCount();
      sources.push([file.name, src.getPageCount(), `${first}–${total}`]);
      if (total > 200)
        throw new Error(
          "The combined PDF must contain no more than 200 pages.",
        );
      const pages = await out.copyPages(src, src.getPageIndices());
      for (const page of pages) out.addPage(page);
    }
    if (!total) throw new Error("The PDFs contain no pages.");
    return {
      blob: new Blob([new Uint8Array(await out.save())], {
        type: "application/pdf",
      }),
      report: report(
        "Merged PDF source order",
        ["Source file", "Pages", "Output pages"],
        sources,
      ),
      pages: total,
    };
  }
  if (task.kind === "split-pdf") {
    const { PDFDocument } = await import("pdf-lib");
    const file = task.files[0];
    if (!file) throw new Error("Choose a PDF.");
    const src = await PDFDocument.load(await file.arrayBuffer());
    if (src.getPageCount() < 1 || src.getPageCount() > 400)
      throw new Error("Use a PDF with 1–400 pages.");
    const indices = parsePageRange(task.pageRange ?? "", src.getPageCount());
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    for (const page of pages) out.addPage(page);
    return {
      blob: new Blob([new Uint8Array(await out.save())], {
        type: "application/pdf",
      }),
      report: report(
        task.kind === "split-pdf"
          ? "Extracted page mapping"
          : "Rebuilt page order",
        ["Output page", "Original page"],
        indices.map((index, i) => [i + 1, index + 1]),
      ),
      pages: indices.length,
    };
  }
  if (task.kind === "organize-pdf-pages") {
    const { PDFDocument } = await import("pdf-lib");
    const file = task.files[0];
    if (!file) throw new Error("Choose a PDF.");
    const src = await PDFDocument.load(await file.arrayBuffer());
    if (src.getPageCount() < 1 || src.getPageCount() > 400)
      throw new Error("Use a PDF with 1–400 pages.");
    const indices = parsePageOrder(task.pageOrder ?? "", src.getPageCount());
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    for (const page of pages) out.addPage(page);
    return {
      blob: new Blob([new Uint8Array(await out.save())], {
        type: "application/pdf",
      }),
      report: report(
        "Rebuilt page order",
        ["Output page", "Original page"],
        indices.map((index, i) => [i + 1, index + 1]),
      ),
      pages: indices.length,
    };
  }
  if (task.kind === "watermark-pdf") {
    const { PDFDocument, StandardFonts, rgb, degrees } =
      await import("pdf-lib");
    const { sanitizeForPdf } = await import("./pdf-text");
    const file = task.files[0];
    if (!file) throw new Error("Choose a PDF.");
    const doc = await PDFDocument.load(await file.arrayBuffer());
    const pages = doc.getPages();
    if (!pages.length || pages.length > 200)
      throw new Error("Use a PDF with 1–200 pages.");
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const { text, opacity, fontSize } = watermarkOptions(
      task.watermarkText ?? "",
      task.watermarkOpacity ?? 0.2,
      task.watermarkFontSize ?? 60,
    );
    const clean = sanitizeForPdf(text, font);
    if (!clean) throw new Error("Watermark text has no renderable characters.");
    const width = font.widthOfTextAtSize(clean, fontSize);
    for (const page of pages) {
      const box = page.getCropBox();
      const { x, y } = centeredRotatedTextOrigin(
        box.x + box.width / 2,
        box.y + box.height / 2,
        width,
        fontSize,
        45,
      );
      page.drawText(clean, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.4, 0.4, 0.45),
        opacity,
        rotate: degrees(45),
      });
    }
    return {
      blob: new Blob([new Uint8Array(await doc.save())], {
        type: "application/pdf",
      }),
      report: report(
        "Watermark on each page",
        ["Page", "Text", "Opacity (%)", "Font size (pt)"],
        pages.map((_, i) => [i + 1, clean, opacity * 100, fontSize]),
      ),
      pages: pages.length,
    };
  }
  if (task.kind === "images-to-pdf") {
    const { PDFDocument } = await import("pdf-lib");
    const out = await PDFDocument.create();
    for (const file of task.files) {
      const image = await bitmap(file);
      try {
        const dims = fitDimensions(image.width, image.height, 2400, 2400);
        const canvas = new OffscreenCanvas(dims.width, dims.height);
        const ctx = canvas.getContext("2d");
        if (!ctx)
          throw new Error("Image processing is unavailable in this browser.");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, dims.width, dims.height);
        ctx.drawImage(image, 0, 0, dims.width, dims.height);
        const jpeg = await canvas.convertToBlob({
          type: "image/jpeg",
          quality: 0.9,
        });
        const embedded = await out.embedJpg(await jpeg.arrayBuffer());
        const page = out.addPage([595.28, 841.89]);
        const factor = Math.min(547.28 / dims.width, 793.89 / dims.height);
        const w = dims.width * factor,
          h = dims.height * factor;
        page.drawImage(embedded, {
          x: (595.28 - w) / 2,
          y: (841.89 - h) / 2,
          width: w,
          height: h,
        });
      } finally {
        image.close();
      }
    }
    return {
      blob: new Blob([new Uint8Array(await out.save())], {
        type: "application/pdf",
      }),
      report: report(
        "Image-to-page mapping",
        ["Page", "Source image", "Page format"],
        task.files.map((f, i) => [
          i + 1,
          f.name,
          "A4 portrait · white background · fitted inside margins",
        ]),
      ),
      pages: task.files.length,
    };
  }
  if (
    task.kind === "passport-photo-maker" ||
    task.kind === "social-media-image-resizer"
  ) {
    const file = task.files[0];
    if (!file) throw new Error("Choose an image.");
    const image = await bitmap(file);
    try {
      const { sx, sy, sWidth, sHeight } = coverCropRect(
        image.width,
        image.height,
        task.maxWidth,
        task.maxHeight,
        task.zoom ?? 1,
        task.verticalBias ?? 0,
      );
      const canvas = new OffscreenCanvas(task.maxWidth, task.maxHeight);
      const ctx = canvas.getContext("2d");
      if (!ctx)
        throw new Error("Image processing is unavailable in this browser.");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, task.maxWidth, task.maxHeight);
      ctx.drawImage(
        image,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        task.maxWidth,
        task.maxHeight,
      );
      if (task.removeBackground) {
        const target = hexToRgb(task.backgroundColor ?? "#ffffff");
        const imageData = ctx.getImageData(0, 0, task.maxWidth, task.maxHeight);
        const replaced = replaceBackground(
          imageData.data,
          task.maxWidth,
          task.maxHeight,
          target,
        );
        ctx.putImageData(
          new ImageData(replaced, task.maxWidth, task.maxHeight),
          0,
          0,
        );
      }
      let quality = 0.92;
      let blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
      if (task.maxKB) {
        let attempts = 0;
        while (
          blob.size > task.maxKB * 1024 &&
          quality > 0.15 &&
          attempts < 12
        ) {
          quality -= 0.07;
          blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
          attempts++;
        }
        if (blob.size > task.maxKB * 1024)
          throw new Error(
            `Could not compress under ${task.maxKB} KB. Try a smaller source photo.`,
          );
      }
      return {
        blob,
        width: task.maxWidth,
        height: task.maxHeight,
        report: report(
          task.kind === "passport-photo-maker"
            ? "Photo crop and export checks"
            : "Social image crop specification",
          ["Check", "Value"],
          [
            ["Original pixels", `${image.width} × ${image.height}`],
            ["Output pixels", `${task.maxWidth} × ${task.maxHeight}`],
            [
              "Source crop (x, y, width, height)",
              [sx, sy, sWidth, sHeight].map((n) => n.toFixed(1)).join(", "),
            ],
            ["Output", "JPEG"],
            ["Encoded quality (%)", Math.round(quality * 100)],
            [
              "Background replacement",
              task.removeBackground
                ? (task.backgroundColor ?? "#ffffff")
                : "Off",
            ],
            [
              "Size limit",
              task.maxKB
                ? `${task.maxKB} KB; actual ${(blob.size / 1024).toFixed(1)} KB`
                : "No size cap selected",
            ],
            [
              "Review",
              task.kind === "passport-photo-maker"
                ? "Dimensions do not certify official photo acceptance. Check face, lighting and current issuing-authority rules."
                : "Check the crop, text and safe areas for the destination placement.",
            ],
          ],
        ),
      };
    } finally {
      image.close();
    }
  }
  if (!Number.isFinite(task.quality) || task.quality < 0.1 || task.quality > 1)
    throw new Error("Quality must be between 10 and 100.");
  const file = task.files[0];
  if (!file) throw new Error("Choose an image.");
  const image = await bitmap(file);
  try {
    const dims = fitDimensions(
      image.width,
      image.height,
      task.maxWidth,
      task.maxHeight,
    );
    const angle =
      task.kind === "image-rotator-flipper"
        ? rotationDegrees(task.rotation ?? 90)
        : 0;
    const flip =
      task.kind === "image-rotator-flipper" ? (task.flip ?? "none") : "none";
    if (!["none", "horizontal", "vertical"].includes(flip))
      throw new Error("Choose a valid flip direction.");
    const rotated = angle === 90 || angle === 270;
    const outputWidth = rotated ? dims.height : dims.width;
    const outputHeight = rotated ? dims.width : dims.height;
    const canvas = new OffscreenCanvas(outputWidth, outputHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw new Error("Image processing is unavailable in this browser.");
    if (task.format === "image/jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, outputWidth, outputHeight);
    }
    ctx.translate(outputWidth / 2, outputHeight / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.scale(flip === "horizontal" ? -1 : 1, flip === "vertical" ? -1 : 1);
    ctx.drawImage(
      image,
      -dims.width / 2,
      -dims.height / 2,
      dims.width,
      dims.height,
    );
    const blob = await canvas.convertToBlob({
      type: task.format,
      quality: task.quality,
    });
    if (blob.type !== task.format)
      throw new Error(
        "This browser does not support the selected output format.",
      );
    const title = {
      "image-compressor": "Compression quality and size report",
      "image-resizer": "Resize dimensions and aspect ratio",
      "image-format-converter": "Format conversion specification",
      "image-rotator-flipper": "Rotation and flip operations",
    }[task.kind];
    return {
      blob,
      width: outputWidth,
      height: outputHeight,
      report: report(
        title,
        ["Property", "Original", "Output"],
        [
          [
            "Dimensions (px)",
            `${image.width} × ${image.height}`,
            `${outputWidth} × ${outputHeight}`,
          ],
          ["File format", file.type, blob.type],
          ["File bytes", file.size, blob.size],
          ...(task.kind === "image-rotator-flipper"
            ? [
                ["Clockwise rotation", "0°", `${angle}°`],
                ["Flip", "None", flip],
              ]
            : []),
          [
            "Resize behavior",
            "Source dimensions",
            "Aspect ratio preserved; no enlargement",
          ],
          [
            "Encoding quality",
            "Source encoding",
            task.format === "image/png"
              ? "Lossless PNG; quality slider not applicable"
              : `${Math.round(task.quality * 100)}% encoder setting`,
          ],
          [
            "Transparency",
            "Source alpha if present",
            task.format === "image/jpeg"
              ? "Flattened onto white"
              : "Retained if present",
          ],
        ],
      ),
    };
  } finally {
    image.close();
  }
}

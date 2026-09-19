import {
  imageDimensions,
  fitDimensions,
  validateFiles,
  parsePageRange,
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
  const isPdfInput = task.kind === "merge-pdf" || task.kind === "split-pdf";
  validateFiles(
    task.files,
    isPdfInput ? "pdf" : "image",
    task.kind === "merge-pdf" || task.kind === "images-to-pdf",
  );
  if (task.kind === "merge-pdf") {
    const { PDFDocument } = await import("pdf-lib");
    const out = await PDFDocument.create();
    let total = 0;
    for (const file of task.files) {
      const src = await PDFDocument.load(await file.arrayBuffer());
      total += src.getPageCount();
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
      pages: total,
    };
  }
  if (task.kind === "split-pdf") {
    const { PDFDocument } = await import("pdf-lib");
    const file = task.files[0];
    if (!file) throw new Error("Choose a PDF.");
    const src = await PDFDocument.load(await file.arrayBuffer());
    const indices = parsePageRange(task.pageRange ?? "", src.getPageCount());
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    for (const page of pages) out.addPage(page);
    return {
      blob: new Blob([new Uint8Array(await out.save())], {
        type: "application/pdf",
      }),
      pages: indices.length,
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
      pages: task.files.length,
    };
  }
  if (task.kind === "passport-photo-maker") {
    const file = task.files[0];
    if (!file) throw new Error("Choose a photo.");
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
      return { blob, width: task.maxWidth, height: task.maxHeight };
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
    const canvas = new OffscreenCanvas(dims.width, dims.height);
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw new Error("Image processing is unavailable in this browser.");
    if (task.format === "image/jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, dims.width, dims.height);
    }
    ctx.drawImage(image, 0, 0, dims.width, dims.height);
    const blob = await canvas.convertToBlob({
      type: task.format,
      quality: task.quality,
    });
    if (blob.type !== task.format)
      throw new Error(
        "This browser does not support the selected output format.",
      );
    return { blob, width: dims.width, height: dims.height };
  } finally {
    image.close();
  }
}

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 30 * 1024 * 1024;
export function validateFiles(
  files: { name: string; size: number; type: string }[],
  kind: "image" | "pdf",
  multiple = false,
) {
  if (!files.length) throw new Error("Choose a file to get started.");
  if (files.length > (multiple ? 10 : 1))
    throw new Error(
      multiple
        ? "Choose at most 10 files."
        : kind === "pdf"
          ? "Choose one PDF at a time."
          : "Choose one image at a time.",
    );
  if (files.some((f) => f.size === 0 || f.size > MAX_FILE_BYTES))
    throw new Error("Each file must be non-empty and no larger than 20 MB.");
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_BYTES)
    throw new Error("Keep the combined file size below 30 MB.");
  if (
    files.some((f) =>
      kind === "pdf"
        ? !/\.pdf$/i.test(f.name) || !["application/pdf", ""].includes(f.type)
        : !["image/jpeg", "image/png", "image/webp"].includes(f.type),
    )
  )
    throw new Error(
      kind === "pdf"
        ? "Choose PDF files only."
        : "Choose JPG, PNG, or WebP images.",
    );
}
export function fitDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
  allowEnlarge = false,
) {
  for (const n of [width, height, maxWidth, maxHeight])
    if (!Number.isFinite(n) || n <= 0)
      throw new Error("Dimensions must be positive numbers.");
  if (maxWidth > 4096 || maxHeight > 4096)
    throw new Error("Output dimensions must be 4,096 pixels or less.");
  const scale = Math.min(
    maxWidth / width,
    maxHeight / height,
    allowEnlarge ? Infinity : 1,
  );
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
export function parsePageRange(spec: string, pageCount: number) {
  const cleaned = spec.trim();
  if (!cleaned) throw new Error("Enter a page range, such as 1-3, 5.");
  const indices = new Set<number>();
  for (const part of cleaned
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)) {
    const range = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!range) throw new Error(`"${part}" is not a valid page or range.`);
    const start = Number(range[1]);
    const end = range[2] ? Number(range[2]) : start;
    if (start < 1 || end < start)
      throw new Error(`"${part}" is not a valid page or range.`);
    if (end > pageCount)
      throw new Error(
        `Page ${end} does not exist in this ${pageCount}-page PDF.`,
      );
    for (let p = start; p <= end; p++) indices.add(p - 1);
  }
  if (!indices.size) throw new Error("Enter at least one page number.");
  return [...indices].sort((a, b) => a - b);
}
export type PhotoIdPreset = {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  maxKB?: number;
};
export const PHOTO_ID_PRESETS: PhotoIdPreset[] = [
  {
    id: "in-passport",
    label: "India Passport (3.5 × 4.5 cm)",
    widthMm: 35,
    heightMm: 45,
  },
  {
    id: "us-passport",
    label: "US Passport / Visa (2 × 2 in)",
    widthMm: 50.8,
    heightMm: 50.8,
  },
  {
    id: "uk-passport",
    label: "UK Passport (3.5 × 4.5 cm)",
    widthMm: 35,
    heightMm: 45,
  },
  {
    id: "schengen-visa",
    label: "Schengen Visa (3.5 × 4.5 cm)",
    widthMm: 35,
    heightMm: 45,
  },
  {
    id: "pan-card",
    label: "PAN Card photo (2.5 × 3.5 cm)",
    widthMm: 25,
    heightMm: 35,
  },
  {
    id: "exam-photo",
    label: "Govt. exam photo – SSC / Railway (3.5 × 4.5 cm, ≤50 KB)",
    widthMm: 35,
    heightMm: 45,
    maxKB: 50,
  },
];
export function mmToPx(mm: number, dpi = 300) {
  if (!Number.isFinite(mm) || mm < 10 || mm > 200)
    throw new Error("Use a size between 10 mm and 200 mm.");
  return Math.round((mm / 25.4) * dpi);
}
export function coverCropRect(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  zoom = 1,
  verticalBias = 0,
) {
  for (const n of [sourceWidth, sourceHeight, targetWidth, targetHeight])
    if (!Number.isFinite(n) || n <= 0)
      throw new Error("Dimensions must be positive numbers.");
  if (zoom < 1 || zoom > 3) throw new Error("Zoom must be between 1 and 3.");
  if (verticalBias < -1 || verticalBias > 1)
    throw new Error("Vertical position must be between -1 and 1.");
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  const baseWidth =
    sourceRatio > targetRatio ? sourceHeight * targetRatio : sourceWidth;
  const baseHeight =
    sourceRatio > targetRatio ? sourceHeight : sourceWidth / targetRatio;
  const cropWidth = baseWidth / zoom;
  const cropHeight = baseHeight / zoom;
  const maxOffsetY = (sourceHeight - cropHeight) / 2;
  return {
    sx: Math.round((sourceWidth - cropWidth) / 2),
    sy: Math.round((sourceHeight - cropHeight) / 2 + verticalBias * maxOffsetY),
    sWidth: Math.round(cropWidth),
    sHeight: Math.round(cropHeight),
  };
}
export function hexToRgb(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) throw new Error("Choose a valid color.");
  const value = match[1]!;
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}
// Estimates the existing background color from a border sample, then fades
// pixels near that color toward the chosen replacement, leaving the subject
// (assumed centered, away from the edges) unchanged. This is a plain color
// threshold, not subject segmentation, so it works best with a plain,
// evenly lit original background.
export function replaceBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  target: [number, number, number],
  tolerance = 42,
) {
  if (width < 4 || height < 4)
    throw new Error("Image is too small to process.");
  const step = Math.max(1, Math.floor(Math.min(width, height) / 40));
  const samples: number[] = [];
  const sample = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    samples.push(data[i]!, data[i + 1]!, data[i + 2]!);
  };
  for (let x = 0; x < width; x += step) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 0; y < height; y += step) {
    sample(0, y);
    sample(width - 1, y);
  }
  let br = 0,
    bg = 0,
    bb = 0;
  const count = samples.length / 3;
  for (let i = 0; i < samples.length; i += 3) {
    br += samples[i]!;
    bg += samples[i + 1]!;
    bb += samples[i + 2]!;
  }
  br /= count;
  bg /= count;
  bb /= count;
  const low = tolerance * 0.65;
  const high = tolerance * 1.5;
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i]! - br,
      dg = data[i + 1]! - bg,
      db = data[i + 2]! - bb;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    const weight =
      dist <= low ? 1 : dist >= high ? 0 : 1 - (dist - low) / (high - low);
    out[i] = data[i]! * (1 - weight) + target[0] * weight;
    out[i + 1] = data[i + 1]! * (1 - weight) + target[1] * weight;
    out[i + 2] = data[i + 2]! * (1 - weight) + target[2] * weight;
    out[i + 3] = 255;
  }
  return out;
}
export function savings(original: number, output: number) {
  return original > 0 ? Math.round((1 - output / original) * 100) : 0;
}
export function prettyBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
export type FileTask = {
  id: number;
  kind:
    | "image-compressor"
    | "image-resizer"
    | "image-format-converter"
    | "image-rotator-flipper"
    | "rotate-pdf"
    | "add-page-numbers-to-pdf"
    | "merge-pdf"
    | "images-to-pdf"
    | "split-pdf"
    | "passport-photo-maker";
  files: File[];
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: "image/jpeg" | "image/webp" | "image/png";
  rotation?: number;
  flip?: "none" | "horizontal" | "vertical";
  pageRange?: string;
  zoom?: number;
  verticalBias?: number;
  maxKB?: number;
  removeBackground?: boolean;
  backgroundColor?: string;
};
export type FileResult = {
  blob: Blob;
  width?: number;
  height?: number;
  pages?: number;
};

// Read bounded format headers before bitmap allocation; do not decode oversized pixels.
export function imageDimensions(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const str = (offset: number, length: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + length));
  let width = 0,
    height = 0;
  if (
    bytes.length >= 24 &&
    bytes[0] === 137 &&
    str(1, 3) === "PNG" &&
    str(12, 4) === "IHDR"
  ) {
    width = view.getUint32(16);
    height = view.getUint32(20);
  } else if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 255) break;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === undefined || marker === 218 || marker === 217) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (offset + 2 > bytes.length) break;
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if (
        [
          192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
        ].includes(marker) &&
        length >= 8
      ) {
        height = view.getUint16(offset + 3);
        width = view.getUint16(offset + 5);
        break;
      }
      offset += length;
    }
  } else if (
    bytes.length >= 30 &&
    str(0, 4) === "RIFF" &&
    str(8, 4) === "WEBP"
  ) {
    const chunk = str(12, 4);
    if (chunk === "VP8X") {
      width =
        1 +
        (bytes[24] ?? 0) +
        ((bytes[25] ?? 0) << 8) +
        ((bytes[26] ?? 0) << 16);
      height =
        1 +
        (bytes[27] ?? 0) +
        ((bytes[28] ?? 0) << 8) +
        ((bytes[29] ?? 0) << 16);
    } else if (
      chunk === "VP8 " &&
      bytes[23] === 157 &&
      bytes[24] === 1 &&
      bytes[25] === 42
    ) {
      width = view.getUint16(26, true) & 16383;
      height = view.getUint16(28, true) & 16383;
    } else if (chunk === "VP8L" && bytes[20] === 47) {
      width = 1 + ((bytes[21] ?? 0) | (((bytes[22] ?? 0) & 63) << 8));
      height =
        1 +
        (((bytes[22] ?? 0) >> 6) |
          ((bytes[23] ?? 0) << 2) |
          (((bytes[24] ?? 0) & 15) << 10));
    }
  }
  if (!width || !height)
    throw new Error("Choose a valid JPG, PNG, or WebP image.");
  if (width * height > 12000000)
    throw new Error("Use images with no more than 12 million pixels.");
  return { width, height };
}

export function rotationDegrees(value: number) {
  if (![0, 90, 180, 270].includes(value))
    throw new Error("Choose 0, 90, 180 or 270 degrees.");
  return value;
}

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
      multiple ? "Choose at most 10 files." : "Choose one image at a time.",
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
  kind: "image-compressor" | "image-resizer" | "merge-pdf" | "images-to-pdf";
  files: File[];
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: "image/jpeg" | "image/webp" | "image/png";
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

# Creator-focused revision

The first catalog emphasized text and developer utilities and provided little visual feedback. This revision puts everyday users and creators first: image size and format tasks, document assembly, and static QR creation. Existing URLs remain available.

## Product changes

- A workspace-style homepage with category navigation, high-contrast featured tools, task filters, inline search, and a working QR creator.
- Cobalt, lime, coral, and cyan surfaces replace the muted green marketing layout. Tool pages share the new type, color, input, and result styles.
- Image Compressor and Image Resizer show a local image preview, output dimensions, before/after bytes, and actual size change. Presets are convenience boxes, not claims about social-platform requirements.
- Merge PDF supports keyboard-accessible file ordering. Images to PDF produces one image per A4 page.
- QR Code Generator produces real static PNG codes with bounded text, dark color choices, and multiple sizes. It adds no redirect or tracking.
- File work is bounded by bytes, decoded pixels, dimensions, page count, and a 45-second timeout. Work is performed in a cancelable browser worker. Libraries load on demand. Files are not uploaded or retained in localStorage.

## Demand rationale and its limits

Image compression/resizing and PDF assembly are established categories visible on the official iLoveIMG and iLovePDF products. This is evidence of an existing category, not a verified keyword-volume estimate or evidence that a new site can rank easily. No traffic numbers, popularity counters, or fake customer claims were added.

References checked for this revision:

- https://www.iloveimg.com/compress-image
- https://www.ilovepdf.com/
- https://www.qrcode.com/en/about/error_correction.html
- https://github.com/soldair/node-qrcode
- https://pdf-lib.js.org/docs/api/classes/pdfdocument

## Growth next steps

Before investing in more tools, validate country-specific search demand and SERP difficulty for narrow tasks such as image-size limits, specific format conversions, and document assembly workflows. Launch useful, differentiated pages with verified examples; index only after review. Use actual acquisition and successful-run data to select expansions. A nicer interface or larger catalog alone cannot establish traffic.

## File limitations

JPG/PNG/WebP only for image input. Up to 20 MB per file, 30 MB combined for multi-file operations, 10 files, 12 million decoded pixels per image, and maximum image output side 4,096 pixels. No SVG/HEIC/GIF input, OCR, background removal, image upscaling, PDF compression, or PDF-to-Word conversion is claimed. Merge PDF rejects encrypted PDFs and caps combined page count at 200. Forms, signatures, bookmarks, and document-level PDF features are not guaranteed to survive.

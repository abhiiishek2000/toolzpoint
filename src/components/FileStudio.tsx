"use client";
/* eslint-disable @next/next/no-img-element -- Previews are local blob URLs, not remotely optimized images. */
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { UtilityFrame, markUsed } from "./UtilityFrame";
import {
  validateFiles,
  prettyBytes,
  savings,
  type FileTask,
  type FileResult,
} from "@/features/files/domain";
export default function FileStudio({ slug }: { slug: FileTask["kind"] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<FileTask["format"]>("image/webp");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1920);
  const [result, setResult] = useState<FileResult | null>(null);
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const outputUrl = useRef("");
  const inputUrl = useRef("");
  const input = useRef<HTMLInputElement>(null);
  const worker = useRef<Worker | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const multiple = slug === "merge-pdf" || slug === "images-to-pdf";
  const pdf = slug === "merge-pdf";
  const imageOutput = !multiple;
  useEffect(
    () => () => {
      worker.current?.terminate();
      if (timeout.current) clearTimeout(timeout.current);
      URL.revokeObjectURL(outputUrl.current);
      URL.revokeObjectURL(inputUrl.current);
    },
    [],
  );
  function changed() {
    URL.revokeObjectURL(outputUrl.current);
    outputUrl.current = "";
    setResult(null);
    setUrl("");
    setNotice("");
    setError("");
  }
  function choose(selected: File[]) {
    if (busy) return;
    try {
      validateFiles(selected, pdf ? "pdf" : "image", multiple);
      setFiles(selected);
      URL.revokeObjectURL(inputUrl.current);
      inputUrl.current =
        selected[0] && !pdf ? URL.createObjectURL(selected[0]) : "";
      setPreview(inputUrl.current);
      changed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Choose a supported file.");
    }
    if (input.current) input.current.value = "";
  }
  function cancel() {
    worker.current?.terminate();
    worker.current = null;
    if (timeout.current) clearTimeout(timeout.current);
    setBusy(false);
    setNotice("Processing canceled.");
  }
  function run() {
    changed();
    try {
      validateFiles(files, pdf ? "pdf" : "image", multiple);
      if (pdf && files.length < 2)
        throw new Error("Choose at least two PDFs to merge.");
      if (!window.Worker)
        throw new Error("This tool needs a browser with Web Worker support.");
      setBusy(true);
      worker.current = new Worker(
        new URL("../features/files/processing.worker.ts", import.meta.url),
      );
      timeout.current = setTimeout(() => {
        worker.current?.terminate();
        setBusy(false);
        setError("Processing took too long. Try smaller files.");
      }, 45000);
      worker.current.onmessage = (
        event: MessageEvent<{ result?: FileResult; error?: string }>,
      ) => {
        if (timeout.current) clearTimeout(timeout.current);
        setBusy(false);
        worker.current?.terminate();
        worker.current = null;
        if (event.data.error) {
          setError(event.data.error);
          return;
        }
        if (event.data.result) {
          setResult(event.data.result);
          outputUrl.current = URL.createObjectURL(event.data.result.blob);
          setUrl(outputUrl.current);
          setNotice("Your file is ready to download.");
          markUsed(slug);
        }
      };
      worker.current.onerror = () => {
        if (timeout.current) clearTimeout(timeout.current);
        worker.current?.terminate();
        worker.current = null;
        setBusy(false);
        setError(
          "Your browser could not process this file. Try a current browser and a smaller file.",
        );
      };
      worker.current.postMessage({
        id: 1,
        kind: slug,
        files,
        quality: quality / 100,
        maxWidth: width,
        maxHeight: height,
        format,
      } satisfies FileTask);
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Choose a valid file.");
    }
  }
  function reorder(index: number, delta: number) {
    const next = [...files];
    const other = next[index + delta],
      current = next[index];
    if (!other || !current) return;
    next[index] = other;
    next[index + delta] = current;
    setFiles(next);
    changed();
  }
  const originalSize = files.reduce((n, f) => n + f.size, 0);
  const saved = result ? savings(originalSize, result.blob.size) : 0;
  const extension =
    result?.blob.type === "application/pdf"
      ? "pdf"
      : result?.blob.type === "image/png"
        ? "png"
        : result?.blob.type === "image/jpeg"
          ? "jpg"
          : "webp";
  return (
    <UtilityFrame slug={slug}>
      <div className="file-studio">
        <div className="file-input-side">
          <div className="studio-step">
            <span>01</span>
            <h2>{multiple ? "Add your files" : "Start with an image"}</h2>
          </div>
          <div
            className={`drop-zone ${dragging ? "is-dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              choose(Array.from(e.dataTransfer.files));
            }}
          >
            <div className="upload-symbol">
              <Icon name={pdf ? "Files" : "ImageUp"} size={32} />
            </div>
            <h3>
              {files.length
                ? `${files.length} ${files.length === 1 ? "file" : "files"} selected`
                : "Drop it like it’s done."}
            </h3>
            <p>{pdf ? "PDF files" : "JPG, PNG, or WebP"} · up to 20 MB each</p>
            <button
              className="button primary"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              <Icon name="Plus" size={18} />
              {files.length
                ? "Choose different files"
                : multiple
                  ? "Choose files"
                  : "Choose an image"}
            </button>
            <input
              ref={input}
              className="sr-only"
              type="file"
              aria-label={pdf ? "Choose PDF files" : "Choose image files"}
              accept={
                pdf ? "application/pdf,.pdf" : "image/jpeg,image/png,image/webp"
              }
              multiple={multiple}
              onChange={(e) => choose(Array.from(e.target.files ?? []))}
            />
            <span className="drop-note">
              <Icon name="LockKeyhole" size={12} />
              Stays on your device
            </span>
          </div>
          {files.length > 0 && (
            <ol className="file-list">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`}>
                  <Icon name={pdf ? "FileText" : "Image"} size={19} />
                  <div>
                    <strong>{f.name}</strong>
                    <span>{prettyBytes(f.size)}</span>
                  </div>
                  {multiple && (
                    <>
                      <button
                        className="icon-button"
                        aria-label={`Move file ${i + 1} up`}
                        disabled={busy || i === 0}
                        onClick={() => reorder(i, -1)}
                      >
                        <Icon name="ArrowUp" size={15} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Move file ${i + 1} down`}
                        disabled={busy || i === files.length - 1}
                        onClick={() => reorder(i, 1)}
                      >
                        <Icon name="ArrowDown" size={15} />
                      </button>
                    </>
                  )}
                  <button
                    className="icon-button"
                    aria-label={`Remove file ${i + 1}`}
                    disabled={busy}
                    onClick={() => {
                      setFiles(files.filter((_, j) => j !== i));
                      changed();
                    }}
                  >
                    <Icon name="X" size={15} />
                  </button>
                </li>
              ))}
            </ol>
          )}
          <fieldset disabled={busy} className="studio-settings">
            {imageOutput && (
              <>
                <div className="studio-step">
                  <span>02</span>
                  <h2>Make it fit</h2>
                </div>
                <div className="preset-row">
                  {[
                    ["Web", "1920"],
                    ["Social", "1080"],
                    ["Email", "1280"],
                  ].map(([label, size]) => (
                    <button
                      key={label}
                      className={`chip ${width === Number(size) ? "active" : ""}`}
                      onClick={() => {
                        setWidth(Number(size));
                        setHeight(Number(size));
                        changed();
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="fields-grid">
                  <label className="field">
                    Max width (px)
                    <input
                      type="number"
                      min="1"
                      max="4096"
                      value={width}
                      onChange={(e) => {
                        setWidth(Number(e.target.value));
                        changed();
                      }}
                    />
                  </label>
                  <label className="field">
                    Max height (px)
                    <input
                      type="number"
                      min="1"
                      max="4096"
                      value={height}
                      onChange={(e) => {
                        setHeight(Number(e.target.value));
                        changed();
                      }}
                    />
                  </label>
                </div>
                <p className="setting-hint">
                  Keeps proportions. Smaller images are never enlarged.
                </p>
                <div className="quality-row">
                  <label htmlFor="quality">Quality</label>
                  <strong>{quality}%</strong>
                </div>
                <input
                  id="quality"
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  disabled={format === "image/png"}
                  onChange={(e) => {
                    setQuality(Number(e.target.value));
                    changed();
                  }}
                />
                <label className="field">
                  Save as
                  <select
                    value={format}
                    onChange={(e) => {
                      setFormat(e.target.value as FileTask["format"]);
                      changed();
                    }}
                  >
                    <option value="image/webp">WebP — compact, modern</option>
                    <option value="image/jpeg">JPG — widely compatible</option>
                    <option value="image/png">
                      PNG — lossless, keeps transparency
                    </option>
                  </select>
                </label>
                {format === "image/png" && (
                  <p className="setting-hint">
                    PNG ignores quality and can be larger. JPG flattens
                    transparency to white.
                  </p>
                )}
              </>
            )}
            {slug === "images-to-pdf" && (
              <p className="setting-hint">
                One image per A4 page, fitted without cropping. Transparent
                areas become white.
              </p>
            )}
            {pdf && (
              <p className="setting-hint">
                Pages follow the file order above. Up to 10 files, 30 MB total,
                and 200 pages. Encrypted files aren’t supported.
              </p>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="button-row">
              <button
                className="button primary"
                disabled={!files.length}
                onClick={run}
              >
                {busy
                  ? "Processing…"
                  : pdf
                    ? "Merge PDFs"
                    : slug === "images-to-pdf"
                      ? "Create PDF"
                      : slug === "image-resizer"
                        ? "Resize image"
                        : "Compress image"}
                <Icon name="ArrowRight" size={17} />
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setFiles([]);
                  setPreview("");
                  changed();
                }}
              >
                Reset
              </button>
            </div>
          </fieldset>
          {busy && (
            <button className="text-button" onClick={cancel}>
              Cancel processing
            </button>
          )}
        </div>
        <div className="file-preview-side">
          <div className="studio-step">
            <span>03</span>
            <h2>
              {result
                ? "Ready for its next adventure."
                : "The result, before the download."}
            </h2>
          </div>
          <div className="image-preview">
            {imageOutput && files.length > 0 && ((result && url) || preview) ? (
              <img
                src={result && url ? url : preview}
                alt={
                  result ? "Processed image preview" : "Original image preview"
                }
              />
            ) : (
              <div className="preview-empty">
                <Icon name={multiple ? "Files" : "Image"} size={62} />
                <strong>
                  {result
                    ? `${result.pages} pages. One neat PDF.`
                    : "A little less work awaits."}
                </strong>
                <p>
                  {multiple
                    ? "Add your files, put them in order, and create your PDF."
                    : "Choose an image to see it here."}
                </p>
              </div>
            )}
          </div>
          {result && (
            <>
              <dl className="file-result-metrics">
                <div>
                  <dt>Original</dt>
                  <dd>{prettyBytes(originalSize)}</dd>
                </div>
                <div>
                  <dt>{imageOutput ? "New size" : "PDF size"}</dt>
                  <dd>{prettyBytes(result.blob.size)}</dd>
                </div>
                <div>
                  <dt>{imageOutput ? "Size change" : "Pages"}</dt>
                  <dd>
                    {imageOutput
                      ? `${saved >= 0 ? "−" : "+"}${Math.abs(saved)}%`
                      : result.pages}
                  </dd>
                </div>
              </dl>
              {result.width && (
                <p className="setting-hint">
                  {result.width} × {result.height} pixels
                  {saved < 0
                    ? " · This format is larger; try WebP or lower quality."
                    : ""}
                </p>
              )}
              <a
                className="button primary download-result"
                href={url}
                download={`toolzpoint-${slug}.${extension}`}
              >
                <Icon name="Download" size={18} />
                Download {extension.toUpperCase()}
              </a>
            </>
          )}
          <p className="result-status" role="status">
            {notice ||
              (busy
                ? "Working locally. Your files are not being uploaded."
                : "")}
          </p>
        </div>
      </div>
    </UtilityFrame>
  );
}

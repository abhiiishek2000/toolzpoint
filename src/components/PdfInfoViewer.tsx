"use client";
import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { UtilityFrame, markUsed } from "./UtilityFrame";
import {
  validateFiles,
  prettyBytes,
  paperSizeLabel,
} from "@/features/files/domain";
type Info = {
  pages: number;
  size: number;
  width: number;
  height: number;
  encrypted: boolean;
  title?: string;
  author?: string;
};
export default function PdfInfoViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function choose(selected: File[]) {
    if (busy) return;
    setError("");
    setInfo(null);
    try {
      validateFiles(selected, "pdf", false);
      const chosen = selected[0]!;
      setFile(chosen);
      setBusy(true);
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await chosen.arrayBuffer(), {
        ignoreEncryption: true,
      });
      const pages = doc.getPageCount();
      if (!pages) throw new Error("This PDF has no pages.");
      const { width, height } = doc.getPage(0).getSize();
      setInfo({
        pages,
        size: chosen.size,
        width,
        height,
        encrypted: doc.isEncrypted,
        title: doc.getTitle() || undefined,
        author: doc.getAuthor() || undefined,
      });
      markUsed("pdf-page-counter");
    } catch (e) {
      setFile(null);
      setError(
        e instanceof Error
          ? e.message
          : "This file could not be read. Try an undamaged PDF.",
      );
    } finally {
      setBusy(false);
    }
    if (input.current) input.current.value = "";
  }
  return (
    <UtilityFrame slug="pdf-page-counter">
      <div className="file-studio">
        <div className="file-input-side">
          <div className="studio-step">
            <span>01</span>
            <h2>Start with a PDF</h2>
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
              void choose(Array.from(e.dataTransfer.files));
            }}
          >
            <div className="upload-symbol">
              <Icon name="FileText" size={32} />
            </div>
            <h3>{file ? file.name : "Drop it like it’s done."}</h3>
            <p>PDF files · up to 20 MB</p>
            <button
              className="button primary"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              <Icon name="Plus" size={18} />
              {file ? "Choose a different PDF" : "Choose a PDF"}
            </button>
            <input
              ref={input}
              className="sr-only"
              type="file"
              aria-label="Choose a PDF file"
              accept="application/pdf,.pdf"
              onChange={(e) => void choose(Array.from(e.target.files ?? []))}
            />
            <span className="drop-note">
              <Icon name="LockKeyhole" size={12} />
              Stays on your device
            </span>
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="file-preview-side">
          <div className="studio-step">
            <span>02</span>
            <h2>
              {info ? "Here’s what’s inside." : "The info, before you dig in."}
            </h2>
          </div>
          {info ? (
            <>
              <dl className="result-stats">
                <div>
                  <dt>Pages</dt>
                  <dd>{info.pages.toLocaleString()}</dd>
                </div>
                <div>
                  <dt>File size</dt>
                  <dd>{prettyBytes(info.size)}</dd>
                </div>
                <div>
                  <dt>Page size (first page)</dt>
                  <dd>
                    {Math.round(info.width)} × {Math.round(info.height)} pt
                    {paperSizeLabel(info.width, info.height)}
                  </dd>
                </div>
                <div>
                  <dt>Encrypted</dt>
                  <dd>
                    {info.encrypted
                      ? "Yes — page contents are not readable without a password"
                      : "No"}
                  </dd>
                </div>
                {info.title && (
                  <div>
                    <dt>Title</dt>
                    <dd>{info.title}</dd>
                  </div>
                )}
                {info.author && (
                  <div>
                    <dt>Author</dt>
                    <dd>{info.author}</dd>
                  </div>
                )}
              </dl>
              <p className="result-status" role="status">
                Read locally. Nothing was uploaded.
              </p>
            </>
          ) : (
            <div className="preview-empty">
              <Icon name="FileText" size={62} />
              <strong>{busy ? "Reading…" : "Nothing to show yet."}</strong>
              <p>Choose a PDF to see its page count and basic info here.</p>
            </div>
          )}
        </div>
      </div>
    </UtilityFrame>
  );
}

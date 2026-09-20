"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { UtilityFrame, markUsed } from "./UtilityFrame";
import { validateFiles, prettyBytes } from "@/features/files/domain";
import type { PdfInfo as Info } from "@/features/files/inspect-pdf";
import { ReportTable } from "./InsightReport";
export default function PdfInfoViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const request = useRef(0);
  const [notice, setNotice] = useState("");
  function stop() {
    request.current++;
    worker.current?.terminate();
    worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    setBusy(false);
  }
  useEffect(
    () => () => {
      request.current++;
      worker.current?.terminate();
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function choose(selected: File[]) {
    if (busy) return;
    stop();
    const id = request.current;
    setError("");
    setInfo(null);
    setFile(null);
    setNotice("");
    try {
      validateFiles(selected, "pdf", false);
      const chosen = selected[0]!;
      setFile(chosen);
      setBusy(true);
      const bytes = await chosen.arrayBuffer();
      if (id !== request.current) return;
      const reader = new Worker(
        new URL("../features/files/pdf-info.worker.ts", import.meta.url),
      );
      worker.current = reader;
      timer.current = setTimeout(() => {
        stop();
        setError("Reading took too long. Try a smaller PDF.");
      }, 45000);
      reader.onmessage = ({
        data,
      }: MessageEvent<{ info?: Info; error?: string }>) => {
        if (id !== request.current) return;
        stop();
        if (data.error) setError(data.error);
        else if (data.info) {
          setInfo(data.info);
          markUsed("pdf-page-counter");
        }
      };
      reader.onerror = () => {
        stop();
        setError(
          "Could not read this PDF. Try an unencrypted, undamaged file.",
        );
      };
      reader.postMessage(bytes, [bytes]);
    } catch (e) {
      if (id !== request.current) return;
      stop();
      setFile(null);
      setError(e instanceof Error ? e.message : "Could not read this PDF.");
    } finally {
      if (input.current) input.current.value = "";
    }
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
            <p>PDF files · up to 20 MB · 1–400 pages · unencrypted</p>
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
          <div className="button-row">
            {busy && (
              <button
                type="button"
                className="button quiet"
                onClick={() => {
                  stop();
                  setNotice("Reading canceled.");
                }}
              >
                Cancel reading
              </button>
            )}
            <button
              type="button"
              className="button quiet"
              onClick={() => {
                stop();
                setFile(null);
                setInfo(null);
                setError("");
                setNotice("");
              }}
            >
              Reset
            </button>
          </div>
          <p role="status">{notice}</p>
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
              <ReportTable
                table={{
                  title: "Page-by-page PDF inspection",
                  headers: [
                    "Page",
                    "Width (pt)",
                    "Height (pt)",
                    "Rotation (degrees)",
                  ],
                  rows: info.pageDetails.map((p) => [
                    p.page,
                    p.width,
                    p.height,
                    p.rotation,
                  ]),
                }}
              />
              <button
                type="button"
                className="button quiet"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      [
                        `Pages: ${info.pages}`,
                        `Bytes: ${info.size}`,
                        "Page,Width (pt),Height (pt),Rotation",
                        ...info.pageDetails.map(
                          (p) =>
                            `${p.page},${p.width},${p.height},${p.rotation}`,
                        ),
                      ].join("\n"),
                    );
                    setNotice("PDF report copied.");
                  } catch {
                    setNotice("Copy unavailable in this browser.");
                  }
                }}
              >
                Copy report
              </button>
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

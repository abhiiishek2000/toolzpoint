"use client";
/* eslint-disable @next/next/no-img-element -- Generated local PNG data URLs cannot benefit from remote image optimization. */
import { useState } from "react";
import { Icon } from "./Icon";
import { UtilityFrame, markUsed } from "./UtilityFrame";
export default function QrCreator({
  compact = false,
  initialImage = "",
}: {
  compact?: boolean;
  initialImage?: string;
}) {
  const [text, setText] = useState("https://example.com");
  const [image, setImage] = useState(initialImage);
  const [color, setColor] = useState("#222348");
  const [size, setSize] = useState(640);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [generatedText, setGeneratedText] = useState(
    initialImage ? "https://example.com" : "",
  );
  const stale = text !== generatedText;
  async function generate() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { createQr } = await import("@/features/qr-code-generator/domain");
      setImage(await createQr(text, color, size));
      setGeneratedText(text);
      setNotice("Your QR code is ready to download.");
      markUsed("qr-code-generator");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not create your QR code.",
      );
    } finally {
      setBusy(false);
    }
  }
  const content = (
    <div className={`qr-creator ${compact ? "compact-qr" : ""}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
      >
        <fieldset disabled={busy}>
          <div className="mini-kicker">
            <Icon name="Zap" size={15} />
            {compact ? "TRY ONE RIGHT HERE" : "CREATE SOMETHING SCANNABLE"}
          </div>
          <h2>{compact ? "Link. Scan. Go." : "Your link, one scan away."}</h2>
          <p>Turn a link or a little text into a QR code you can keep.</p>
          <label className="field" htmlFor={compact ? "quick-qr" : "qr-text"}>
            Link or text
            <input
              id={compact ? "quick-qr" : "qr-text"}
              value={text}
              maxLength={1000}
              onChange={(e) => {
                setText(e.target.value);
                setNotice("");
              }}
              aria-describedby={error ? "qr-error" : undefined}
            />
          </label>
          {!compact && (
            <div className="qr-options">
              <label className="field">
                Ink color
                <select
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    setImage("");
                  }}
                >
                  <option value="#222348">Midnight</option>
                  <option value="#3338bb">Cobalt</option>
                  <option value="#12513d">Forest</option>
                  <option value="#000000">Black</option>
                </select>
              </label>
              <label className="field">
                PNG size
                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setImage("");
                  }}
                >
                  <option value={320}>320 × 320 px</option>
                  <option value={640}>640 × 640 px</option>
                  <option value={1280}>1280 × 1280 px</option>
                </select>
              </label>
            </div>
          )}
          {error && (
            <p id="qr-error" className="error-message" role="alert">
              {error}
            </p>
          )}
          <button className="button primary" type="submit">
            {busy ? "Creating…" : "Create QR code"}
            <Icon name="ArrowRight" size={17} />
          </button>
          {!compact && (
            <button
              className="text-button qr-reset"
              type="button"
              onClick={() => {
                setText("");
                setImage("");
                setGeneratedText("");
                setError("");
                setNotice("");
                setColor("#222348");
                setSize(640);
              }}
            >
              Reset
            </button>
          )}
        </fieldset>
      </form>
      <div className="qr-output">
        <div className="qr-paper">
          {image ? (
            <img
              src={image}
              alt={
                stale
                  ? "Previous QR code; create a new code to apply your changes"
                  : "Generated QR code"
              }
              width={180}
              height={180}
            />
          ) : (
            <div className="qr-empty">
              <Icon name="QrCode" size={76} />
              <span>Your QR preview</span>
            </div>
          )}
        </div>
        {image && !stale ? (
          <a className="qr-download" href={image} download="toolzpoint-qr.png">
            <Icon name="Download" size={15} />
            Download PNG
          </a>
        ) : (
          <span className="qr-caption">
            {stale ? "Create to apply changes" : "No expiry. Yours to keep."}
          </span>
        )}
        {compact && (
          <span className="qr-caption">Static QR · no tracking redirect</span>
        )}
      </div>
      <p className="result-status" role="status">
        {notice}
      </p>
    </div>
  );
  return compact ? (
    content
  ) : (
    <UtilityFrame slug="qr-code-generator">{content}</UtilityFrame>
  );
}

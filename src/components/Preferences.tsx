"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
function themeSubscribe(notify: () => void) {
  window.addEventListener("toolzpoint:theme", notify);
  return () => window.removeEventListener("toolzpoint:theme", notify);
}
export function ThemeToggle() {
  const dark = useSyncExternalStore(
    themeSubscribe,
    () => document.documentElement.dataset.theme === "dark",
    () => false,
  );
  useEffect(() => {
    let isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    try {
      const saved = localStorage.getItem("toolzpoint:v1:theme");
      if (saved) isDark = saved === "dark";
    } catch {}
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    window.dispatchEvent(new Event("toolzpoint:theme"));
  }, []);
  return (
    <button
      className="icon-button"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => {
        document.documentElement.dataset.theme = dark ? "light" : "dark";
        try {
          localStorage.setItem("toolzpoint:v1:theme", dark ? "light" : "dark");
        } catch {}
        window.dispatchEvent(new Event("toolzpoint:theme"));
      }}
    >
      <Icon name={dark ? "Sun" : "Moon"} />
    </button>
  );
}
export function Consent() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("toolzpoint:consent", show);
    return () => window.removeEventListener("toolzpoint:consent", show);
  }, []);
  function choose(value: string) {
    try {
      localStorage.setItem("toolzpoint:v1:consent", value);
      setMessage("Preference saved.");
    } catch {
      setMessage("Preference applies to this visit; storage is unavailable.");
    }
    window.dispatchEvent(new Event("toolzpoint:consent-changed"));
    setOpen(false);
  }
  return (
    <>
      <button className="text-button" onClick={() => setOpen(!open)}>
        Cookie preferences
      </button>
      {open && (
        <section className="consent" aria-label="Cookie preferences">
          <strong>Your privacy choices</strong>
          <p>
            Favorites and settings use local storage. Optional analytics are off
            by default; choosing to allow them loads Google Analytics for
            anonymous usage statistics. No advertising provider is connected.
          </p>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() => choose("rejected")}
            >
              Essential only
            </button>
            <button className="button" onClick={() => choose("accepted")}>
              Allow optional analytics
            </button>
            <button
              className="icon-button"
              aria-label="Close preferences"
              onClick={() => setOpen(false)}
            >
              <Icon name="X" />
            </button>
          </div>
        </section>
      )}
      <span className="sr-only" role="status">
        {message}
      </span>
    </>
  );
}

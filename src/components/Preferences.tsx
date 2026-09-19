"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import { isAnalyticsAllowed } from "@/lib/analytics";
function consentSubscribe(notify: () => void) {
  window.addEventListener("toolzpoint:consent-changed", notify);
  return () => window.removeEventListener("toolzpoint:consent-changed", notify);
}
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
  const allowed = useSyncExternalStore(
    consentSubscribe,
    isAnalyticsAllowed,
    () => true,
  );
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
            Favorites and settings use local storage. Optional analytics are on
            by default, loading Google Analytics for anonymous usage statistics;
            choose “Essential only” to turn it off for this browser. No
            advertising provider is connected.
          </p>
          <p className="setting-hint">
            Currently:{" "}
            {allowed ? "Optional analytics allowed" : "Essential only"}
          </p>
          <div className="button-row">
            <button
              className="button"
              aria-pressed={!allowed}
              onClick={() => choose("rejected")}
            >
              Essential only
            </button>
            <button
              className="button primary"
              aria-pressed={allowed}
              onClick={() => choose("accepted")}
            >
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

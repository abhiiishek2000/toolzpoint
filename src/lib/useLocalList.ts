"use client";
import { useSyncExternalStore } from "react";
import { storageEvent } from "./storage";
function subscribe(notify: () => void) {
  window.addEventListener(storageEvent, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(storageEvent, notify);
    window.removeEventListener("storage", notify);
  };
}
export function useLocalList(key: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(`toolzpoint:v1:${key}`) || "[]";
      } catch {
        return "[]";
      }
    },
    () => "[]",
  );
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string").slice(0, 100)
      : [];
  } catch {
    return [];
  }
}
export function useLocalDate() {
  return useSyncExternalStore(
    subscribe,
    () => {
      const d = new Date();
      return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-");
    },
    () => "",
  );
}

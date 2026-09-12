export const storageEvent = "toolzpoint:storage";
export function readList(key: string): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(`toolzpoint:v1:${key}`) || "[]",
    );
    return Array.isArray(value)
      ? value.filter((x): x is string => typeof x === "string").slice(0, 100)
      : [];
  } catch {
    return [];
  }
}
export function writeList(key: string, values: string[]) {
  try {
    localStorage.setItem(`toolzpoint:v1:${key}`, JSON.stringify(values));
    window.dispatchEvent(new Event(storageEvent));
  } catch {
    /* Storage is optional; core tools continue without it. */
  }
}

import { afterEach, it, expect, vi } from "vitest";
import { setAnalyticsAdapter, track } from "../src/lib/analytics";
import { readList } from "../src/lib/storage";
afterEach(() => {
  setAnalyticsAdapter(undefined);
  vi.unstubAllGlobals();
});
it("keeps telemetry off without consent and allows only known properties", () => {
  const sent = vi.fn();
  setAnalyticsAdapter({ track: sent });
  vi.stubGlobal("localStorage", { getItem: () => null });
  track("tool_run_success", { toolSlug: "word-counter" });
  expect(sent).not.toHaveBeenCalled();
  vi.stubGlobal("localStorage", { getItem: () => "accepted" });
  const incoming = { toolSlug: "word-counter", rawInput: "secret input" };
  track("tool_run_success", incoming);
  expect(sent).toHaveBeenCalledWith("tool_run_success", {
    toolSlug: "word-counter",
  });
  expect(JSON.stringify(sent.mock.calls)).not.toContain("secret");
});
it("contains adapter failures and blocked storage", () => {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error("blocked");
    },
  });
  expect(() =>
    track("tool_view", { toolSlug: "bmi-calculator" }),
  ).not.toThrow();
  expect(readList("recents")).toEqual([]);
});
it("recovers malformed local history and filters foreign values", () => {
  vi.stubGlobal("localStorage", { getItem: () => "{broken" });
  expect(readList("recents")).toEqual([]);
  vi.stubGlobal("localStorage", {
    getItem: () => '["word-counter",3,null,{"raw":"text"}]',
  });
  expect(readList("recents")).toEqual(["word-counter"]);
});

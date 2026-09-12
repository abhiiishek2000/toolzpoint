type EventName =
  | "tool_view"
  | "tool_run_attempt"
  | "tool_run_success"
  | "tool_run_error"
  | "result_copy"
  | "favorite_toggle"
  | "search_submit"
  | "related_tool_click";
type Properties = {
  toolSlug?: string;
  executionMode?: "client";
  errorCode?: "INVALID_INPUT" | "CLIPBOARD_UNAVAILABLE";
  durationBucket?: "fast" | "slow";
  sizeBucket?: "small" | "large";
  state?: boolean;
};
export type AnalyticsAdapter = {
  track: (name: EventName, properties: Properties) => void;
};
let adapter: AnalyticsAdapter | undefined;
export function setAnalyticsAdapter(value: AnalyticsAdapter | undefined) {
  adapter = value;
}
export function track(name: EventName, properties: Properties) {
  try {
    if (localStorage.getItem("toolzpoint:v1:consent") !== "accepted") return;
    const safe: Properties = {};
    if (properties.toolSlug) safe.toolSlug = properties.toolSlug;
    if (properties.executionMode) safe.executionMode = properties.executionMode;
    if (properties.errorCode) safe.errorCode = properties.errorCode;
    if (properties.durationBucket)
      safe.durationBucket = properties.durationBucket;
    if (properties.sizeBucket) safe.sizeBucket = properties.sizeBucket;
    if (typeof properties.state === "boolean") safe.state = properties.state;
    adapter?.track(name, safe);
  } catch {
    /* Analytics never interrupts a tool. */
  }
}

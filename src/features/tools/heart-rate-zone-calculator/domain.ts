import { numeric } from "../shared";
const zoneNames = [
  "Zone 1 · Warm up (50–60%)",
  "Zone 2 · Fat burn (60–70%)",
  "Zone 3 · Cardio (70–80%)",
  "Zone 4 · Hard (80–90%)",
  "Zone 5 · Peak (90–100%)",
] as const;
const bounds = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
export function heartRateZones(age: number) {
  numeric.int().min(10).max(100).parse(age);
  const max = 220 - age;
  const result: Record<string, string | number> = {
    "Maximum heart rate (bpm)": max,
  };
  zoneNames.forEach((name, i) => {
    const low = Math.round(max * bounds[i]!);
    const high = Math.round(max * bounds[i + 1]!);
    result[name] = `${low}–${high} bpm`;
  });
  return result;
}

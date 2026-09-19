import { z } from "zod";
import { numeric } from "../shared";
export type TemperatureUnit = "C" | "F" | "K";
const unitSchema = z.enum(["C", "F", "K"]);
function toCelsius(value: number, unit: TemperatureUnit) {
  if (unit === "C") return value;
  if (unit === "F") return ((value - 32) * 5) / 9;
  return value - 273.15;
}
function fromCelsius(celsius: number, unit: TemperatureUnit) {
  if (unit === "C") return celsius;
  if (unit === "F") return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}
export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit,
) {
  numeric.min(-1000).max(1000000).parse(value);
  unitSchema.parse(from);
  unitSchema.parse(to);
  const celsius = toCelsius(value, from);
  if (celsius < -273.15)
    throw new Error("That temperature is below absolute zero.");
  return { "Converted temperature": fromCelsius(celsius, to) };
}

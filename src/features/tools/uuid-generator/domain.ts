import { z } from "zod";
export function uuids(
  count: number,
  generate: () => string = () => crypto.randomUUID(),
) {
  z.number().int().min(1).max(100).parse(count);
  return Array.from({ length: count }, generate).join("\n");
}

import { z } from "zod";
export const textSchema = z
  .string()
  .max(100000, "Use at most 100,000 characters.");
export const numeric = z.number().finite();

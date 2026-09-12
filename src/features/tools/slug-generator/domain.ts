import { z } from "zod";
import { textSchema } from "../shared";
export function slugify(input: string, separator = "-", unicode = false) {
  textSchema.parse(input);
  z.enum(["-", "_"]).parse(separator);
  return input
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(unicode ? /[^\p{L}\p{N}]+/gu : /[^a-z0-9]+/g, separator)
    .replace(/^[-_]+|[-_]+$/g, "");
}

import { textSchema } from "../shared";
export function wordCount(input: string) {
  const text = textSchema.parse(input);
  const words = text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) ?? [];
  return {
    Words: words.length,
    Characters: Array.from(text).length,
    "Without spaces": Array.from(text.replace(/\s/gu, "")).length,
    Sentences: text.trim()
      ? text.split(/[.!?。！？]+/u).filter((v) => v.trim()).length
      : 0,
    "Reading time (min)": Math.ceil(words.length / 200),
  };
}

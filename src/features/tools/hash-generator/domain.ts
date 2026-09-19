import { z } from "zod";
import { textSchema } from "../shared";
export const hashAlgorithms = [
  "SHA-1",
  "SHA-256",
  "SHA-384",
  "SHA-512",
] as const;
export type HashAlgorithm = (typeof hashAlgorithms)[number];
export async function hashText(input: string, algorithm: HashAlgorithm) {
  textSchema.min(1, "Add some text first.").parse(input);
  z.enum(hashAlgorithms).parse(algorithm);
  const digest = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(input),
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

import { ZodError } from "zod";
import * as domain from "./index";
type RunOptions = {
  slug: string;
  values: Record<string, string>;
  input: string;
  mode: string;
  scope: string;
  separator: string;
  unicode: boolean;
  minify: boolean;
  localDate: string;
};
export function executeTool({
  slug,
  values,
  input,
  mode,
  scope,
  separator,
  unicode,
  minify,
  localDate,
}: RunOptions) {
  try {
    const n = (key: string) => {
      if (!values[key]?.trim()) throw new Error(`Enter ${key}.`);
      return Number(values[key]);
    };
    let output: string | Record<string, string | number>;
    switch (slug) {
      case "word-counter":
        output = domain.wordCount(input);
        break;
      case "json-formatter":
        output = domain.formatJson(input, minify);
        break;
      case "base64-encoder-decoder":
        output = domain.base64(input, mode === "decode");
        break;
      case "url-encoder-decoder":
        output = domain.urlCode(input, mode === "decode", scope === "full");
        break;
      case "slug-generator":
        output = domain.slugify(input, separator, unicode);
        if (!output)
          throw new Error("Add letters or numbers, or enable Unicode letters.");
        break;
      case "percentage-calculator":
        output = {
          Result: domain.percentage(
            n("a"),
            n("b"),
            values.mode as "of" | "is" | "change",
          ),
        };
        break;
      case "age-calculator":
        output = domain.age(values.birth ?? "", values.asOf || localDate);
        break;
      case "uuid-generator":
        output = domain.uuids(n("count"));
        break;
      case "utm-builder":
        output = domain.utm({
          url: values.url ?? "",
          source: values.source ?? "",
          medium: values.medium ?? "",
          campaign: values.campaign ?? "",
          term: values.term,
          content: values.content,
        });
        break;
      case "sip-calculator":
        output = domain.sip(
          n("monthly"),
          n("rate"),
          n("years"),
          values.timing as "start" | "end",
        );
        break;
      case "bmi-calculator":
        output = domain.bmi(
          n("weight") * (values.units === "imperial" ? 0.45359237 : 1),
          n("height") * (values.units === "imperial" ? 2.54 : 1),
          n("age"),
        );
        break;
      case "nutrition-calculator":
        output = domain.nutrition({
          weight: n("weight"),
          height: n("height"),
          age: n("age"),
          sex: values.sex as "male" | "female",
          activity: n("activity"),
          protein: n("protein"),
          fat: n("fat"),
        });
        break;
      default:
        throw new Error("This tool is unavailable.");
    }
    return output;
  } catch (e) {
    throw new Error(
      e instanceof ZodError
        ? e.issues.map((i) => `${i.path.join(" ")}: ${i.message}`).join(" ")
        : e instanceof Error
          ? e.message
          : "Check your input and try again.",
    );
  }
}

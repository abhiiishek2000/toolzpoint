import { expansionSlugs, runExpansion } from "./expansion/domain";
import { runTextUtility, textUtilitySlugs } from "./text-utilities/domain";
import { ZodError } from "zod";
import * as domain from "./index";
export type RunOptions = {
  slug: string;
  values: Record<string, string>;
  input: string;
  mode: string;
  scope: string;
  separator: string;
  unicode: boolean;
  minify: boolean;
  localDate: string;
  caseMode: string;
  algorithm: string;
};
export async function executeTool({
  slug,
  values,
  input,
  mode,
  scope,
  separator,
  unicode,
  minify,
  localDate,
  caseMode,
  algorithm,
}: RunOptions) {
  try {
    if (textUtilitySlugs.some((tool) => tool === slug))
      return runTextUtility(slug, input, values);
    if (expansionSlugs.includes(slug)) return runExpansion(slug, input, values);
    const n = (key: string) => {
      if (!values[key]?.trim()) throw new Error(`Enter ${key}.`);
      return Number(values[key]);
    };
    const d = (key: string) => {
      if (!values[key]?.trim()) throw new Error(`Enter ${key}.`);
      return values[key]!;
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
      case "password-generator":
        output = domain.generatePasswords({
          length: n("length"),
          count: n("count"),
          lower: values.lower === "true",
          upper: values.upper === "true",
          numbers: values.numbers === "true",
          symbols: values.symbols === "true",
        });
        break;
      case "coin-flip":
        output = domain.flipCoins(n("count"));
        break;
      case "emi-loan-calculator":
        output = domain.emiLoan(n("principal"), n("rate"), n("years"));
        break;
      case "compound-interest-calculator":
        output = domain.compoundInterest(
          n("principal"),
          n("rate"),
          n("years"),
          n("frequency") as 1 | 2 | 4 | 12 | 365,
        );
        break;
      case "temperature-converter":
        output = domain.convertTemperature(
          n("value"),
          values.from as "C" | "F" | "K",
          values.to as "C" | "F" | "K",
        );
        break;
      case "discount-calculator":
        output = domain.discount(n("price"), n("percentOff"));
        break;
      case "ideal-weight-calculator":
        output = domain.idealWeight(
          n("height"),
          values.sex as "male" | "female",
        );
        break;
      case "text-case-converter":
        output = domain.convertCase(
          input,
          caseMode as
            | "upper"
            | "lower"
            | "title"
            | "sentence"
            | "camel"
            | "snake"
            | "kebab",
        );
        break;
      case "hash-generator":
        output = await domain.hashText(
          input,
          algorithm as "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512",
        );
        break;
      case "jwt-decoder":
        output = domain.decodeJwt(input);
        break;
      case "meta-tag-generator":
        output = domain.metaTags({
          title: values.title ?? "",
          description: values.description ?? "",
          url: values.url ?? "",
          image: values.image,
          siteName: values.siteName,
        });
        break;
      case "date-difference-calculator":
        output = domain.dateDifference(d("start"), values.end || localDate);
        break;
      case "pregnancy-due-date-calculator":
        output = domain.pregnancyDueDate(
          d("lastPeriod"),
          n("cycleLength"),
          values.asOf || localDate,
        );
        break;
      case "ovulation-calculator":
        output = domain.ovulation(d("lastPeriod"), n("cycleLength"));
        break;
      case "gst-calculator":
        output = domain.gst(
          n("amount"),
          n("rate"),
          values.mode as "exclusive" | "inclusive",
        );
        break;
      case "water-intake-calculator":
        output = domain.waterIntake(
          n("weight"),
          values.activity as "sedentary" | "moderate" | "active",
        );
        break;
      case "body-fat-calculator":
        output = domain.bodyFat({
          sex: values.sex as "male" | "female",
          height: n("height"),
          waist: n("waist"),
          neck: n("neck"),
          hip: values.hip?.trim() ? n("hip") : undefined,
        });
        break;
      case "waist-hip-ratio-calculator":
        output = domain.waistHipRatio(
          values.sex as "male" | "female",
          n("waist"),
          n("hip"),
        );
        break;
      case "heart-rate-zone-calculator":
        output = domain.heartRateZones(n("age"));
        break;
      case "savings-goal-calculator":
        output = domain.savingsGoal(
          n("goal"),
          n("current"),
          n("months"),
          n("rate"),
        );
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

import { executeTool } from "./runner";
import { toolInsight, type ToolInsight } from "./insights";
import { unitFactors } from "./expansion/domain";
import {
  convertTemperature,
  type TemperatureUnit,
} from "./temperature-converter/domain";

export type ScheduleRow = {
  period: number;
  opening: number;
  contribution: number;
  interest: number;
  balance: number;
  invested: number;
};
export type ResultSchedule = {
  kind: "growth" | "loan" | "inflation";
  note: string;
  monthly: ScheduleRow[];
  yearly: ScheduleRow[];
};
export type ResultDetails = {
  insight?: ToolInsight;
  steps: string[];
  schedule?: ResultSchedule;
  table?: { title: string; headers: string[]; rows: (string | number)[][] };
  text?: {
    inputCharacters: number;
    outputCharacters: number;
    outputLines: number;
  };
};

const number = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumSignificantDigits: 15 }).format(n);

function annualRows(rows: ScheduleRow[]) {
  const years: ScheduleRow[] = [];
  for (let i = 0; i < rows.length; i += 12) {
    const group = rows.slice(i, i + 12);
    const first = group[0]!;
    const last = group[group.length - 1]!;
    years.push({
      period: last.period / 12,
      opening: first.opening,
      contribution: group.reduce((sum, row) => sum + row.contribution, 0),
      interest: group.reduce((sum, row) => sum + row.interest, 0),
      balance: last.balance,
      invested: last.invested,
    });
  }
  return years;
}

// Called only after executeTool has validated the inputs. Schedules retain full
// precision; rounding belongs to display/export, never the next period's balance.
function buildDetails(
  slug: string,
  values: Record<string, string>,
  input: string,
  output: Awaited<ReturnType<typeof executeTool>>,
): ResultDetails {
  const n = (key: string) => Number(values[key]);
  const result = typeof output === "string" ? {} : output;
  const details: ResultDetails = { steps: [] };
  const scheduleTools = [
    "sip-calculator",
    "compound-interest-calculator",
    "emi-loan-calculator",
    "mortgage-calculator",
    "savings-goal-calculator",
    "fd-calculator",
    "rd-calculator",
    "simple-interest-calculator",
    "inflation-calculator",
  ];
  if (scheduleTools.includes(slug)) {
    const loan = ["emi-loan-calculator", "mortgage-calculator"].includes(slug);
    const inflation = slug === "inflation-calculator";
    const saving = slug === "savings-goal-calculator";
    const sip = slug === "sip-calculator";
    const rd = slug === "rd-calculator";
    const simple = slug === "simple-interest-calculator";
    const months =
      saving || rd
        ? n("months")
        : loan
          ? Math.round(n("years") * 12)
          : n("years") * 12;
    const initial =
      sip || rd
        ? 0
        : saving
          ? n("current")
          : inflation
            ? n("amount")
            : slug === "mortgage-calculator"
              ? n("price") - n("down")
              : n("principal");
    const contribution =
      sip || rd
        ? n("monthly")
        : saving
          ? Number(result["Monthly deposit needed"])
          : loan
            ? Number(
                result[
                  slug === "mortgage-calculator"
                    ? "Monthly principal & interest"
                    : "Monthly EMI"
                ],
              )
            : 0;
    const rate = n("rate") / 1200;
    const frequency = slug === "fd-calculator" ? 4 : n("frequency");
    let balance = initial;
    let invested = initial;
    const rows: ScheduleRow[] = [];
    if (months === 0)
      rows.push({
        period: 0,
        opening: initial,
        contribution: 0,
        interest: 0,
        balance: initial,
        invested: initial,
      });
    // Ceiling plus an exact final endpoint preserves fractional-year inputs.
    for (let i = 1; i <= Math.ceil(months); i++) {
      const period = Math.min(i, months);
      const opening = balance;
      let paid = contribution;
      let interest = 0;
      if (loan) {
        interest = opening * rate;
        paid = Math.min(contribution, opening + interest);
        balance = Math.max(0, opening + interest - paid);
        if (i === Math.ceil(months)) {
          paid = opening + interest;
          balance = 0;
        }
        invested += paid - interest;
      } else if (sip || saving) {
        interest =
          (opening + (sip && values.timing === "start" ? paid : 0)) * rate;
        balance = opening + paid + interest;
        invested += paid;
      } else if (rd) {
        interest = i % 3 === 0 ? ((opening + paid) * n("rate")) / 400 : 0;
        balance = opening + paid + interest;
        invested += paid;
      } else {
        balance = inflation
          ? initial * Math.pow(1 + n("rate") / 100, period / 12)
          : simple
            ? initial * (1 + ((n("rate") / 100) * period) / 12)
            : initial *
              Math.pow(
                1 + n("rate") / 100 / frequency,
                (frequency * period) / 12,
              );
        interest = balance - opening;
      }
      rows.push({
        period,
        opening,
        contribution: paid,
        interest,
        balance,
        invested,
      });
    }
    const note = loan
      ? "Fixed rate, equal monthly payments, no fees or prepayments. The final payment clears the remaining balance. Mortgage tax and insurance are separate from this loan schedule."
      : rd
        ? "Illustrative model: deposits are added at the start of each month; interest is credited to the full balance at each third month. An incomplete quarter earns no extra interest. Bank RD methods can differ."
        : inflation
          ? "Shows the future cost of the same basket at a constant inflation rate, not an investment return."
          : simple
            ? "Simple interest is earned only on the original principal. No deposits, tax or fees are included."
            : sip
              ? `Deposits at the ${values.timing === "start" ? "beginning" : "end"} of each month. Monthly rate = annual rate ÷ 12. Returns are constant assumptions, not guaranteed market returns. Tax, fees and inflation are excluded.`
              : saving
                ? "Deposits at month-end, with a constant annual rate divided by 12. Tax, fees and inflation are excluded."
                : "No additional deposits, tax or fees. Monthly checkpoints use fractional compounding periods where needed; they are modeled values, not bank interest-credit dates. The final row includes any partial month.";
    details.schedule = {
      kind: loan ? "loan" : inflation ? "inflation" : "growth",
      note,
      monthly: rows,
      yearly: annualRows(rows),
    };
    details.steps = loan
      ? [
          `Loan principal: ${number(initial)} over ${number(months)} monthly payments.`,
          `Monthly rate: ${number(n("rate") / 12)}%. Interest each month = opening balance × monthly rate.`,
          "Principal repaid = payment − interest. Closing balance = opening balance − principal repaid.",
        ]
      : inflation
        ? [
            `Starting cost: ${number(initial)}. Assumed annual inflation: ${number(n("rate"))}%.`,
            "Future equivalent cost = starting cost × (1 + annual inflation rate) ^ years.",
          ]
        : simple
          ? [
              `Interest = ${number(initial)} × ${number(n("rate") / 100)} × ${number(n("years"))} years.`,
              "Closing balance = original principal + accumulated simple interest.",
            ]
          : sip || saving || rd
            ? [
                `Starting balance: ${number(initial)}. Monthly deposit: ${number(contribution)}.`,
                "Closing balance = opening balance + deposits + interest for that period.",
              ]
            : [
                `Principal: ${number(initial)}. Compounding periods per year: ${frequency}.`,
                `Amount = ${number(initial)} × (1 + ${number(n("rate") / 100)} ÷ ${frequency}) ^ (${frequency} × ${number(n("years"))}).`,
                "Interest earned = maturity amount − original principal.",
              ];
  }
  const factors = unitFactors[slug];
  if (factors) {
    details.steps = [
      `${number(n("value"))} ${values.from} × ${number(factors[values.from!]! / factors[values.to!]!)} = ${number(Number(Object.values(result)[0]))} ${values.to}.`,
    ];
    details.table = {
      title: "Equivalent values in every supported unit",
      headers: ["Unit", "Equivalent value"],
      rows: Object.entries(factors).map(([unit, factor]) => [
        unit,
        (n("value") * factors[values.from!]!) / factor,
      ]),
    };
  }
  if (slug === "percentage-calculator") {
    details.steps = [
      values.mode === "of"
        ? `${values.a} ÷ 100 × ${values.b} = ${number(Number(result.Result))}.`
        : values.mode === "is"
          ? `${values.a} ÷ ${values.b} × 100 = ${number(Number(result.Result))}%.`
          : `(${values.b} − ${values.a}) ÷ |${values.a}| × 100 = ${number(Number(result.Result))}%. The denominator uses the absolute starting value.`,
    ];
  }
  if (slug === "discount-calculator")
    details.steps = [
      `Savings = ${values.price} × ${values.percentOff} ÷ 100 = ${number(Number(result["You save"]))}.`,
      `Sale price = ${values.price} − ${number(Number(result["You save"]))} = ${number(Number(result["Sale price"]))}.`,
    ];
  if (slug === "gst-calculator")
    details.steps = [
      values.mode === "inclusive"
        ? `Base price = ${values.amount} ÷ (1 + ${values.rate} ÷ 100).`
        : `GST = ${values.amount} × ${values.rate} ÷ 100.`,
      `Base price ${number(Number(result["Base price"]))} + GST ${number(Number(result["GST amount"]))} = total ${number(Number(result["Total price"]))}.`,
      "The CGST/SGST split is half the calculated tax each; select the applicable tax treatment separately.",
    ];
  if (slug === "roi-calculator")
    details.steps = [
      `Net gain = ${values.proceeds} − ${values.cost} = ${number(Number(result["Net gain"]))}.`,
      `ROI = net gain ÷ ${values.cost} × 100 = ${number(Number(result["ROI (%)"]))}%. This is total ROI, not annualized.`,
    ];
  if (typeof output === "string") {
    details.text = {
      inputCharacters: Array.from(input).length,
      outputCharacters: Array.from(output).length,
      outputLines: output ? output.split(/\r?\n/).length : 0,
    };
  }
  if (slug === "temperature-converter") {
    details.table = {
      title: "Equivalent temperature on all three scales",
      headers: ["Scale", "Temperature"],
      rows: (["C", "F", "K"] as TemperatureUnit[]).map((unit) => [
        unit,
        convertTemperature(n("value"), values.from as TemperatureUnit, unit)[
          "Converted temperature"
        ],
      ]),
    };
  }
  return details;
}

export async function executeDetailedTool(
  options: Parameters<typeof executeTool>[0],
) {
  if (options.slug === "date-difference-calculator" && !options.values.end)
    options = {
      ...options,
      values: { ...options.values, end: options.localDate },
    };
  const output = await executeTool(options);
  return {
    output,
    details: {
      ...buildDetails(options.slug, options.values, options.input, output),
      insight: toolInsight(options, output),
    },
  };
}

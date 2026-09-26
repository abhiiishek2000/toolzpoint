import { describe, expect, it } from "vitest";
import { executeDetailedTool } from "../src/features/tools/result-details";
import { csvCell } from "../src/lib/result-export";
import { resultGuides, toolSeo, toolSteps } from "../src/lib/tool-experience";
import { tools } from "../src/lib/tool-registry";

const run = (slug: string, values: Record<string, string>, input = "") =>
  executeDetailedTool({
    slug,
    values,
    input,
    mode: "encode",
    scope: "component",
    separator: "-",
    unicode: false,
    minify: false,
    localDate: "2026-09-19",
    caseMode: "upper",
    algorithm: "SHA-256",
  });

describe("financial schedules", () => {
  it("shows start/end deposit timing with independently checked monthly balances", async () => {
    const values = { monthly: "100", rate: "12", years: "1", timing: "start" };
    const start = (await run("sip-calculator", values)).details.schedule!;
    const end = (await run("sip-calculator", { ...values, timing: "end" }))
      .details.schedule!;
    expect(start.monthly[0]).toMatchObject({
      opening: 0,
      contribution: 100,
      interest: 1,
      balance: 101,
    });
    expect(start.monthly[1]!.balance).toBeCloseTo(203.01, 8);
    expect(end.monthly[0]!.balance).toBe(100);
    expect(end.monthly[1]!.balance).toBe(201);
    expect(start.yearly[0]!.contribution).toBe(1200);
    expect(start.yearly[0]!.balance).toBeCloseTo(1280.932804332895, 8);
    expect(end.yearly[0]!.balance).toBeCloseTo(1268.250301319697, 8);
  });
  it("keeps zero interest exact over the maximum SIP horizon", async () => {
    const report = await run("sip-calculator", {
      monthly: "100",
      rate: "0",
      years: "50",
      timing: "start",
    });
    expect(report.details.schedule!.monthly).toHaveLength(600);
    expect(report.details.schedule!.yearly.at(-1)).toMatchObject({
      interest: 0,
      balance: 60000,
      invested: 60000,
    });
  });
  it("uses the actual final endpoint for fractional-year compounding", async () => {
    const report = await run("compound-interest-calculator", {
      principal: "1000",
      rate: "10",
      years: "1.1",
      frequency: "1",
    });
    const schedule = report.details.schedule!;
    expect(schedule.monthly).toHaveLength(14);
    expect(schedule.yearly[0]!.balance).toBeCloseTo(1100, 10);
    expect(schedule.monthly.at(-1)!.period).toBeCloseTo(13.2, 10);
    expect(schedule.yearly.at(-1)!.period).toBeCloseTo(1.1, 10);
    expect(schedule.yearly.at(-1)!.balance).toBeCloseTo(1110.534241054575, 8);
    expect(schedule.yearly.at(-1)!.balance).toBe(
      (report.output as Record<string, number>)["Maturity amount"],
    );
  });
  it("amortizes a zero-rate loan and separates mortgage costs from principal", async () => {
    const report = await run("mortgage-calculator", {
      price: "1500",
      down: "300",
      rate: "0",
      years: "1",
      tax: "120",
      insurance: "240",
    });
    expect(report.output).toMatchObject({
      "Loan amount": 1200,
      "Monthly principal & interest": 100,
      "Monthly tax & insurance": 30,
      "Total monthly payment": 130,
    });
    expect(report.details.schedule!.monthly[0]).toMatchObject({
      opening: 1200,
      contribution: 100,
      interest: 0,
      balance: 1100,
    });
    expect(report.details.schedule!.yearly[0]).toMatchObject({
      contribution: 1200,
      balance: 0,
    });
  });
  it("clears a positive-rate loan and preserves the balance identity each month", async () => {
    const report = await run("emi-loan-calculator", {
      principal: "1200",
      rate: "12",
      years: "1",
    });
    expect(
      (report.output as Record<string, number>)["Monthly EMI"],
    ).toBeCloseTo(106.61854641401, 8);
    const rows = report.details.schedule!.monthly;
    expect(rows[0]!.interest).toBe(12);
    expect(rows.at(-1)!.balance).toBe(0);
    rows.forEach((row) =>
      expect(row.opening + row.interest - row.contribution).toBeCloseTo(
        row.balance,
        8,
      ),
    );
  });
  it("handles near-zero interest without catastrophic cancellation", async () => {
    const loan = await run("emi-loan-calculator", {
      principal: "1200",
      rate: "0.000000000001",
      years: "1",
    });
    expect((loan.output as Record<string, number>)["Monthly EMI"]).toBeCloseTo(
      100,
      8,
    );
    const saving = await run("savings-goal-calculator", {
      goal: "1200",
      current: "0",
      months: "12",
      rate: "0.000000000001",
    });
    expect(
      (saving.output as Record<string, number>)["Monthly deposit needed"],
    ).toBeCloseTo(100, 8);
  });
  it("shows zero deposits when existing savings can grow past the goal", async () => {
    const report = await run("savings-goal-calculator", {
      goal: "1050",
      current: "1000",
      months: "12",
      rate: "12",
    });
    expect(report.output).toMatchObject({ "Monthly deposit needed": 0 });
    expect(report.details.schedule!.monthly[0]!.balance).toBe(1010);
    expect(report.details.schedule!.yearly[0]!.balance).toBeCloseTo(
      1126.82503013197,
      8,
    );
  });
  it("reconciles the recurring-deposit model including incomplete quarters", async () => {
    const report = await run("rd-calculator", {
      monthly: "100",
      rate: "12",
      months: "4",
    });
    const rows = report.details.schedule!.monthly;
    expect(rows.map((row) => row.balance)).toEqual([100, 200, 309, 409]);
    expect(report.details.schedule!.yearly[0]).toMatchObject({
      contribution: 400,
      interest: 9,
      balance: 409,
    });
  });
  it("explains FD compounding, simple interest and inflation separately", async () => {
    const fd = await run("fd-calculator", {
      principal: "1000",
      rate: "8",
      years: "1",
    });
    expect(fd.details.schedule!.yearly[0]!.balance).toBeCloseTo(1082.43216, 8);
    const simple = await run("simple-interest-calculator", {
      principal: "1000",
      rate: "10",
      years: "2",
    });
    expect(simple.details.schedule!.yearly.map((row) => row.balance)).toEqual([
      1100, 1200,
    ]);
    const inflation = await run("inflation-calculator", {
      amount: "1000",
      rate: "10",
      years: "1",
    });
    expect(inflation.output).toMatchObject({
      "Future equivalent value": 1100,
      "Additional amount needed": 100,
    });
    expect(
      (inflation.output as Record<string, number>)[
        "Purchasing power in today’s money"
      ],
    ).toBeCloseTo(909.09090909, 7);
    expect(inflation.details.schedule!.kind).toBe("inflation");
  });
  it("rejects unbounded, invalid, and blank inputs before generating rows", async () => {
    for (const years of ["", "Infinity", "100000", "-1"])
      await expect(
        run("sip-calculator", {
          monthly: "100",
          rate: "10",
          years,
          timing: "start",
        }),
      ).rejects.toThrow();
    await expect(
      run("compound-interest-calculator", {
        principal: "1000",
        rate: "10",
        years: "1",
        frequency: "3",
      }),
    ).rejects.toThrow();
  });
});

it("provides a conversion reference table and truthful text counts", async () => {
  const weight = await run("weight-converter", {
    value: "1",
    from: "kg",
    to: "g",
  });
  expect(weight.details.table!.rows).toContainEqual(["g", 1000]);
  const text = await run("text-case-converter", {}, "Hello 👋");
  expect(text.output).toBe("HELLO 👋");
  expect(text.details.text).toEqual({
    inputCharacters: 7,
    outputCharacters: 7,
    outputLines: 1,
  });
});

it("covers every published tool with specific guidance and search metadata", () => {
  expect(Object.keys(resultGuides).sort()).toEqual(
    tools.map((tool) => tool.slug).sort(),
  );
  expect(new Set(tools.map((tool) => toolSeo(tool).description)).size).toBe(
    112,
  );
  for (const tool of tools) {
    expect(resultGuides[tool.slug]!.length).toBeGreaterThan(60);
    expect(toolSteps(tool)).toHaveLength(3);
    expect(toolSeo(tool).title.length).toBeLessThan(80);
    expect(toolSeo(tool).description.length).toBeLessThan(195);
  }
});

it("escapes CSV text and prevents spreadsheet formula injection", () => {
  expect(csvCell('a,"b"')).toBe('"a,""b"""');
  expect(csvCell("=1+1")).toBe('"\'=1+1"');
  expect(csvCell("@SUM(A1)")).toBe('"\'@SUM(A1)"');
  expect(csvCell(-2)).toBe('"-2"');
});

it("explains negative percentage baselines and preserves small conversion factors", async () => {
  const percentage = await run("percentage-calculator", {
    a: "-100",
    b: "-50",
    mode: "change",
  });
  expect(percentage.output).toEqual({ Result: 50 });
  expect(percentage.details.steps[0]).toContain("÷ |-100|");
  const bytes = await run("data-storage-converter", {
    value: "1",
    from: "B",
    to: "TB",
  });
  expect(bytes.details.steps[0]).toContain("0.000000000001");
  const temperature = await run("temperature-converter", {
    value: "0",
    from: "C",
    to: "F",
  });
  expect(temperature.details.table!.rows).toEqual([
    ["C", 0],
    ["F", 32],
    ["K", 273.15],
  ]);
});

it("shows the starting balance for a zero-duration scenario", async () => {
  const report = await run("simple-interest-calculator", {
    principal: "1000",
    rate: "10",
    years: "0",
  });
  expect(report.details.schedule!.yearly).toEqual([
    {
      period: 0,
      opening: 1000,
      contribution: 0,
      interest: 0,
      balance: 1000,
      invested: 1000,
    },
  ]);
});

describe("individual report reconciliation", () => {
  it("explains course weighting and overnight work with independent examples", async () => {
    const gpa = await run("gpa-calculator", {}, "A,3\nB,1");
    expect(gpa.output).toMatchObject({ GPA: 3.75, "Total credits": 4 });
    expect(gpa.details.insight!.tables[0]!.rows).toEqual([
      [1, "A", 3, 4, 12],
      [2, "B", 1, 3, 3],
    ]);
    const shift = await run("work-hours-calculator", {}, "22:00,06:00,30");
    expect(shift.details.insight!.tables[0]!.rows).toEqual([
      [1, "22:00", "06:00", "Next day", 30, 7.5],
    ]);
  });
  it("preserves duplicate query values and reports actual UTF-8 bytes", async () => {
    const query = await run(
      "url-parser",
      {},
      "https://example.com/?tag=red&tag=blue&name=Ada+Lovelace",
    );
    expect(query.details.insight!.tables[0]!.rows).toEqual([
      [1, "tag", "red"],
      [2, "tag", "blue"],
      [3, "name", "Ada Lovelace"],
    ]);
    const binary = await run("binary-text-converter", { mode: "encode" }, "é");
    expect(binary.details.insight!.tables[0]!.rows).toEqual([
      [1, 195, "C3", "11000011"],
      [2, 169, "A9", "10101001"],
    ]);
  });
  it("reconciles nutrient energy and whole-unit break-even scenarios", async () => {
    const macro = await run("macro-calculator", {
      calories: "2000",
      protein: "20",
      fat: "30",
    });
    expect(macro.details.insight!.tables[0]!.rows[0]).toEqual([
      "Protein",
      20,
      400,
      4,
      100,
    ]);
    expect(macro.details.insight!.tables[0]!.rows[2]).toEqual([
      "Carbohydrate",
      50,
      1000,
      4,
      250,
    ]);
    const breakeven = await run("break-even-calculator", {
      fixed: "100",
      price: "20",
      variable: "5",
    });
    expect(breakeven.details.insight!.tables[0]!.rows).toEqual([
      [6, 120, 130, -10],
      [7, 140, 135, 5],
      [8, 160, 140, 20],
    ]);
  });
  it("reports transformations without losing original sort positions", async () => {
    const sorted = await run(
      "text-sorter",
      { order: "ascending" },
      "pear\napple\npear",
    );
    expect(sorted.details.insight!.tables[0]!.rows).toEqual([
      [1, 2, 5, "apple"],
      [2, 1, 4, "pear"],
      [3, 3, 4, "pear"],
    ]);
    const words = await run("word-counter", {}, "Red red blue");
    expect(words.details.insight!.tables[0]!.rows[0]!.slice(0, 2)).toEqual([
      "red",
      2,
    ]);
    expect(words.details.insight!.tables[0]!.rows[0]![2]).toBeCloseTo(
      66.66666667,
      6,
    );
  });
});

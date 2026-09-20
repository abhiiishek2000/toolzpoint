"use client";
import { useState } from "react";
import type {
  ResultDetails as Details,
  ResultSchedule,
  ScheduleRow,
} from "@/features/tools/result-details";
import { csvCell } from "@/lib/result-export";
import { Icon } from "./Icon";
import InsightReport from "./InsightReport";

function downloadCsv(name: string, rows: (string | number)[][]) {
  const url = URL.createObjectURL(
    new Blob(
      ["\uFEFF", rows.map((row) => row.map(csvCell).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8" },
    ),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function GrowthChart({
  schedule,
  format,
}: {
  schedule: ResultSchedule;
  format: (value: number) => string;
}) {
  const rows = schedule.yearly;
  const last = rows.at(-1);
  if (!last || last.period === 0) return null;
  const loan = schedule.kind === "loan";
  const points = [
    { period: 0, balance: rows[0]!.opening, invested: rows[0]!.opening },
    ...rows,
  ];
  const max = Math.max(1, ...points.map((row) => row.balance));
  const path = (key: "balance" | "invested") =>
    points
      .map(
        (row) =>
          `${30 + (row.period / last.period) * 620},${180 - (row[key] / max) * 145}`,
      )
      .join(" ");
  return (
    <figure className="growth-chart">
      <figcaption>
        {loan
          ? "Your loan balance over time"
          : schedule.kind === "inflation"
            ? "Cost of the same basket over time"
            : "How your balance grows"}
      </figcaption>
      <svg
        viewBox="0 0 680 220"
        role="img"
        aria-label={`${loan ? "Remaining balance" : "Projected balance"}: ${format(points[0]!.balance)} at the start, ${format(last.balance)} after ${last.period.toLocaleString("en-US", { maximumFractionDigits: 2 })} years. Exact values are in the period breakdown table.`}
      >
        <line x1="30" x2="650" y1="180" y2="180" className="chart-grid" />
        <line x1="30" x2="650" y1="108" y2="108" className="chart-grid" />
        <text x="30" y="19" className="chart-label">
          {format(max)}
        </text>
        <polygon
          points={`30,180 ${path("balance")} 650,180`}
          className="chart-area"
        />
        {schedule.kind === "growth" && (
          <polyline points={path("invested")} className="chart-principal" />
        )}
        <polyline points={path("balance")} className="chart-balance" />
        <text x="30" y="208" className="chart-label">
          Start
        </text>
        <text x="650" y="208" textAnchor="end" className="chart-label">
          Year{" "}
          {last.period.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </text>
      </svg>
      <div className="chart-legend">
        <span>
          <i />
          {loan
            ? "Remaining loan"
            : schedule.kind === "inflation"
              ? "Equivalent cost"
              : "Total balance"}
        </span>
        {schedule.kind === "growth" && (
          <span>
            <i className="principal-key" />
            Money deposited
          </span>
        )}
      </div>
    </figure>
  );
}

function Schedule({
  schedule,
  slug,
  currency,
}: {
  schedule: ResultSchedule;
  slug: string;
  currency?: string;
}) {
  const [period, setPeriod] = useState<"yearly" | "monthly">("yearly");
  const [page, setPage] = useState(0);
  const rows = schedule[period];
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(rows.length / 12) - 1),
  );
  const loan = schedule.kind === "loan";
  const inflation = schedule.kind === "inflation";
  const format = (value: number) =>
    new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      maximumFractionDigits: 2,
      ...(currency ? { style: "currency", currency } : {}),
    }).format(value);
  const columns = [
    period === "yearly" ? "Year" : "Month",
    "Opening balance",
    loan ? "Payment" : "Deposits",
    inflation ? "Cost increase" : "Interest",
    loan ? "Remaining balance" : "Closing balance",
  ];
  if (inflation) columns.splice(2, 1);
  const cells = (row: ScheduleRow): number[] =>
    inflation
      ? [row.period, row.opening, row.interest, row.balance]
      : [row.period, row.opening, row.contribution, row.interest, row.balance];
  return (
    <section className="schedule-panel" aria-label="Period breakdown">
      <GrowthChart schedule={schedule} format={format} />
      <div className="schedule-heading">
        <div>
          <h2>Period-by-period breakdown</h2>
          <p>
            {currency
              ? `All amounts in ${currency}. `
              : "Amounts use the same currency as your inputs. "}
            Rounded to two decimals for display.
          </p>
        </div>
        <button
          type="button"
          className="button quiet"
          onClick={() =>
            downloadCsv(`${slug}-${period}.csv`, [
              [
                currency
                  ? `Amounts in ${currency}`
                  : "Amounts in input currency",
                schedule.note,
              ],
              columns,
              ...rows.map((row) =>
                cells(row).map((cell, i) =>
                  i === 0 ? Number(cell.toFixed(6)) : Number(cell.toFixed(2)),
                ),
              ),
            ])
          }
        >
          <Icon name="Download" size={16} />
          Download CSV
        </button>
      </div>
      <div
        className="schedule-controls"
        role="group"
        aria-label="Schedule interval"
      >
        {(["yearly", "monthly"] as const).map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={period === value}
            onClick={() => {
              setPeriod(value);
              setPage(0);
            }}
          >
            {value === "yearly" ? "Yearly" : "Monthly"}
          </button>
        ))}
      </div>
      <div
        className="data-table-scroll"
        role="region"
        aria-label="Financial schedule table"
        tabIndex={0}
      >
        <table className="detail-table">
          <caption>
            {period === "yearly" ? "Yearly" : "Monthly"}{" "}
            {loan ? "loan repayment" : inflation ? "inflation" : "growth"}{" "}
            schedule{currency ? ` (${currency})` : ""}
          </caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(currentPage * 12, currentPage * 12 + 12).map((row) => (
              <tr key={row.period}>
                {cells(row).map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row">
                      {cell.toLocaleString("en-US", {
                        maximumFractionDigits: 3,
                      })}
                    </th>
                  ) : (
                    <td key={i}>{format(cell)}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 12 && (
        <div className="table-pagination">
          <span>
            Rows {currentPage * 12 + 1}–
            {Math.min(rows.length, currentPage * 12 + 12)} of {rows.length}
          </span>
          <div>
            <button
              className="button quiet"
              type="button"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </button>
            <button
              className="button quiet"
              type="button"
              disabled={(currentPage + 1) * 12 >= rows.length}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
      <p className="schedule-note">{schedule.note}</p>
    </section>
  );
}

export default function ResultDetails({
  details,
  slug,
  currency,
}: {
  details: Details;
  slug: string;
  currency?: string;
}) {
  return (
    <div className="result-details">
      {details.schedule && (
        <Schedule schedule={details.schedule} slug={slug} currency={currency} />
      )}
      {details.insight && <InsightReport insight={details.insight} />}
      {details.table && (
        <div className="detail-section">
          <h2>{details.table.title}</h2>
          <div
            className="data-table-scroll"
            role="region"
            aria-label={details.table.title}
            tabIndex={0}
          >
            <table className="detail-table">
              <caption>{details.table.title}</caption>
              <thead>
                <tr>
                  {details.table.headers.map((header) => (
                    <th scope="col" key={header}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {details.table.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) =>
                      j === 0 ? (
                        <th key={j} scope="row">
                          {cell}
                        </th>
                      ) : (
                        <td key={j}>
                          {typeof cell === "number"
                            ? cell.toLocaleString("en-US", {
                                maximumSignificantDigits: 15,
                              })
                            : cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {details.steps.length > 0 && (
        <section className="detail-section calculation-steps">
          <h2>How this result is calculated</h2>
          <ol>
            {details.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

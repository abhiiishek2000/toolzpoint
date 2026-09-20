"use client";
import { useState } from "react";
import type { InsightTable, ToolInsight } from "@/features/tools/insights";

export function ReportTable({ table }: { table: InsightTable }) {
  const [page, setPage] = useState(0);
  const last = Math.max(0, Math.ceil(table.rows.length / 12) - 1);
  const current = Math.min(page, last);
  return (
    <div className="insight-table">
      <div
        className="data-table-scroll"
        role="region"
        aria-label={table.title}
        tabIndex={0}
      >
        <table className="detail-table">
          <caption>{table.title}</caption>
          <thead>
            <tr>
              {table.headers.map((header) => (
                <th scope="col" key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.slice(current * 12, current * 12 + 12).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => {
                  const value =
                    typeof cell === "number"
                      ? cell.toLocaleString("en-US", {
                          maximumSignificantDigits: 12,
                        })
                      : cell;
                  return j === 0 ? (
                    <th key={j} scope="row">
                      {value}
                    </th>
                  ) : (
                    <td key={j}>{value}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {!table.rows.length && <p>No matching entries in this result.</p>}
      </div>
      {last > 0 && (
        <div className="table-pagination">
          <span>
            Rows {current * 12 + 1}–
            {Math.min(table.rows.length, current * 12 + 12)} of{" "}
            {table.rows.length}
          </span>
          <div>
            <button
              type="button"
              className="button quiet"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
              aria-label={`Previous rows: ${table.title}`}
            >
              Previous
            </button>
            <button
              type="button"
              className="button quiet"
              disabled={current === last}
              onClick={() => setPage(current + 1)}
              aria-label={`Next rows: ${table.title}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InsightReport({ insight }: { insight: ToolInsight }) {
  return (
    <section
      className="detail-section insight-report"
      aria-label="Detailed result report"
    >
      <h2>{insight.title}</h2>
      <p className="schedule-note">{insight.explanation}</p>
      {insight.preview && (
        <div className="search-preview" aria-label="Illustrative link preview">
          <small>{insight.preview.host}</small>
          <strong>{insight.preview.title}</strong>
          <p>{insight.preview.description}</p>
        </div>
      )}
      {insight.tables.map((table) => (
        <ReportTable key={table.title} table={table} />
      ))}
      {insight.comparison && (
        <details className="text-comparison">
          <summary>Compare before and after</summary>
          <div>
            <section>
              <h3>Before</h3>
              <pre>{insight.comparison.before}</pre>
            </section>
            <section>
              <h3>After</h3>
              <pre>{insight.comparison.after}</pre>
            </section>
          </div>
        </details>
      )}
    </section>
  );
}

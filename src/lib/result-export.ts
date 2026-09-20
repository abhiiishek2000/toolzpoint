// A CSV cell cannot become a spreadsheet formula when opened by the user.
export function csvCell(value: string | number) {
  const raw =
    typeof value === "number"
      ? String(value)
      : /^\s*[=+\-@]|^[\t\r\n]/.test(value)
        ? `'${value}`
        : value;
  return `"${raw.replace(/"/g, '""')}"`;
}

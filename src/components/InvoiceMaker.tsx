"use client";
/* eslint-disable @next/next/no-img-element -- Preview is a local blob URL, not a remotely optimized image. */
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { UtilityFrame, markUsed } from "./UtilityFrame";
import {
  invoiceTotals,
  type InvoiceItem,
} from "@/features/tools/invoice-maker/domain";
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
type Row = InvoiceItem & { id: number };
let nextId = 1;
function emptyRow(): Row {
  return { id: nextId++, description: "", quantity: 1, price: 0 };
}
export default function InvoiceMaker() {
  const [businessName, setBusinessName] = useState("");
  const [businessDetails, setBusinessDetails] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientDetails, setClientDetails] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-1001");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("$");
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Row[]>([emptyRow()]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [logoBytes, setLogoBytes] = useState<Uint8Array | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoError, setLogoError] = useState("");
  const logoInput = useRef<HTMLInputElement>(null);
  const logoUrl = useRef("");
  useEffect(() => () => URL.revokeObjectURL(logoUrl.current), []);
  async function chooseLogo(file: File | undefined) {
    setLogoError("");
    if (!file) return;
    try {
      if (!["image/png", "image/jpeg"].includes(file.type))
        throw new Error("Choose a PNG or JPEG image.");
      if (file.size > MAX_LOGO_BYTES)
        throw new Error("Logo must be 2 MB or smaller.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { imageDimensions } = await import("@/features/files/domain");
      imageDimensions(bytes);
      URL.revokeObjectURL(logoUrl.current);
      logoUrl.current = URL.createObjectURL(file);
      setLogoPreview(logoUrl.current);
      setLogoBytes(bytes);
      setNotice("");
    } catch (e) {
      setLogoError(
        e instanceof Error ? e.message : "Choose a valid PNG or JPEG image.",
      );
    } finally {
      if (logoInput.current) logoInput.current.value = "";
    }
  }
  function removeLogo() {
    URL.revokeObjectURL(logoUrl.current);
    logoUrl.current = "";
    setLogoPreview("");
    setLogoBytes(null);
    setLogoError("");
  }
  function updateItem(id: number, patch: Partial<InvoiceItem>) {
    setItems((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setNotice("");
  }
  const validItems = items.filter((r) => r.description.trim());
  let totals: { subtotal: number; tax: number; total: number } | null = null;
  try {
    totals = validItems.length
      ? invoiceTotals(
          validItems.map((r) => ({
            description: r.description,
            quantity: r.quantity,
            price: r.price,
          })),
          taxRate,
        )
      : null;
  } catch {
    totals = null;
  }
  async function download() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { generateInvoicePdf } =
        await import("@/features/tools/invoice-maker/domain");
      const bytes = await generateInvoicePdf(
        {
          businessName,
          businessDetails: businessDetails || undefined,
          clientName,
          clientDetails: clientDetails || undefined,
          invoiceNumber,
          invoiceDate: invoiceDate || new Date().toISOString().slice(0, 10),
          dueDate: dueDate || undefined,
          currency,
          notes: notes || undefined,
          taxRate,
          items: validItems.map((r) => ({
            description: r.description,
            quantity: r.quantity,
            price: r.price,
          })),
        },
        logoBytes ? { bytes: logoBytes } : undefined,
      );
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber || "draft"}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setNotice("Your invoice PDF is ready.");
      markUsed("invoice-maker");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <UtilityFrame slug="invoice-maker">
      <div className="document-studio">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void download();
          }}
        >
          <fieldset disabled={busy}>
            <div className="studio-step">
              <span>01</span>
              <h2>Your business</h2>
            </div>
            <div className="fields-grid">
              <label className="field full-width">
                Business name
                <input
                  value={businessName}
                  maxLength={120}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </label>
              <label className="field full-width">
                Address, email, phone (optional)
                <textarea
                  value={businessDetails}
                  maxLength={400}
                  rows={3}
                  onChange={(e) => setBusinessDetails(e.target.value)}
                />
              </label>
              <div className="field full-width">
                Company logo (optional)
                <div className="photo-picker">
                  {logoPreview ? (
                    <img
                      className="logo-preview"
                      src={logoPreview}
                      alt="Company logo preview"
                    />
                  ) : (
                    <span className="photo-picker-empty logo-preview">
                      <Icon name="ImageUp" size={22} />
                    </span>
                  )}
                  <div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => logoInput.current?.click()}
                    >
                      <Icon name="Plus" size={16} />
                      {logoPreview ? "Change logo" : "Add a logo"}
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        className="text-button"
                        onClick={removeLogo}
                      >
                        <Icon name="X" size={15} />
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={logoInput}
                    className="sr-only"
                    type="file"
                    aria-label="Choose a company logo"
                    accept="image/png,image/jpeg"
                    onChange={(e) => void chooseLogo(e.target.files?.[0])}
                  />
                </div>
                <span className="setting-hint">
                  PNG or JPEG, up to 2 MB. Shown at the top of the invoice.
                </span>
                {logoError && (
                  <span className="error-message" role="alert">
                    {logoError}
                  </span>
                )}
              </div>
            </div>
            <div className="studio-step">
              <span>02</span>
              <h2>Bill to</h2>
            </div>
            <div className="fields-grid">
              <label className="field full-width">
                Client name
                <input
                  value={clientName}
                  maxLength={120}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </label>
              <label className="field full-width">
                Client address (optional)
                <textarea
                  value={clientDetails}
                  maxLength={400}
                  rows={2}
                  onChange={(e) => setClientDetails(e.target.value)}
                />
              </label>
            </div>
            <div className="studio-step">
              <span>03</span>
              <h2>Invoice details</h2>
            </div>
            <div className="fields-grid">
              <label className="field">
                Invoice number
                <input
                  value={invoiceNumber}
                  maxLength={60}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </label>
              <label className="field">
                Currency symbol
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="$">$ Dollar</option>
                  <option value="₹">₹ Rupee</option>
                  <option value="€">€ Euro</option>
                  <option value="£">£ Pound</option>
                </select>
              </label>
              <label className="field">
                Invoice date
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </label>
              <label className="field">
                Due date (optional)
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </label>
            </div>
            <div className="studio-step">
              <span>04</span>
              <h2>Line items</h2>
            </div>
            <div className="invoice-items">
              <div className="invoice-items-head">
                <span>Description</span>
                <span>Qty</span>
                <span>Price</span>
                <span />
              </div>
              {items.map((row) => (
                <div className="invoice-item-row" key={row.id}>
                  <input
                    aria-label="Item description"
                    value={row.description}
                    maxLength={200}
                    onChange={(e) =>
                      updateItem(row.id, { description: e.target.value })
                    }
                  />
                  <input
                    aria-label="Quantity"
                    type="number"
                    min="0"
                    step="any"
                    value={row.quantity}
                    onChange={(e) =>
                      updateItem(row.id, { quantity: Number(e.target.value) })
                    }
                  />
                  <input
                    aria-label="Unit price"
                    type="number"
                    min="0"
                    step="any"
                    value={row.price}
                    onChange={(e) =>
                      updateItem(row.id, { price: Number(e.target.value) })
                    }
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Remove item"
                    disabled={items.length === 1}
                    onClick={() =>
                      setItems((rows) => rows.filter((r) => r.id !== row.id))
                    }
                  >
                    <Icon name="X" size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-button"
                onClick={() => setItems((rows) => [...rows, emptyRow()])}
              >
                <Icon name="Plus" size={16} />
                Add line item
              </button>
            </div>
            <label className="field">
              Tax rate (%)
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </label>
            <label className="field full-width">
              Notes (optional)
              <textarea
                value={notes}
                maxLength={500}
                rows={2}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="button-row">
              <button
                className="button primary"
                type="submit"
                disabled={
                  busy || !businessName.trim() || !clientName.trim() || !totals
                }
              >
                {busy ? "Preparing…" : "Download PDF"}
                <Icon name="Download" size={17} />
              </button>
            </div>
          </fieldset>
        </form>
        <aside className="invoice-summary">
          <h3>Live total</h3>
          {totals ? (
            <dl>
              <div>
                <dt>Subtotal</dt>
                <dd>
                  {currency}
                  {totals.subtotal.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt>Tax ({taxRate || 0}%)</dt>
                <dd>
                  {currency}
                  {totals.tax.toFixed(2)}
                </dd>
              </div>
              <div className="invoice-total-row">
                <dt>Total</dt>
                <dd>
                  {currency}
                  {totals.total.toFixed(2)}
                </dd>
              </div>
            </dl>
          ) : (
            <p>Add at least one line item with a description to see totals.</p>
          )}
          <p className="result-status" role="status">
            {notice}
          </p>
        </aside>
      </div>
    </UtilityFrame>
  );
}

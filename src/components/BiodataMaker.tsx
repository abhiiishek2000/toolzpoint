"use client";
import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { UtilityFrame, markUsed } from "./UtilityFrame";
import { validateFiles } from "@/features/files/domain";
type Fields = {
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  height: string;
  complexion: string;
  bloodGroup: string;
  religion: string;
  caste: string;
  education: string;
  occupation: string;
  income: string;
  fatherName: string;
  motherName: string;
  siblings: string;
  address: string;
  phone: string;
  email: string;
};
const initial: Fields = {
  fullName: "",
  dateOfBirth: "",
  timeOfBirth: "",
  placeOfBirth: "",
  height: "",
  complexion: "",
  bloodGroup: "",
  religion: "",
  caste: "",
  education: "",
  occupation: "",
  income: "",
  fatherName: "",
  motherName: "",
  siblings: "",
  address: "",
  phone: "",
  email: "",
};
function BiodataPreview({
  fields,
  photoPreview,
}: {
  fields: Fields;
  photoPreview: string;
}) {
  const row = (label: string, value: string) =>
    value.trim() ? (
      <div className="bp-row" key={label}>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </div>
    ) : null;
  const personal = [
    row("Date of Birth", fields.dateOfBirth),
    row("Time of Birth", fields.timeOfBirth),
    row("Place of Birth", fields.placeOfBirth),
    row("Height", fields.height),
    row("Complexion", fields.complexion),
    row("Blood Group", fields.bloodGroup),
    row("Religion", fields.religion),
    row("Caste / Community", fields.caste),
    row("Education", fields.education),
    row("Occupation", fields.occupation),
    row("Annual Income", fields.income),
  ].filter(Boolean);
  const family = [
    row("Father's Name", fields.fatherName),
    row("Mother's Name", fields.motherName),
    row("Siblings", fields.siblings),
  ].filter(Boolean);
  const contact = [
    row("Address", fields.address),
    row("Phone", fields.phone),
    row("Email", fields.email),
  ].filter(Boolean);
  return (
    <div className="doc-page biodata-preview">
      <div className="bp-head">
        <div>
          <div className="bp-name">{fields.fullName.trim() || "Your Name"}</div>
          <div className="bp-label">Biodata</div>
        </div>
        {photoPreview && (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img className="bp-photo" src={photoPreview} alt="" />
        )}
      </div>
      <hr className="bp-divider" />
      {personal.length > 0 && (
        <div className="bp-section">
          <div className="bp-section-title">Personal Details</div>
          <dl style={{ margin: 0 }}>{personal}</dl>
        </div>
      )}
      {family.length > 0 && (
        <div className="bp-section">
          <div className="bp-section-title">Family Details</div>
          <dl style={{ margin: 0 }}>{family}</dl>
        </div>
      )}
      {contact.length > 0 && (
        <div className="bp-section">
          <div className="bp-section-title">Contact Details</div>
          <dl style={{ margin: 0 }}>{contact}</dl>
        </div>
      )}
      {!fields.fullName.trim() &&
        !personal.length &&
        !family.length &&
        !contact.length && (
          <p className="doc-placeholder" style={{ fontSize: "1.8cqw" }}>
            Fill in the form to see your biodata take shape here.
          </p>
        )}
    </div>
  );
}
export default function BiodataMaker() {
  const [fields, setFields] = useState<Fields>(initial);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setNotice("");
  }
  function choosePhoto(file: File | null) {
    setError("");
    if (!file) {
      setPhoto(null);
      setPhotoPreview("");
      return;
    }
    try {
      validateFiles([file], "image");
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Choose a JPG, PNG, or WebP photo.",
      );
    }
  }
  async function download() {
    if (busy) return;
    if (!fields.fullName.trim()) {
      setError("Enter a full name first.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { generateBiodataPdf } =
        await import("@/features/tools/biodata-maker/domain");
      const values = Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, v.trim() || undefined]),
      ) as Partial<Fields>;
      const bytes = await generateBiodataPdf({
        ...values,
        fullName: fields.fullName.trim(),
        photo: photo
          ? {
              bytes: new Uint8Array(await photo.arrayBuffer()),
              type: photo.type,
            }
          : undefined,
      });
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "biodata.pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setNotice("Your biodata PDF is ready.");
      markUsed("biodata-maker");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const field = (
    key: keyof Fields,
    label: string,
    type = "text",
    fullWidth = false,
  ) => (
    <label className={`field ${fullWidth ? "full-width" : ""}`} key={key}>
      {label}
      <input
        type={type}
        value={fields[key]}
        maxLength={300}
        onChange={(e) => set(key, e.target.value)}
      />
    </label>
  );
  return (
    <UtilityFrame slug="biodata-maker">
      <div className="document-studio document-studio-preview">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void download();
          }}
        >
          <fieldset disabled={busy}>
            <div className="studio-step">
              <span>01</span>
              <h2>Name and photo</h2>
            </div>
            <p className="setting-hint">
              Every field but your name is optional. Religion, caste, income,
              and other sensitive fields are entirely up to you — leave any of
              them blank and they won&apos;t appear on the page.
            </p>
            <div className="fields-grid">
              {field("fullName", "Full name", "text", true)}
            </div>
            <div className="photo-picker">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                <img src={photoPreview} alt="Selected photo preview" />
              ) : (
                <div className="photo-picker-empty">
                  <Icon name="UserSquare2" size={26} />
                </div>
              )}
              <div>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => input.current?.click()}
                >
                  <Icon name="Plus" size={15} />
                  {photo ? "Change photo" : "Add a photo (optional)"}
                </button>
                {photo && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => choosePhoto(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={input}
                className="sr-only"
                type="file"
                aria-label="Choose a photo"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => choosePhoto(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="studio-step">
              <span>02</span>
              <h2>Personal details</h2>
            </div>
            <div className="fields-grid">
              {field("dateOfBirth", "Date of birth", "date")}
              {field("timeOfBirth", "Time of birth (optional)")}
              {field("placeOfBirth", "Place of birth (optional)")}
              {field("height", "Height (optional)")}
              {field("complexion", "Complexion (optional)")}
              {field("bloodGroup", "Blood group (optional)")}
              {field("religion", "Religion (optional)")}
              {field("caste", "Caste / community (optional)")}
              {field("education", "Education (optional)", "text", true)}
              {field("occupation", "Occupation (optional)")}
              {field("income", "Annual income (optional)")}
            </div>
            <div className="studio-step">
              <span>03</span>
              <h2>Family details</h2>
            </div>
            <div className="fields-grid">
              {field("fatherName", "Father's name (optional)")}
              {field("motherName", "Mother's name (optional)")}
              {field("siblings", "Siblings (optional)", "text", true)}
            </div>
            <div className="studio-step">
              <span>04</span>
              <h2>Contact details</h2>
            </div>
            <div className="fields-grid">
              {field("address", "Address (optional)", "text", true)}
              {field("phone", "Phone (optional)")}
              {field("email", "Email (optional)")}
            </div>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="button-row">
              <button
                className="button primary"
                type="submit"
                disabled={busy || !fields.fullName.trim()}
              >
                {busy ? "Preparing…" : "Download PDF"}
                <Icon name="Download" size={17} />
              </button>
              <button
                type="button"
                className="button quiet"
                onClick={() => {
                  setFields(initial);
                  choosePhoto(null);
                  setNotice("");
                  setError("");
                }}
              >
                <Icon name="RotateCcw" size={16} />
                Reset
              </button>
            </div>
          </fieldset>
        </form>
        <aside className="doc-preview-pane">
          <div className="doc-preview-heading">
            <h3>Live preview</h3>
            <span>Updates as you type</span>
          </div>
          <div className="doc-page-frame">
            <BiodataPreview fields={fields} photoPreview={photoPreview} />
          </div>
          <p className="result-status" role="status">
            {notice}
          </p>
        </aside>
      </div>
    </UtilityFrame>
  );
}

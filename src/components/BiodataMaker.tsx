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
              <h2>Name and photo</h2>
            </div>
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
        <aside className="invoice-summary">
          <h3>Every field but your name is optional.</h3>
          <p>
            Religion, caste, income, and other sensitive fields are entirely up
            to you — leave any of them blank and they won&apos;t appear on the
            page. Fill in only what you&apos;re comfortable sharing.
          </p>
          <p className="result-status" role="status">
            {notice}
          </p>
        </aside>
      </div>
    </UtilityFrame>
  );
}

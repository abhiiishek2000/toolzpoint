"use client";
import { useState } from "react";
import InsightReport from "./InsightReport";
import type { ToolInsight } from "@/features/tools/insights";
import { Icon } from "./Icon";
import { UtilityFrame, markUsed } from "./UtilityFrame";
import {
  resumeTemplateIds,
  resumeTemplates,
  type ResumeTemplateId,
} from "@/features/tools/resume-maker/domain";
type EntryRow = {
  id: number;
  title: string;
  subtitle: string;
  dates: string;
  location: string;
  bulletsText: string;
};
let nextId = 1;
function emptyEntry(): EntryRow {
  return {
    id: nextId++,
    title: "",
    subtitle: "",
    dates: "",
    location: "",
    bulletsText: "",
  };
}
function toEntries(rows: EntryRow[]) {
  return rows
    .filter((r) =>
      [r.title, r.subtitle, r.dates, r.location, r.bulletsText].some((value) =>
        value.trim(),
      ),
    )
    .map((r) => ({
      title: r.title,
      subtitle: r.subtitle || undefined,
      dates: r.dates || undefined,
      location: r.location || undefined,
      bullets: r.bulletsText
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
    }));
}
function EntryEditor({
  label,
  rows,
  setRows,
  disabled,
}: {
  label: string;
  rows: EntryRow[];
  setRows: (rows: EntryRow[]) => void;
  disabled: boolean;
}) {
  function update(id: number, patch: Partial<EntryRow>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  return (
    <div className="resume-entries">
      {rows.map((row, i) => (
        <div className="resume-entry" key={row.id}>
          <div className="fields-grid">
            <label className="field">
              {label} title
              <input
                value={row.title}
                maxLength={150}
                onChange={(e) => update(row.id, { title: e.target.value })}
              />
            </label>
            <label className="field">
              Organization
              <input
                value={row.subtitle}
                maxLength={150}
                onChange={(e) => update(row.id, { subtitle: e.target.value })}
              />
            </label>
            <label className="field">
              Dates
              <input
                value={row.dates}
                maxLength={60}
                placeholder="2022 – Present"
                onChange={(e) => update(row.id, { dates: e.target.value })}
              />
            </label>
            <label className="field">
              Location (optional)
              <input
                value={row.location}
                maxLength={100}
                onChange={(e) => update(row.id, { location: e.target.value })}
              />
            </label>
          </div>
          <label className="field full-width">
            Highlights (one per line, optional)
            <textarea
              value={row.bulletsText}
              maxLength={2000}
              rows={3}
              onChange={(e) => update(row.id, { bulletsText: e.target.value })}
            />
          </label>
          <button
            type="button"
            className="text-button"
            disabled={disabled}
            onClick={() => setRows(rows.filter((r) => r.id !== row.id))}
          >
            <Icon name="X" size={15} />
            Remove {label.toLowerCase()} {i + 1}
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-button"
        disabled={disabled}
        onClick={() => setRows([...rows, emptyEntry()])}
      >
        <Icon name="Plus" size={16} />
        Add {label.toLowerCase()}
      </button>
    </div>
  );
}
function bulletLines(text: string) {
  return text
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);
}
function ResumePreview({
  template,
  fullName,
  title,
  email,
  phone,
  location,
  links,
  summary,
  experience,
  education,
  skills,
  projects,
  certifications,
  languages,
}: {
  template: ResumeTemplateId;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  summary: string;
  experience: EntryRow[];
  education: EntryRow[];
  skills: string;
  projects: EntryRow[];
  certifications: string;
  languages: string;
}) {
  const contact = [location, phone, email, links]
    .filter(Boolean)
    .join("   ·   ");
  const exp = experience.filter((r) =>
    [r.title, r.subtitle, r.dates, r.location, r.bulletsText].some((value) =>
      value.trim(),
    ),
  );
  const edu = education.filter((r) =>
    [r.title, r.subtitle, r.dates, r.location, r.bulletsText].some((value) =>
      value.trim(),
    ),
  );
  const proj = projects.filter((r) =>
    [r.title, r.subtitle, r.dates, r.location, r.bulletsText].some((value) =>
      value.trim(),
    ),
  );
  const entryBlock = (row: EntryRow) => (
    <div className="rp-entry" key={row.id}>
      <div className="rp-entry-head">
        <span className="rp-entry-title">{row.title}</span>
        {row.dates && <span className="rp-entry-dates">{row.dates}</span>}
      </div>
      {(row.subtitle || row.location) && (
        <div className="rp-entry-sub">
          {[row.subtitle, row.location].filter(Boolean).join(" — ")}
        </div>
      )}
      {bulletLines(row.bulletsText).map((b, i) => (
        <div className="rp-bullet" key={i}>
          {b}
        </div>
      ))}
    </div>
  );
  const isEmpty =
    !fullName.trim() && !summary.trim() && exp.length === 0 && edu.length === 0;
  return (
    <div className="doc-page resume-preview" data-template={template}>
      <div className="rp-name">{fullName.trim() || "Your Name"}</div>
      {title.trim() && <div className="rp-title">{title}</div>}
      <div className="rp-contact">
        {contact || (
          <span className="doc-placeholder">City · phone · email</span>
        )}
      </div>
      <hr className="rp-divider" />
      {summary.trim() && (
        <section>
          <div className="rp-section-title">Summary</div>
          <p style={{ margin: 0 }}>{summary}</p>
        </section>
      )}
      {exp.length > 0 && (
        <section>
          <div className="rp-section-title">Experience</div>
          {exp.map(entryBlock)}
        </section>
      )}
      {edu.length > 0 && (
        <section>
          <div className="rp-section-title">Education</div>
          {edu.map(entryBlock)}
        </section>
      )}
      {skills.trim() && (
        <section>
          <div className="rp-section-title">Skills</div>
          <div className="rp-skills">{skills}</div>
        </section>
      )}
      {proj.length > 0 && (
        <section>
          <div className="rp-section-title">Projects</div>
          {proj.map(entryBlock)}
        </section>
      )}
      {certifications.trim() && (
        <section>
          <div className="rp-section-title">Certifications</div>
          {certifications
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line, i) => (
              <div className="rp-skills" key={i}>
                {line}
              </div>
            ))}
        </section>
      )}
      {languages.trim() && (
        <section>
          <div className="rp-section-title">Languages</div>
          <div className="rp-skills">{languages}</div>
        </section>
      )}
      {isEmpty && (
        <p className="doc-placeholder" style={{ fontSize: "1.8cqw" }}>
          Fill in the form to see your resume take shape here.
        </p>
      )}
    </div>
  );
}
export default function ResumeMaker() {
  const [template, setTemplate] = useState<ResumeTemplateId>("classic");
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [links, setLinks] = useState("");
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState<EntryRow[]>([emptyEntry()]);
  const [education, setEducation] = useState<EntryRow[]>([emptyEntry()]);
  const [skills, setSkills] = useState("");
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState<EntryRow[]>([emptyEntry()]);
  const [showCertifications, setShowCertifications] = useState(false);
  const [certifications, setCertifications] = useState("");
  const [showLanguages, setShowLanguages] = useState(false);
  const [languages, setLanguages] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const exportKey = JSON.stringify([
    template,
    fullName,
    title,
    email,
    phone,
    location,
    links,
    summary,
    experience,
    education,
    skills,
    showProjects,
    projects,
    showCertifications,
    certifications,
    showLanguages,
    languages,
  ]);
  const [exportReport, setExportReport] = useState<{
    key: string;
    insight: ToolInsight;
  } | null>(null);
  async function download() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { generateResumePdf } =
        await import("@/features/tools/resume-maker/domain");
      const bytes = await generateResumePdf({
        template,
        fullName,
        title: title || undefined,
        email: email || undefined,
        phone: phone || undefined,
        location: location || undefined,
        links: links || undefined,
        summary: summary || undefined,
        experience: toEntries(experience),
        education: toEntries(education),
        skills: skills || undefined,
        projects: showProjects ? toEntries(projects) : undefined,
        certifications:
          showCertifications && certifications ? certifications : undefined,
        languages: showLanguages && languages ? languages : undefined,
      });
      const { documentReport } =
        await import("@/features/files/document-report");
      setExportReport({
        key: exportKey,
        insight: await documentReport(bytes, "resume", {
          Name: fullName,
          Template: template,
          "Experience entries": toEntries(experience).length,
          "Education entries": toEntries(education).length,
          "Project entries": showProjects ? toEntries(projects).length : 0,
          "Contact details":
            [email, phone, location, links].filter(Boolean).join(" · ") ||
            "Not supplied",
        }),
      });
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${(fullName || "draft").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setNotice("Your resume PDF is ready.");
      markUsed("resume-maker");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const addableSections = [
    !showProjects && {
      key: "projects",
      label: "Projects",
      onAdd: () => setShowProjects(true),
    },
    !showCertifications && {
      key: "certifications",
      label: "Certifications",
      onAdd: () => setShowCertifications(true),
    },
    !showLanguages && {
      key: "languages",
      label: "Languages",
      onAdd: () => setShowLanguages(true),
    },
  ].filter((s): s is { key: string; label: string; onAdd: () => void } => !!s);
  return (
    <UtilityFrame slug="resume-maker">
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
              <h2>Choose a template</h2>
            </div>
            <div className="template-picker">
              {resumeTemplateIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="template-card"
                  data-selected={template === id}
                  data-template={id}
                  onClick={() => setTemplate(id)}
                >
                  <span className="template-swatch">
                    <span className="swatch-name" />
                    <span className="swatch-line" />
                    <span className="swatch-line short" />
                  </span>
                  <strong>{resumeTemplates[id].name}</strong>
                  <span>{resumeTemplates[id].description}</span>
                </button>
              ))}
            </div>
            <div className="studio-step">
              <span>02</span>
              <h2>Your details</h2>
            </div>
            <div className="fields-grid">
              <label className="field full-width">
                Full name
                <input
                  value={fullName}
                  maxLength={100}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </label>
              <label className="field full-width">
                Job title (optional)
                <input
                  value={title}
                  maxLength={120}
                  placeholder="Senior Product Designer"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="field">
                Email
                <input
                  type="email"
                  value={email}
                  maxLength={100}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="field">
                Phone
                <input
                  value={phone}
                  maxLength={40}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label className="field">
                Location
                <input
                  value={location}
                  maxLength={100}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </label>
              <label className="field">
                Links (optional)
                <input
                  value={links}
                  maxLength={200}
                  placeholder="linkedin.com/in/you"
                  onChange={(e) => setLinks(e.target.value)}
                />
              </label>
            </div>
            <div className="studio-step">
              <span>03</span>
              <h2>Summary</h2>
            </div>
            <label className="field full-width">
              A few sentences about you (optional)
              <textarea
                value={summary}
                maxLength={600}
                rows={3}
                onChange={(e) => setSummary(e.target.value)}
              />
            </label>
            <div className="studio-step">
              <span>04</span>
              <h2>Experience</h2>
            </div>
            <EntryEditor
              label="Experience"
              rows={experience}
              setRows={setExperience}
              disabled={busy}
            />
            <div className="studio-step">
              <span>05</span>
              <h2>Education</h2>
            </div>
            <EntryEditor
              label="Education"
              rows={education}
              setRows={setEducation}
              disabled={busy}
            />
            <div className="studio-step">
              <span>06</span>
              <h2>Skills</h2>
            </div>
            <label className="field full-width">
              Comma-separated (optional)
              <input
                value={skills}
                maxLength={500}
                placeholder="Figma, Design systems, User research"
                onChange={(e) => setSkills(e.target.value)}
              />
            </label>
            {addableSections.length > 0 && (
              <div className="resume-section-chips">
                {addableSections.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    className="chip"
                    onClick={s.onAdd}
                  >
                    <Icon name="Plus" size={14} />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            {showProjects && (
              <>
                <div className="studio-step">
                  <span>+</span>
                  <h2>Projects</h2>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setShowProjects(false)}
                  >
                    <Icon name="X" size={14} />
                    Remove section
                  </button>
                </div>
                <EntryEditor
                  label="Project"
                  rows={projects}
                  setRows={setProjects}
                  disabled={busy}
                />
              </>
            )}
            {showCertifications && (
              <>
                <div className="studio-step">
                  <span>+</span>
                  <h2>Certifications</h2>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setShowCertifications(false)}
                  >
                    <Icon name="X" size={14} />
                    Remove section
                  </button>
                </div>
                <label className="field full-width">
                  One per line
                  <textarea
                    value={certifications}
                    maxLength={500}
                    rows={2}
                    onChange={(e) => setCertifications(e.target.value)}
                  />
                </label>
              </>
            )}
            {showLanguages && (
              <>
                <div className="studio-step">
                  <span>+</span>
                  <h2>Languages</h2>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setShowLanguages(false)}
                  >
                    <Icon name="X" size={14} />
                    Remove section
                  </button>
                </div>
                <label className="field full-width">
                  Comma-separated
                  <input
                    value={languages}
                    maxLength={300}
                    placeholder="English, Spanish"
                    onChange={(e) => setLanguages(e.target.value)}
                  />
                </label>
              </>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="button-row">
              <button
                type="button"
                className="button quiet"
                onClick={() => {
                  setTemplate("classic");
                  setFullName("");
                  setTitle("");
                  setEmail("");
                  setPhone("");
                  setLocation("");
                  setLinks("");
                  setSummary("");
                  setExperience([emptyEntry()]);
                  setEducation([emptyEntry()]);
                  setSkills("");
                  setShowProjects(false);
                  setProjects([emptyEntry()]);
                  setShowCertifications(false);
                  setCertifications("");
                  setShowLanguages(false);
                  setLanguages("");
                  setError("");
                  setNotice("");
                  setExportReport(null);
                }}
              >
                Reset
              </button>
              <button
                className="button primary"
                type="submit"
                disabled={busy || !fullName.trim()}
              >
                {busy ? "Preparing…" : "Download PDF"}
                <Icon name="Download" size={17} />
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
            <ResumePreview
              template={template}
              fullName={fullName}
              title={title}
              email={email}
              phone={phone}
              location={location}
              links={links}
              summary={summary}
              experience={experience}
              education={education}
              skills={skills}
              projects={showProjects ? projects : []}
              certifications={showCertifications ? certifications : ""}
              languages={showLanguages ? languages : ""}
            />
          </div>
          {exportReport?.key === exportKey && (
            <InsightReport insight={exportReport.insight} />
          )}
          <p className="result-status" role="status">
            {notice}
          </p>
        </aside>
      </div>
    </UtilityFrame>
  );
}

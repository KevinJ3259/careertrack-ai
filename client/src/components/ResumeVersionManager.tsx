import type { FormEvent } from "react";
import type { ResumeVersion } from "../types";

export type ResumeVersionFormState = {
  id: string;
  title: string;
  resumeText: string;
  isDefault: boolean;
};

type ResumeVersionManagerProps = {
  resumes: ResumeVersion[];
  form: ResumeVersionFormState;
  loading: boolean;
  onFormChange: (form: ResumeVersionFormState) => void;
  onSubmit: (event: FormEvent) => void;
  onEdit: (resume: ResumeVersion) => void;
  onDuplicate: (id: string) => void;
  onAnalyze: (resume: ResumeVersion) => void;
  onMakeDefault: (id: string) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
};

export default function ResumeVersionManager({
  resumes,
  form,
  loading,
  onFormChange,
  onSubmit,
  onEdit,
  onDuplicate,
  onAnalyze,
  onMakeDefault,
  onDelete,
  onCancelEdit
}: ResumeVersionManagerProps) {
  return (
    <section className="panel resume-manager">
      <div className="section-heading">
        <div>
          <p className="eyebrow">RESUME VERSION MANAGER</p>
          <h2>Save resumes for different roles</h2>
        </div>
      </div>

      <div className="resume-manager-layout">
        <form onSubmit={onSubmit}>
          <label>
            Resume version name
            <input
              required
              placeholder="Junior Software Developer Resume"
              value={form.title}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  title: event.target.value
                })
              }
            />
          </label>

          <label>
            Resume text
            <textarea
              required
              rows={15}
              placeholder="Paste your resume text here..."
              value={form.resumeText}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  resumeText: event.target.value
                })
              }
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  isDefault: event.target.checked
                })
              }
            />
            Use as my default resume
          </label>

          <div className="button-row">
            <button disabled={loading} type="submit">
              {form.id ? "Update resume version" : "Save resume version"}
            </button>

            {form.id && (
              <button
                className="secondary"
                type="button"
                onClick={onCancelEdit}
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>

        <div className="resume-version-list">
          {resumes.length === 0 && (
            <div className="empty-state">
              No resume versions saved yet.
            </div>
          )}

          {resumes.map((resume) => (
            <article className="resume-version-card" key={resume.id}>
              <div>
                {resume.isDefault && (
                  <span className="default-badge">Default</span>
                )}

                <h3>{resume.title}</h3>

                <p>
                  Updated {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="resume-version-actions">
                <button type="button" onClick={() => onEdit(resume)}>
                  Edit
                </button>

                <button
                  className="secondary"
                  type="button"
                  onClick={() => onDuplicate(resume.id)}
                >
                  Duplicate
                </button>

                <button
                  className="secondary"
                  type="button"
                  onClick={() => onAnalyze(resume)}
                >
                  Analyze
                </button>

                {!resume.isDefault && (
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => onMakeDefault(resume.id)}
                  >
                    Make default
                  </button>
                )}

                <button
                  className="danger-link"
                  type="button"
                  onClick={() => onDelete(resume.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
import type { FormEvent } from "react";
import type { Status } from "../types";

export type ApplicationFormState = {
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  status: Status;
  jobDescription: string;
  notes: string;
};

type ApplicationTrackerProps = {
  form: ApplicationFormState;
  statuses: Status[];
  loading: boolean;
  coverLetter: string;
  onFormChange: (form: ApplicationFormState) => void;
  onSubmit: (event: FormEvent) => void;
  onGenerateLetter: () => void;
  onCoverLetterChange: (value: string) => void;
};

export default function ApplicationTracker({
  form,
  statuses,
  loading,
  coverLetter,
  onFormChange,
  onSubmit,
  onGenerateLetter,
  onCoverLetterChange
}: ApplicationTrackerProps) {
  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">NEW APPLICATION</p>
          <h2>Add a job</h2>
        </div>
      </div>

      <div className="field-grid">
        <label>
          Company
          <input
            required
            value={form.company}
            onChange={(event) =>
              onFormChange({ ...form, company: event.target.value })
            }
          />
        </label>

        <label>
          Role
          <input
            required
            value={form.role}
            onChange={(event) =>
              onFormChange({ ...form, role: event.target.value })
            }
          />
        </label>

        <label>
          Location
          <input
            value={form.location}
            onChange={(event) =>
              onFormChange({ ...form, location: event.target.value })
            }
          />
        </label>

        <label>
          Job URL
          <input
            type="url"
            value={form.jobUrl}
            onChange={(event) =>
              onFormChange({ ...form, jobUrl: event.target.value })
            }
          />
        </label>
      </div>

      <label>
        Status
        <select
          value={form.status}
          onChange={(event) =>
            onFormChange({
              ...form,
              status: event.target.value as Status
            })
          }
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>

      <label>
        Job description
        <textarea
          rows={7}
          value={form.jobDescription}
          onChange={(event) =>
            onFormChange({
              ...form,
              jobDescription: event.target.value
            })
          }
        />
      </label>

      <label>
        Notes
        <textarea
          rows={4}
          value={form.notes}
          onChange={(event) =>
            onFormChange({ ...form, notes: event.target.value })
          }
        />
      </label>

      <div className="button-row">
        <button disabled={loading} type="submit">
          Save application
        </button>

        <button
          disabled={loading}
          className="secondary"
          type="button"
          onClick={onGenerateLetter}
        >
          Generate cover letter
        </button>
      </div>

      {coverLetter && (
        <div className="draft">
          <h3>AI draft</h3>
          <textarea
            rows={14}
            value={coverLetter}
            onChange={(event) => onCoverLetterChange(event.target.value)}
          />
        </div>
      )}
    </form>
  );
}
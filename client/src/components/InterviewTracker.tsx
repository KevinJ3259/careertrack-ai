import type { FormEvent } from "react";
import type { Interview, JobApplication } from "../types";

export type InterviewFormState = {
  applicationId: string;
  scheduledAt: string;
  interviewType: string;
  interviewerName: string;
  location: string;
  meetingLink: string;
  preparationNotes: string;
  outcome: string;
};

type InterviewTrackerProps = {
  applications: JobApplication[];
  interviews: Interview[];
  form: InterviewFormState;
  loading: boolean;
  onFormChange: (form: InterviewFormState) => void;
  onSubmit: (event: FormEvent) => void;
  onDelete: (id: string) => void;
};

export default function InterviewTracker({
  applications,
  interviews,
  form,
  loading,
  onFormChange,
  onSubmit,
  onDelete
}: InterviewTrackerProps) {
  return (
    <section className="panel interview-tracker">
      <div className="section-heading">
        <div>
          <p className="eyebrow">INTERVIEW TRACKER</p>
          <h2>Schedule and prepare</h2>
        </div>
      </div>

      <div className="interview-layout">
        <form onSubmit={onSubmit}>
          <label>
            Job application
            <select
              required
              value={form.applicationId}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  applicationId: event.target.value
                })
              }
            >
              <option value="">Choose an application</option>

              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.company} — {application.role}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date and time
            <input
              required
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  scheduledAt: event.target.value
                })
              }
            />
          </label>

          <label>
            Interview type
            <select
              value={form.interviewType}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  interviewType: event.target.value
                })
              }
            >
              <option>Phone Screen</option>
              <option>Video Interview</option>
              <option>Technical Interview</option>
              <option>Behavioral Interview</option>
              <option>On-site Interview</option>
              <option>Final Interview</option>
            </select>
          </label>

          <label>
            Interviewer
            <input
              value={form.interviewerName}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  interviewerName: event.target.value
                })
              }
            />
          </label>

          <label>
            Location
            <input
              value={form.location}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  location: event.target.value
                })
              }
            />
          </label>

          <label>
            Meeting link
            <input
              type="url"
              value={form.meetingLink}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  meetingLink: event.target.value
                })
              }
            />
          </label>

          <label>
            Preparation notes
            <textarea
              rows={5}
              value={form.preparationNotes}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  preparationNotes: event.target.value
                })
              }
            />
          </label>

          <label>
            Outcome
            <input
              value={form.outcome}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  outcome: event.target.value
                })
              }
            />
          </label>

          <button disabled={loading} type="submit">
            Save interview
          </button>
        </form>

        <div className="interview-list">
          {interviews.length === 0 && (
            <div className="empty-state">No interviews scheduled yet.</div>
          )}

          {interviews.map((interview) => (
            <article className="interview-card" key={interview.id}>
              <p className="eyebrow">{interview.interviewType}</p>
              <h3>{interview.application.role}</h3>
              <p>{interview.application.company}</p>
              <p>{new Date(interview.scheduledAt).toLocaleString()}</p>

              {interview.interviewerName && (
                <p>Interviewer: {interview.interviewerName}</p>
              )}

              {interview.location && (
                <p>Location: {interview.location}</p>
              )}

              {interview.preparationNotes && (
                <p>Preparation: {interview.preparationNotes}</p>
              )}

              {interview.outcome && (
                <p>Outcome: {interview.outcome}</p>
              )}

              {interview.meetingLink && (
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Join interview
                </a>
              )}

              <button
                className="danger-link"
                type="button"
                onClick={() => onDelete(interview.id)}
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
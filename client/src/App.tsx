import { FormEvent, useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken, setToken } from "./api";
import type { Interview, JobApplication, Status } from "./types";

const statuses: Status[] = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

const emptyForm = {
  company: "",
  role: "",
  location: "",
  jobUrl: "",
  status: "SAVED" as Status,
  jobDescription: "",
  notes: ""
};

const emptyInterviewForm = {
  applicationId: "",
  scheduledAt: "",
  interviewType: "Phone Screen",
  interviewerName: "",
  location: "",
  meetingLink: "",
  preparationNotes: "",
  outcome: ""
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeText, setResumeText] = useState("");

  const [resumeAnalysis, setResumeAnalysis] = useState<{
    matchScore: number;
    summary: string;
    strengths: string[];
    missingKeywords: string[];
    improvements: string[];
    revisedProfessionalSummary: string;
  } | null>(null);

  async function loadApplications() {
    try {
      setError("");
      setApplications(await api.listApplications());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load applications.");
    }
  }

  async function loadInterviews() {
    try {
      setInterviews(await api.listInterviews());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load interviews.");
    }
  }

  useEffect(() => {
    if (authenticated) {
      void loadApplications();
      void loadInterviews();
    }
  }, [authenticated]);

  const visibleApplications = useMemo(
    () =>
      filter === "ALL"
        ? applications
        : applications.filter((item) => item.status === filter),
    [applications, filter]
  );

  const counts = useMemo(() => {
    return statuses.reduce<Record<Status, number>>(
      (result, status) => {
        result[status] = applications.filter((item) => item.status === status).length;
        return result;
      },
      { SAVED: 0, APPLIED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 }
    );
  }, [applications]);

  async function addApplication(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.createApplication(form);
      setForm(emptyForm);
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add application.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Status) {
    try {
      await api.updateApplication(id, { status });
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status.");
    }
  }

  async function removeApplication(id: string) {
    if (!window.confirm("Delete this application?")) return;

    try {
      await api.deleteApplication(id);
      await loadApplications();
      await loadInterviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete application.");
    }
  }

  async function generateLetter() {
    if (!form.company || !form.role || form.jobDescription.length < 40) {
      setError("Enter a company, role, and a fuller job description first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await api.generateCoverLetter({
        company: form.company,
        role: form.role,
        jobDescription: form.jobDescription,
        candidateBackground:
          "Bachelor's degree in Information Technology–Software Engineering, completed a full-stack web development bootcamp, and professional experience troubleshooting technical and customer issues."
      });

      setCoverLetter(result.draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate a letter.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeResume() {
    if (resumeText.trim().length < 100) {
      setError("Paste at least 100 characters of resume text.");
      return;
    }

    if (form.jobDescription.trim().length < 100) {
      setError("Paste at least 100 characters of the job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResumeAnalysis(null);

    try {
      const result = await api.analyzeResume({
        resumeText,
        jobDescription: form.jobDescription
      });

      setResumeAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze the resume.");
    } finally {
      setLoading(false);
    }
  }

  async function addInterview(event: FormEvent) {
    event.preventDefault();

    if (!interviewForm.applicationId) {
      setError("Choose a job application.");
      return;
    }

    if (!interviewForm.scheduledAt) {
      setError("Choose an interview date and time.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.createInterview({
        ...interviewForm,
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString()
      });

      setInterviewForm(emptyInterviewForm);
      await loadInterviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the interview.");
    } finally {
      setLoading(false);
    }
  }

  async function removeInterview(id: string) {
    if (!window.confirm("Delete this interview?")) return;

    try {
      await api.deleteInterview(id);
      await loadInterviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the interview.");
    }
  }

  if (!authenticated) {
    return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">PORTFOLIO PROJECT</p>
          <h1>CareerTrack AI</h1>
          <p>Organize applications, monitor progress, and prepare for interviews.</p>
        </div>

        <button
          className="secondary"
          onClick={() => {
            clearToken();
            setAuthenticated(false);
          }}
        >
          Log out
        </button>
      </header>

      {error && <div className="alert">{error}</div>}

      <section className="stats-grid">
        {statuses.map((status) => (
          <button className="stat-card" key={status} onClick={() => setFilter(status)}>
            <span>{status.toLowerCase()}</span>
            <strong>{counts[status]}</strong>
          </button>
        ))}
      </section>

      <section className="content-grid">
        <form className="panel" onSubmit={addApplication}>
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
                  setForm({ ...form, company: event.target.value })
                }
              />
            </label>

            <label>
              Role
              <input
                required
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value })
                }
              />
            </label>

            <label>
              Location
              <input
                value={form.location}
                onChange={(event) =>
                  setForm({ ...form, location: event.target.value })
                }
              />
            </label>

            <label>
              Job URL
              <input
                type="url"
                value={form.jobUrl}
                onChange={(event) =>
                  setForm({ ...form, jobUrl: event.target.value })
                }
              />
            </label>
          </div>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm({
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
                setForm({
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
                setForm({ ...form, notes: event.target.value })
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
              onClick={generateLetter}
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
                onChange={(event) => setCoverLetter(event.target.value)}
              />
            </div>
          )}

          <div className="draft">
            <h3>AI Resume Analyzer</h3>

            <label>
              Resume text
              <textarea
                rows={12}
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
              />
            </label>

            <p className="helper-text">
              This compares your resume with the job description entered above.
            </p>

            <button type="button" disabled={loading} onClick={analyzeResume}>
              {loading ? "Analyzing..." : "Analyze resume"}
            </button>

            {resumeAnalysis && (
              <div className="analysis-results">
                <div className="score-card">
                  <span>Match score</span>
                  <strong>{resumeAnalysis.matchScore}%</strong>
                </div>

                <div className="analysis-section">
                  <h3>Overall assessment</h3>
                  <p>{resumeAnalysis.summary}</p>
                </div>

                <div className="analysis-section">
                  <h3>Matching strengths</h3>
                  <ul>
                    {resumeAnalysis.strengths.map((strength) => (
                      <li key={strength}>{strength}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-section">
                  <h3>Missing keywords</h3>
                  <ul>
                    {resumeAnalysis.missingKeywords.map((keyword) => (
                      <li key={keyword}>{keyword}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-section">
                  <h3>Recommended improvements</h3>
                  <ul>
                    {resumeAnalysis.improvements.map((improvement) => (
                      <li key={improvement}>{improvement}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-section">
                  <h3>Revised professional summary</h3>
                  <p>{resumeAnalysis.revisedProfessionalSummary}</p>
                </div>
              </div>
            )}
          </div>
        </form>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PIPELINE</p>
              <h2>Your applications</h2>
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as Status | "ALL")
              }
            >
              <option value="ALL">ALL</option>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="application-list">
            {visibleApplications.length === 0 && (
              <div className="empty-state">No applications in this view yet.</div>
            )}

            {visibleApplications.map((application) => (
              <article className="application-card" key={application.id}>
                <div>
                  <span className={`badge ${application.status.toLowerCase()}`}>
                    {application.status}
                  </span>

                  <h3>{application.role}</h3>

                  <p>
                    {application.company}
                    {application.location ? ` • ${application.location}` : ""}
                  </p>
                </div>

                <select
                  value={application.status}
                  onChange={(event) =>
                    updateStatus(
                      application.id,
                      event.target.value as Status
                    )
                  }
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>

                <div className="card-actions">
                  {application.jobUrl && (
                    <a
                      href={application.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View posting
                    </a>
                  )}

                  <button
                    className="danger-link"
                    type="button"
                    onClick={() => removeApplication(application.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="panel interview-tracker">
        <div className="section-heading">
          <div>
            <p className="eyebrow">INTERVIEW TRACKER</p>
            <h2>Schedule and prepare</h2>
          </div>
        </div>

        <div className="interview-layout">
          <form onSubmit={addInterview}>
            <label>
              Job application
              <select
                required
                value={interviewForm.applicationId}
                onChange={(event) =>
                  setInterviewForm({
                    ...interviewForm,
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
                value={interviewForm.scheduledAt}
                onChange={(event) =>
                  setInterviewForm({
                    ...interviewForm,
                    scheduledAt: event.target.value
                  })
                }
              />
            </label>

            <label>
              Interview type
              <select
                value={interviewForm.interviewType}
                onChange={(event) =>
                  setInterviewForm({
                    ...interviewForm,
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
                value={interviewForm.interviewerName}
                onChange={(event) =>
                  setInterviewForm({
                    ...interviewForm,
                    interviewerName: event.target.value
                  })
                }
              />
            </label>

            <label>
              Location
              <input
                value={interviewForm.location}
                onChange={(event) =>
                  setInterviewForm({
                    ...interviewForm,
                    location: event.target.value
                  })
                }
              />
            </label>

            <label>
              Meeting link
              <input
                type="url"
                value={interviewForm.meetingLink}
                onChange={(event) =>
                  setInterviewForm({
                    ...interviewForm,
                    meetingLink: event.target.value
                  })
                }
              />
            </label>

            <label>
              Preparation notes
              <textarea
                rows={5}
                value={interviewForm.preparationNotes}
                onChange={(event) =>
                  setInterviewForm({
                    ...interviewForm,
                    preparationNotes: event.target.value
                  })
                }
              />
            </label>

            <label>
              Outcome
              <input
                value={interviewForm.outcome}
                onChange={(event) =>
                  setInterviewForm({
                    ...interviewForm,
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
                  onClick={() => removeInterview(interview.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthScreen({
  onAuthenticated
}: {
  onAuthenticated: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("Kevin Jordan");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const result =
        mode === "register"
          ? await api.register(name, email, password)
          : await api.login(email, password);

      setToken(result.token);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-copy">
        <p className="eyebrow">FULL-STACK PORTFOLIO STARTER</p>
        <h1>Turn your job search into a project employers can explore.</h1>
        <p>
          Demonstrate React, TypeScript, REST APIs, authentication, PostgreSQL,
          Prisma, AI integration, responsive design, and deployment.
        </p>
      </section>

      <form className="auth-card" onSubmit={submit}>
        <h2>
          {mode === "register" ? "Create your account" : "Welcome back"}
        </h2>

        {error && <div className="alert">{error}</div>}

        {mode === "register" && (
          <label>
            Name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}

        <label>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button type="submit">
          {mode === "register" ? "Register" : "Log in"}
        </button>

        <button
          className="text-button"
          type="button"
          onClick={() =>
            setMode(mode === "register" ? "login" : "register")
          }
        >
          {mode === "register"
            ? "Already registered? Log in"
            : "Need an account? Register"}
        </button>
      </form>
    </main>
  );
}
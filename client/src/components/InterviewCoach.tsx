import { useMemo, useState } from "react";
import { api } from "../api";
import type {
  InterviewCoachPlan,
  JobApplication,
  ResumeVersion
} from "../types";

type InterviewCoachProps = {
  applications: JobApplication[];
  resumeVersions: ResumeVersion[];
};

export default function InterviewCoach({
  applications,
  resumeVersions
}: InterviewCoachProps) {
  const [applicationId, setApplicationId] = useState("");
  const [resumeVersionId, setResumeVersionId] = useState("");
  const [plan, setPlan] = useState<InterviewCoachPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedApplication = useMemo(
    () =>
      applications.find(
        (application) => application.id === applicationId
      ) ?? null,
    [applications, applicationId]
  );

  const selectedResume = useMemo(
    () =>
      resumeVersions.find(
        (resume) => resume.id === resumeVersionId
      ) ?? null,
    [resumeVersions, resumeVersionId]
  );

  async function generatePlan() {
    if (!selectedApplication) {
      setError("Choose a job application first.");
      return;
    }

    if (
      !selectedApplication.jobDescription ||
      selectedApplication.jobDescription.trim().length < 100
    ) {
      setError(
        "The selected application needs a job description of at least 100 characters."
      );
      return;
    }

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const result = await api.generateInterviewCoach({
        company: selectedApplication.company,
        role: selectedApplication.role,
        jobDescription: selectedApplication.jobDescription,
        resumeText: selectedResume?.resumeText
      });

      setPlan(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate interview preparation."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel interview-coach">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI INTERVIEW COACH</p>
          <h2>Prepare for your next interview</h2>
        </div>
      </div>

      <div className="interview-coach-controls">
        <label>
          Job application
          <select
            value={applicationId}
            onChange={(event) => {
              setApplicationId(event.target.value);
              setPlan(null);
              setError("");
            }}
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
          Resume version
          <select
            value={resumeVersionId}
            onChange={(event) => {
              setResumeVersionId(event.target.value);
              setPlan(null);
              setError("");
            }}
          >
            <option value="">No resume selected</option>

            {resumeVersions.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}
                {resume.isDefault ? " — Default" : ""}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={loading || !selectedApplication}
          onClick={generatePlan}
        >
          {loading ? "Generating preparation..." : "Generate interview plan"}
        </button>
      </div>

      {selectedApplication && (
        <div className="interview-coach-selection">
          <strong>{selectedApplication.role}</strong>
          <span>{selectedApplication.company}</span>
        </div>
      )}

      {error && <div className="alert">{error}</div>}

      {!plan && !loading && applications.length === 0 && (
        <div className="empty-state">
          Add a job application before using the Interview Coach.
        </div>
      )}

      {plan && (
        <div className="interview-coach-results">
          <article className="coach-section">
            <h3>Job overview</h3>
            <p>{plan.jobSummary}</p>
          </article>

          <article className="coach-section">
            <h3>Key skills</h3>
            <div className="coach-tags">
              {plan.keySkills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </article>

          <article className="coach-section">
            <h3>Behavioral questions</h3>

            <div className="coach-question-list">
              {plan.behavioralQuestions.map((item, index) => (
                <details className="coach-question" key={`${item.question}-${index}`}>
                  <summary>
                    {index + 1}. {item.question}
                  </summary>

                  <div className="coach-question-content">
                    <p>
                      <strong>Why it matters:</strong> {item.whyItMatters}
                    </p>

                    <div className="star-grid">
                      <div>
                        <strong>Situation</strong>
                        <p>{item.starGuidance.situation}</p>
                      </div>

                      <div>
                        <strong>Task</strong>
                        <p>{item.starGuidance.task}</p>
                      </div>

                      <div>
                        <strong>Action</strong>
                        <p>{item.starGuidance.action}</p>
                      </div>

                      <div>
                        <strong>Result</strong>
                        <p>{item.starGuidance.result}</p>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </article>

          <article className="coach-section">
            <h3>Technical and role-specific questions</h3>

            <div className="coach-question-list">
              {plan.technicalQuestions.map((item, index) => (
                <details className="coach-question" key={`${item.question}-${index}`}>
                  <summary>
                    {index + 1}. {item.question}
                  </summary>

                  <div className="coach-question-content">
                    <p>{item.answerGuidance}</p>
                  </div>
                </details>
              ))}
            </div>
          </article>

          <div className="coach-two-column">
            <article className="coach-section">
              <h3>Study topics</h3>
              <ul>
                {plan.studyTopics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </article>

            <article className="coach-section">
              <h3>Questions to ask</h3>
              <ul>
                {plan.questionsToAsk.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="coach-section">
            <h3>Preparation checklist</h3>
            <ul className="coach-checklist">
              {plan.preparationChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      )}
    </section>
  );
}
import { useMemo, useState } from "react";
import { api } from "../api";
import type { JobApplication, MockInterviewFeedback } from "../types";

type MockInterviewProps = {
  applications: JobApplication[];
};

export default function MockInterview({ applications }: MockInterviewProps) {
  const [applicationId, setApplicationId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<MockInterviewFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedApplication = useMemo(
    () => applications.find((item) => item.id === applicationId) ?? null,
    [applications, applicationId]
  );

  async function submitAnswer() {
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

    if (question.trim().length < 10) {
      setError("Enter an interview question of at least 10 characters.");
      return;
    }

    if (answer.trim().length < 20) {
      setError("Enter an answer of at least 20 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setFeedback(null);

    try {
      const result = await api.generateMockInterviewFeedback({
        company: selectedApplication.company,
        role: selectedApplication.role,
        question,
        answer,
        jobDescription: selectedApplication.jobDescription
      });

      setFeedback(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to score the interview answer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel mock-interview">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MOCK INTERVIEW MODE</p>
          <h2>Practice and improve your answers</h2>
        </div>
      </div>

      <div className="mock-interview-form">
        <label>
          Job application
          <select
            value={applicationId}
            onChange={(event) => {
              setApplicationId(event.target.value);
              setFeedback(null);
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
          Interview question
          <textarea
            rows={3}
            placeholder="Tell me about a time you solved a difficult problem."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
        </label>

        <label>
          Your answer
          <textarea
            rows={8}
            placeholder="Type your practice answer here..."
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
          />
        </label>

        <button type="button" disabled={loading} onClick={submitAnswer}>
          {loading ? "Scoring answer..." : "Score my answer"}
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      {feedback && (
        <div className="mock-interview-results">
          <div className="mock-score-grid">
            <article><span>Overall</span><strong>{feedback.overallScore}%</strong></article>
            <article><span>Relevance</span><strong>{feedback.relevanceScore}%</strong></article>
            <article><span>Clarity</span><strong>{feedback.clarityScore}%</strong></article>
            <article><span>Structure</span><strong>{feedback.structureScore}%</strong></article>
          </div>

          <div className="mock-feedback-grid">
            <article className="mock-feedback-card">
              <h3>Strengths</h3>
              <ul>
                {feedback.strengths.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>

            <article className="mock-feedback-card">
              <h3>Improvements</h3>
              <ul>
                {feedback.improvements.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          </div>

          <article className="mock-feedback-card">
            <h3>Improved answer</h3>
            <p>{feedback.improvedAnswer}</p>
          </article>

          <article className="mock-feedback-card">
            <h3>Follow-up question</h3>
            <p>{feedback.followUpQuestion}</p>
          </article>
        </div>
      )}
    </section>
  );
}
import { useState } from "react";
import { api } from "../api";
import type { ResumeOptimizerResult } from "../types";

export default function ResumeOptimizer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ResumeOptimizerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function optimizeResume() {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please provide both a resume and a job description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.optimizeResume({
        resumeText,
        jobDescription
      });

      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to optimize resume."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel resume-optimizer">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI RESUME OPTIMIZER</p>
          <h2>Increase your ATS match score</h2>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <label>
        Resume
        <textarea
          rows={10}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume..."
        />
      </label>

      <label>
        Job Description
        <textarea
          rows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description..."
        />
      </label>

      <button
        type="button"
        disabled={loading}
        onClick={optimizeResume}
      >
        {loading ? "Optimizing..." : "Optimize Resume"}
      </button>

      {result && (
        <div className="optimizer-results">

          <div className="match-score-card">
            <h3>Overall ATS Match</h3>
            <div className="match-score">
              {result.overallMatch}%
            </div>
          </div>

          <div className="optimizer-section">
            <h3>Missing Keywords</h3>

            <div className="keyword-list">
              {result.missingKeywords.map((keyword) => (
                <span
                  className="keyword-pill"
                  key={keyword}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="optimizer-section">
            <h3>Recommendations</h3>

            <ul>
              {result.improvements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="optimizer-section">
            <h3>Optimized Professional Summary</h3>

            <textarea
              rows={8}
              value={result.optimizedSummary}
              readOnly
            />
          </div>

          <div className="optimizer-section">
            <h3>Optimized Experience</h3>

            <ul>
              {result.optimizedExperience.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="optimizer-section">
            <h3>Optimized Skills</h3>

            <div className="keyword-list">
              {result.optimizedSkills.map((skill) => (
                <span
                  key={skill}
                  className="keyword-pill success"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
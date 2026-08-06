import { useState } from "react";
import { api } from "../api";
import type { ParsedJobImport } from "../types";

type JobImporterProps = {
  onImported: (job: ParsedJobImport) => void;
};

export default function JobImporter({
  onImported
}: JobImporterProps) {
  const [jobUrl, setJobUrl] = useState("");
  const [postingText, setPostingText] = useState("");
  const [parsedJob, setParsedJob] =
    useState<ParsedJobImport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function parsePosting() {
    if (postingText.trim().length < 100) {
      setError("Paste at least 100 characters of the job posting.");
      return;
    }

    setLoading(true);
    setError("");
    setParsedJob(null);

    try {
      const result = await api.parseJobPosting({
        jobUrl: jobUrl.trim() || undefined,
        postingText
      });

      setParsedJob(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to import the job posting."
      );
    } finally {
      setLoading(false);
    }
  }

  function useImportedJob() {
    if (!parsedJob) return;

    onImported(parsedJob);
    setError("");
  }

  function clearImporter() {
    setJobUrl("");
    setPostingText("");
    setParsedJob(null);
    setError("");
  }

  return (
    <section className="panel job-importer">
      <div className="section-heading">
        <div>
          <p className="eyebrow">JOB IMPORTER</p>
          <h2>Import a job posting</h2>
        </div>

        <button
          className="secondary"
          type="button"
          onClick={clearImporter}
        >
          Clear
        </button>
      </div>

      <p className="helper-text">
        Paste the job URL and the visible posting text. CareerTrack AI
        will organize the details and prefill your application form.
      </p>

      <div className="job-importer-form">
        <label>
          Job URL
          <input
            type="url"
            placeholder="https://company.com/jobs/example"
            value={jobUrl}
            onChange={(event) => setJobUrl(event.target.value)}
          />
        </label>

        <label>
          Job posting text
          <textarea
            rows={12}
            placeholder="Copy and paste the full job posting here..."
            value={postingText}
            onChange={(event) => setPostingText(event.target.value)}
          />
        </label>

        <button
          type="button"
          disabled={loading}
          onClick={parsePosting}
        >
          {loading ? "Importing job..." : "Parse job posting"}
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      {parsedJob && (
        <div className="job-import-preview">
          <div className="section-heading">
            <div>
              <p className="eyebrow">IMPORT PREVIEW</p>
              <h3>
                {parsedJob.role || "Untitled role"}
                {parsedJob.company
                  ? ` at ${parsedJob.company}`
                  : ""}
              </h3>
            </div>
          </div>

          <div className="job-import-grid">
            <article>
              <span>Company</span>
              <strong>{parsedJob.company || "Not found"}</strong>
            </article>

            <article>
              <span>Role</span>
              <strong>{parsedJob.role || "Not found"}</strong>
            </article>

            <article>
              <span>Location</span>
              <strong>{parsedJob.location || "Not found"}</strong>
            </article>

            <article>
              <span>Salary</span>
              <strong>{parsedJob.salary || "Not found"}</strong>
            </article>
          </div>

          {parsedJob.notes && (
            <div className="job-import-notes">
              <h3>Extracted notes</h3>
              <p>{parsedJob.notes}</p>
            </div>
          )}

          <div className="button-row">
            <button type="button" onClick={useImportedJob}>
              Use in application form
            </button>

            {parsedJob.jobUrl && (
              <a
                className="secondary-link"
                href={parsedJob.jobUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open original posting
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
export type ResumeAnalysis = {
  matchScore: number;
  summary: string;
  strengths: string[];
  missingKeywords: string[];
  improvements: string[];
  revisedProfessionalSummary: string;
};

type ResumeAnalyzerProps = {
  resumeText: string;
  analysis: ResumeAnalysis | null;
  loading: boolean;
  onResumeTextChange: (value: string) => void;
  onAnalyze: () => void;
};

export default function ResumeAnalyzer({
  resumeText,
  analysis,
  loading,
  onResumeTextChange,
  onAnalyze
}: ResumeAnalyzerProps) {
  return (
    <section className="panel resume-analyzer">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI RESUME ANALYZER</p>
          <h2>Compare your resume to the job</h2>
        </div>
      </div>

      <label>
        Resume text
        <textarea
          rows={12}
          placeholder="Paste your resume text here..."
          value={resumeText}
          onChange={(event) => onResumeTextChange(event.target.value)}
        />
      </label>

      <p className="helper-text">
        This compares your resume with the job description entered above.
      </p>

      <button type="button" disabled={loading} onClick={onAnalyze}>
        {loading ? "Analyzing..." : "Analyze resume"}
      </button>

      {analysis && (
        <div className="analysis-results">
          <div className="score-card">
            <span>Match score</span>
            <strong>{analysis.matchScore}%</strong>
          </div>

          <div className="analysis-section">
            <h3>Overall assessment</h3>
            <p>{analysis.summary}</p>
          </div>

          <div className="analysis-section">
            <h3>Matching strengths</h3>
            <ul>
              {analysis.strengths.map((strength) => (
                <li key={strength}>{strength}</li>
              ))}
            </ul>
          </div>

          <div className="analysis-section">
            <h3>Missing keywords</h3>
            <ul>
              {analysis.missingKeywords.map((keyword) => (
                <li key={keyword}>{keyword}</li>
              ))}
            </ul>
          </div>

          <div className="analysis-section">
            <h3>Recommended improvements</h3>
            <ul>
              {analysis.improvements.map((improvement) => (
                <li key={improvement}>{improvement}</li>
              ))}
            </ul>
          </div>

          <div className="analysis-section">
            <h3>Revised professional summary</h3>
            <p>{analysis.revisedProfessionalSummary}</p>
          </div>
        </div>
      )}
    </section>
  );
}
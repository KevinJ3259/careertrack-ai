import type { JobApplication } from "../types";

type ConversionMetricsProps = {
  applications: JobApplication[];
};

export default function ConversionMetrics({
  applications
}: ConversionMetricsProps) {
  const total = applications.length;

  const applied = applications.filter((application) =>
    ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"].includes(
      application.status
    )
  ).length;

  const interviews = applications.filter((application) =>
    ["INTERVIEW", "OFFER"].includes(application.status)
  ).length;

  const offers = applications.filter(
    (application) => application.status === "OFFER"
  ).length;

  const interviewRate =
    applied > 0 ? Math.round((interviews / applied) * 100) : 0;

  const offerRate =
    interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

  const applicationRate =
    total > 0 ? Math.round((applied / total) * 100) : 0;

  return (
    <section className="panel conversion-metrics">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CONVERSION METRICS</p>
          <h2>Job-search performance</h2>
        </div>
      </div>

      <div className="conversion-grid">
        <article className="conversion-card">
          <strong>{applicationRate}%</strong>
          <p>Saved → Applied</p>
        </article>

        <article className="conversion-card">
          <strong>{interviewRate}%</strong>
          <p>Application → Interview</p>
        </article>

        <article className="conversion-card">
          <strong>{offerRate}%</strong>
          <p>Interview → Offer</p>
        </article>
      </div>
    </section>
  );
}
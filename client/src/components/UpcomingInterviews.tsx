import type { Interview, JobApplication } from "../types";

type UpcomingInterviewsProps = {
  interviews: Interview[];
  applications: JobApplication[];
  onPrepare?: () => void;
};

export default function UpcomingInterviews({
  interviews,
  applications,
  onPrepare
}: UpcomingInterviewsProps) {
  const upcoming = interviews
    .filter(
      (interview) =>
        new Date(interview.scheduledAt).getTime() > Date.now()
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
    )
    .slice(0, 4);

  function getApplication(applicationId: string) {
    return applications.find(
      (application) => application.id === applicationId
    );
  }

  return (
    <section className="panel upcoming-interviews">
      <div className="section-heading">
        <div>
          <p className="eyebrow">UPCOMING INTERVIEWS</p>
          <h2>Prepare for what’s next</h2>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty-state">
          No upcoming interviews scheduled.
        </div>
      ) : (
        <div className="upcoming-interview-list">
          {upcoming.map((interview) => {
            const application = getApplication(
              interview.applicationId
            );

            return (
              <article
                className="upcoming-interview-card"
                key={interview.id}
              >
                <div>
                  <strong>
                    {application?.company ?? "Company"}
                  </strong>

                  <p>
                    {application?.role ?? "Job opportunity"}
                  </p>

                  <span>
                    {interview.interviewType}
                  </span>
                </div>

                <div className="interview-date">
                  <strong>
                    {new Date(
                      interview.scheduledAt
                    ).toLocaleDateString()}
                  </strong>

                  <span>
                    {new Date(
                      interview.scheduledAt
                    ).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                {onPrepare && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={onPrepare}
                  >
                    Prepare
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
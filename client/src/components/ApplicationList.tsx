import type { JobApplication, Status } from "../types";

type ApplicationListProps = {
  applications: JobApplication[];
  filter: Status | "ALL";
  statuses: Status[];
  onFilterChange: (filter: Status | "ALL") => void;
  onStatusChange: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
};

export default function ApplicationList({
  applications,
  filter,
  statuses,
  onFilterChange,
  onStatusChange,
  onDelete
}: ApplicationListProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PIPELINE</p>
          <h2>Your applications</h2>
        </div>

        <select
          value={filter}
          onChange={(event) =>
            onFilterChange(event.target.value as Status | "ALL")
          }
        >
          <option value="ALL">ALL</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="application-list">
        {applications.length === 0 && (
          <div className="empty-state">No applications in this view yet.</div>
        )}

        {applications.map((application) => (
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
                onStatusChange(
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
                onClick={() => onDelete(application.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
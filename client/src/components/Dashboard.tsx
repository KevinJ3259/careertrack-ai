import type { Status } from "../types";

type DashboardProps = {
  statuses: Status[];
  counts: Record<Status, number>;
  onFilterChange: (status: Status) => void;
};

export default function Dashboard({
  statuses,
  counts,
  onFilterChange
}: DashboardProps) {
  return (
    <section className="stats-grid">
      {statuses.map((status) => (
        <button
          className="stat-card"
          key={status}
          type="button"
          onClick={() => onFilterChange(status)}
        >
          <span>{status.toLowerCase()}</span>
          <strong>{counts[status]}</strong>
        </button>
      ))}
    </section>
  );
}
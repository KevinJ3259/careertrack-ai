import type { Status } from "../types";

export type DashboardFilterState = {
  status: Status | "ALL";
  company: string;
  location: string;
};

type DashboardFiltersProps = {
  filters: DashboardFilterState;
  companies: string[];
  locations: string[];
  statuses: Status[];
  onChange: (filters: DashboardFilterState) => void;
  onClear: () => void;
};

export default function DashboardFilters({
  filters,
  companies,
  locations,
  statuses,
  onChange,
  onClear
}: DashboardFiltersProps) {
  return (
    <section className="panel dashboard-filters">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DASHBOARD FILTERS</p>
          <h2>Filter application data</h2>
        </div>

        <button className="secondary" type="button" onClick={onClear}>
          Clear filters
        </button>
      </div>

      <div className="dashboard-filter-grid">
        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as Status | "ALL"
              })
            }
          >
            <option value="ALL">All statuses</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          Company
          <select
            value={filters.company}
            onChange={(event) =>
              onChange({
                ...filters,
                company: event.target.value
              })
            }
          >
            <option value="">All companies</option>

            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </label>

        <label>
          Location
          <select
            value={filters.location}
            onChange={(event) =>
              onChange({
                ...filters,
                location: event.target.value
              })
            }
          >
            <option value="">All locations</option>

            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

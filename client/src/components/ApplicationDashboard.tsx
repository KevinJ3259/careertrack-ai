import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { JobApplication, Status } from "../types";

type ApplicationDashboardProps = {
  applications: JobApplication[];
};

const statusOrder: Status[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED"
];

const chartColors = [
  "#2563eb",
  "#7c3aed",
  "#f59e0b",
  "#16a34a",
  "#dc2626"
];

export default function ApplicationDashboard({
  applications
}: ApplicationDashboardProps) {
  const statusData = useMemo(
    () =>
      statusOrder.map((status) => ({
        status,
        count: applications.filter(
          (application) => application.status === status
        ).length
      })),
    [applications]
  );

  const monthlyData = useMemo(() => {
    const months = new Map<
      string,
      {
        sortKey: string;
        month: string;
        applications: number;
        interviews: number;
        offers: number;
      }
    >();

    applications.forEach((application) => {
      const date = new Date(
        application.appliedAt ?? application.createdAt
      );

      if (Number.isNaN(date.getTime())) return;

      const sortKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const current = months.get(sortKey) ?? {
        sortKey,
        month: date.toLocaleDateString(undefined, {
          month: "short",
          year: "numeric"
        }),
        applications: 0,
        interviews: 0,
        offers: 0
      };

      current.applications += 1;

      if (
        application.status === "INTERVIEW" ||
        application.status === "OFFER"
      ) {
        current.interviews += 1;
      }

      if (application.status === "OFFER") {
        current.offers += 1;
      }

      months.set(sortKey, current);
    });

    return Array.from(months.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6);
  }, [applications]);

  const totals = useMemo(() => {
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

    return {
      total: applications.length,
      applied,
      interviews,
      offers,
      interviewRate:
        applied === 0 ? 0 : Math.round((interviews / applied) * 100),
      offerRate:
        interviews === 0 ? 0 : Math.round((offers / interviews) * 100)
    };
  }, [applications]);

  return (
    <section className="panel application-dashboard">
      <div className="section-heading">
        <div>
          <p className="eyebrow">APPLICATION DASHBOARD</p>
          <h2>Your job-search progress</h2>
        </div>
      </div>

      <div className="dashboard-metrics">
        <article className="dashboard-metric">
          <span>Total applications</span>
          <strong>{totals.total}</strong>
        </article>

        <article className="dashboard-metric">
          <span>Submitted</span>
          <strong>{totals.applied}</strong>
        </article>

        <article className="dashboard-metric">
          <span>Interview rate</span>
          <strong>{totals.interviewRate}%</strong>
        </article>

        <article className="dashboard-metric">
          <span>Offer rate</span>
          <strong>{totals.offerRate}%</strong>
        </article>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          Add job applications to populate your charts.
        </div>
      ) : (
        <div className="dashboard-chart-grid">
          <article className="dashboard-chart-card">
            <div className="dashboard-chart-heading">
              <h3>Applications by status</h3>
              <p>Current distribution across your pipeline.</p>
            </div>

            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={entry.status}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="dashboard-chart-card">
            <div className="dashboard-chart-heading">
              <h3>Applications by month</h3>
              <p>Your activity across the latest six active months.</p>
            </div>

            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="applications"
                    name="Applications"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="interviews"
                    name="Interview stage"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="offers"
                    name="Offers"
                    fill="#16a34a"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { SavedMockInterviewResult } from "../types";

type MockInterviewProgressProps = {
  results: SavedMockInterviewResult[];
};

export default function MockInterviewProgress({
  results
}: MockInterviewProgressProps) {

    const [companyFilter, setCompanyFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState(""); 

  const companies = useMemo(
  () =>
    Array.from(
      new Set(results.map((result) => result.company))
    ).sort(),
  [results]
);

const roles = useMemo(
  () =>
    Array.from(
      new Set(results.map((result) => result.role))
    ).sort(),
  [results]
);

const chartData = useMemo(
  () =>
    [...results]
      .filter((result) => {
        const matchesCompany =
          !companyFilter || result.company === companyFilter;

        const matchesRole =
          !roleFilter || result.role === roleFilter;

        return matchesCompany && matchesRole;
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      )
      .map((result, index) => ({
        attempt: `Attempt ${index + 1}`,
        date: new Date(result.createdAt).toLocaleDateString(),
        company: result.company,
        role: result.role,
        overall: result.overallScore,
        relevance: result.relevanceScore,
        clarity: result.clarityScore,
        structure: result.structureScore
      })),
  [results, companyFilter, roleFilter]
);

  if (results.length === 0) {
    return (
      <section className="mock-progress-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SCORE PROGRESS</p>
            <h3>Mock interview improvement</h3>
          </div>
        </div>

        <div className="empty-state">
          Save mock interview results to see your progress chart.
        </div>
      </section>
    );
  }

  return (
    <section className="mock-progress-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">SCORE PROGRESS</p>
          <h3>Mock interview improvement</h3>
        </div>
      </div>

      <div className="mock-progress-filters">
  <label>
    Company
    <select
      value={companyFilter}
      onChange={(event) => setCompanyFilter(event.target.value)}
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
    Role
    <select
      value={roleFilter}
      onChange={(event) => setRoleFilter(event.target.value)}
    >
      <option value="">All roles</option>

      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  </label>
</div>

      <div className="mock-progress-chart">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="attempt" />
            <YAxis domain={[0, 100]} allowDecimals={false} />
            <Tooltip
              labelFormatter={(value, payload) => {
                const date = payload?.[0]?.payload?.date;
                return date ? `${value} — ${date}` : value;
              }}
            />
            <Legend />

            <Line
              type="monotone"
              dataKey="overall"
              name="Overall"
              stroke="#2563eb"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />

            <Line
              type="monotone"
              dataKey="relevance"
              name="Relevance"
              stroke="#7c3aed"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="clarity"
              name="Clarity"
              stroke="#f59e0b"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="structure"
              name="Structure"
              stroke="#16a34a"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
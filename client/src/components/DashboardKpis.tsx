import type {
  Interview,
  JobApplication,
  Reminder
} from "../types";

type DashboardKpisProps = {
  applications: JobApplication[];
  interviews: Interview[];
  reminders: Reminder[];
};

export default function DashboardKpis({
  applications,
  interviews,
  reminders
}: DashboardKpisProps) {
  const offers = applications.filter(
    (application) => application.status === "OFFER"
  ).length;

  const activeReminders = reminders.filter(
    (reminder) => !reminder.isSent
  ).length;

  return (
    <section className="dashboard-kpis">
      <article className="kpi-card">
        <p>Applications</p>
        <strong>{applications.length}</strong>
        <span>Total tracked</span>
      </article>

      <article className="kpi-card">
        <p>Interviews</p>
        <strong>{interviews.length}</strong>
        <span>Scheduled interviews</span>
      </article>

      <article className="kpi-card">
        <p>Offers</p>
        <strong>{offers}</strong>
        <span>Offers received</span>
      </article>

      <article className="kpi-card">
        <p>Reminders</p>
        <strong>{activeReminders}</strong>
        <span>Upcoming follow-ups</span>
      </article>
    </section>
  );
}
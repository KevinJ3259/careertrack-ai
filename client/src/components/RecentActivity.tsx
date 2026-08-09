import type {
  Interview,
  JobApplication,
  Reminder
} from "../types";

type RecentActivityProps = {
  applications: JobApplication[];
  interviews: Interview[];
  reminders: Reminder[];
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  date: Date;
};

export default function RecentActivity({
  applications,
  interviews,
  reminders
}: RecentActivityProps) {
  const activity: ActivityItem[] = [
    ...applications.map((application) => ({
      id: `application-${application.id}`,
      title: "Application updated",
      detail: `${application.company} — ${application.role}`,
      date: new Date(application.updatedAt)
    })),

    ...interviews.map((interview) => ({
      id: `interview-${interview.id}`,
      title: "Interview scheduled",
      detail: interview.interviewType,
      date: new Date(interview.createdAt)
    })),

    ...reminders.map((reminder) => ({
      id: `reminder-${reminder.id}`,
      title: reminder.isSent
        ? "Reminder completed"
        : "Reminder created",
      detail: reminder.title,
      date: new Date(reminder.updatedAt)
    }))
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  return (
    <section className="panel recent-activity">
      <div className="section-heading">
        <div>
          <p className="eyebrow">RECENT ACTIVITY</p>
          <h2>Latest job-search activity</h2>
        </div>
      </div>

      {activity.length === 0 ? (
        <div className="empty-state">
          Your recent activity will appear here.
        </div>
      ) : (
        <div className="activity-list">
          {activity.map((item) => (
            <article
              className="activity-item"
              key={item.id}
            >
              <div className="activity-dot" />

              <div className="activity-content">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>

              <time>
                {item.date.toLocaleDateString()}
              </time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
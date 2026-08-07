import type { Reminder } from "../types";

type UpcomingRemindersProps = {
  reminders: Reminder[];
};

export default function UpcomingReminders({
  reminders
}: UpcomingRemindersProps) {
  const upcoming = reminders
    .filter((reminder) => !reminder.isSent)
    .sort(
      (a, b) =>
        new Date(a.dueAt).getTime() -
        new Date(b.dueAt).getTime()
    )
    .slice(0, 5);

  return (
    <section className="panel upcoming-reminders">
      <div className="section-heading">
        <div>
          <p className="eyebrow">UPCOMING REMINDERS</p>
          <h2>What needs your attention</h2>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="empty-state">
          No upcoming reminders.
        </div>
      ) : (
        <div className="upcoming-reminder-list">
          {upcoming.map((reminder) => (
            <article
              key={reminder.id}
              className="upcoming-reminder-card"
            >
              <div>
                <strong>{reminder.title}</strong>

                {reminder.application && (
                  <p>
                    {reminder.application.company} —{" "}
                    {reminder.application.role}
                  </p>
                )}
              </div>

              <span>
                {new Date(reminder.dueAt).toLocaleString()}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { JobApplication, Reminder, ReminderType } from "../types";

type ReminderManagerProps = {
  applications: JobApplication[];
  onRemindersChanged?: () => void;
};

type ReminderForm = {
  reminderType: ReminderType;
  title: string;
  message: string;
  recipientEmail: string;
  dueAt: string;
  applicationId: string;
};

const emptyReminderForm: ReminderForm = {
  reminderType: "APPLICATION_FOLLOW_UP",
  title: "",
  message: "",
  recipientEmail: "",
  dueAt: "",
  applicationId: ""
};

const reminderTypeLabels: Record<ReminderType, string> = {
  APPLICATION_FOLLOW_UP: "Application follow-up",
  INTERVIEW_REMINDER: "Interview reminder",
  THANK_YOU_EMAIL: "Thank-you email",
  STATUS_CHECK: "Status check",
  CUSTOM: "Custom reminder"
};

export default function ReminderManager({
  applications,
  onRemindersChanged
}: ReminderManagerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [form, setForm] = useState<ReminderForm>(emptyReminderForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadReminders() {
    try {
      setError("");
      setReminders(await api.listReminders());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reminders.");
    }
  }

  useEffect(() => {
    void loadReminders();
  }, []);

  const upcomingReminders = useMemo(
    () => reminders.filter((reminder) => !reminder.isSent),
    [reminders]
  );

  const completedReminders = useMemo(
    () => reminders.filter((reminder) => reminder.isSent),
    [reminders]
  );

  async function createReminder(event: FormEvent) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Enter a reminder title.");
      return;
    }

    if (!form.dueAt) {
      setError("Choose a reminder date and time.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.createReminder({
        reminderType: form.reminderType,
        title: form.title.trim(),
        message: form.message.trim() || undefined,
        recipientEmail: form.recipientEmail.trim() || undefined,
        dueAt: new Date(form.dueAt).toISOString(),
        applicationId: form.applicationId || undefined
      });

      setForm(emptyReminderForm);
      await loadReminders();
      onRemindersChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the reminder.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleReminder(reminder: Reminder) {
    try {
      setError("");
      await api.updateReminder(reminder.id, { isSent: !reminder.isSent });
      await loadReminders();
      onRemindersChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the reminder.");
    }
  }

  async function removeReminder(id: string) {
    if (!window.confirm("Delete this reminder?")) return;

    try {
      setError("");
      await api.deleteReminder(id);
      await loadReminders();
      onRemindersChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the reminder.");
    }
  }

  function renderReminder(reminder: Reminder) {
    return (
      <article className="reminder-card" key={reminder.id}>
        <div className="reminder-card-header">
          <div>
            <p className="eyebrow">
              {reminderTypeLabels[reminder.reminderType]}
            </p>
            <h3>{reminder.title}</h3>
          </div>

          <span className={reminder.isSent ? "status-complete" : "status-pending"}>
            {reminder.isSent ? "Completed" : "Upcoming"}
          </span>
        </div>

        {reminder.application && (
          <p>
            {reminder.application.company} — {reminder.application.role}
          </p>
        )}

        <p>Due: {new Date(reminder.dueAt).toLocaleString()}</p>

        {reminder.recipientEmail && <p>Email: {reminder.recipientEmail}</p>}
        {reminder.message && <p className="reminder-message">{reminder.message}</p>}

        <div className="card-actions">
          <button
            className="secondary"
            type="button"
            onClick={() => toggleReminder(reminder)}
          >
            {reminder.isSent ? "Mark upcoming" : "Mark completed"}
          </button>

          <button
            className="danger-link"
            type="button"
            onClick={() => removeReminder(reminder.id)}
          >
            Delete
          </button>
        </div>
      </article>
    );
  }

  return (
    <section className="panel reminder-manager">
      <div className="section-heading">
        <div>
          <p className="eyebrow">EMAIL REMINDERS</p>
          <h2>Plan follow-ups and important tasks</h2>
        </div>
      </div>

      <div className="reminder-layout">
        <form className="reminder-form" onSubmit={createReminder}>
          <label>
            Reminder type
            <select
              value={form.reminderType}
              onChange={(event) =>
                setForm({
                  ...form,
                  reminderType: event.target.value as ReminderType
                })
              }
            >
              {Object.entries(reminderTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Job application
            <select
              value={form.applicationId}
              onChange={(event) =>
                setForm({ ...form, applicationId: event.target.value })
              }
            >
              <option value="">No application selected</option>

              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.company} — {application.role}
                </option>
              ))}
            </select>
          </label>

          <label>
            Title
            <input
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Follow up on application"
            />
          </label>

          <label>
            Due date and time
            <input
              required
              type="datetime-local"
              value={form.dueAt}
              onChange={(event) => setForm({ ...form, dueAt: event.target.value })}
            />
          </label>

          <label>
            Recipient email
            <input
              type="email"
              value={form.recipientEmail}
              onChange={(event) =>
                setForm({ ...form, recipientEmail: event.target.value })
              }
              placeholder="recruiter@example.com"
            />
          </label>

          <label>
            Message
            <textarea
              rows={5}
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              placeholder="Add notes or a follow-up message..."
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save reminder"}
          </button>
        </form>

        <div className="reminder-lists">
          {error && <div className="alert">{error}</div>}

          <div>
            <div className="section-heading">
              <div>
                <p className="eyebrow">UPCOMING</p>
                <h3>Pending reminders</h3>
              </div>
            </div>

            {upcomingReminders.length === 0 ? (
              <div className="empty-state">No upcoming reminders.</div>
            ) : (
              <div className="reminder-list">
                {upcomingReminders.map(renderReminder)}
              </div>
            )}
          </div>

          <div>
            <div className="section-heading">
              <div>
                <p className="eyebrow">COMPLETED</p>
                <h3>Reminder history</h3>
              </div>
            </div>

            {completedReminders.length === 0 ? (
              <div className="empty-state">No completed reminders.</div>
            ) : (
              <div className="reminder-list">
                {completedReminders.map(renderReminder)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
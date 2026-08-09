import type {
  Interview,
  JobApplication,
  Reminder
} from "../types";

type DashboardRecommendationsProps = {
  applications: JobApplication[];
  interviews: Interview[];
  reminders: Reminder[];
};

export default function DashboardRecommendations({
  applications,
  interviews,
  reminders
}: DashboardRecommendationsProps) {
  const appliedCount = applications.filter(
    (application) => application.status === "APPLIED"
  ).length;

  const interviewCount = applications.filter(
    (application) => application.status === "INTERVIEW"
  ).length;

  const upcomingReminders = reminders.filter(
    (reminder) => !reminder.isSent
  ).length;

  const upcomingInterviews = interviews.filter(
    (interview) =>
      new Date(interview.scheduledAt).getTime() > Date.now()
  ).length;

  const recommendations: string[] = [];

  if (appliedCount === 0) {
    recommendations.push(
      "Move saved jobs to Applied once you submit applications."
    );
  }

  if (appliedCount > 0 && interviewCount === 0) {
    recommendations.push(
      "Use the Resume Optimizer on active applications to improve ATS alignment."
    );
  }

  if (upcomingInterviews > 0) {
    recommendations.push(
      `Prepare for ${upcomingInterviews} upcoming interview${
        upcomingInterviews === 1 ? "" : "s"
      } using Interview Coach.`
    );
  }

  if (upcomingReminders > 0) {
    recommendations.push(
      `You have ${upcomingReminders} follow-up reminder${
        upcomingReminders === 1 ? "" : "s"
      } that need attention.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Your job-search workflow is up to date. Consider importing new opportunities."
    );
  }

  return (
    <section className="panel dashboard-recommendations">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CAREER INSIGHTS</p>
          <h2>Recommended next actions</h2>
        </div>
      </div>

      <div className="recommendation-list">
        {recommendations.map((recommendation) => (
          <div
            className="recommendation-item"
            key={recommendation}
          >
            <span className="recommendation-icon">✓</span>
            <p>{recommendation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
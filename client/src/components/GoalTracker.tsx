type GoalTrackerProps = {
  totalApplications: number;
  interviews: number;
  offers: number;
};

const goals = {
  applications: 50,
  interviews: 10,
  offers: 3
};

function getPercent(current: number, goal: number) {
  return Math.min(100, Math.round((current / goal) * 100));
}

export default function GoalTracker({
  totalApplications,
  interviews,
  offers
}: GoalTrackerProps) {
  const applicationPercent = getPercent(
    totalApplications,
    goals.applications
  );

  const interviewPercent = getPercent(
    interviews,
    goals.interviews
  );

  const offerPercent = getPercent(
    offers,
    goals.offers
  );

  return (
    <section className="panel goal-tracker">
      <div className="section-heading">
        <div>
          <p className="eyebrow">GOAL TRACKER</p>
          <h2>Track your progress</h2>
        </div>
      </div>

      <div className="goal-list">
        <article className="goal-item">
          <div className="goal-heading">
            <span>Applications</span>
            <strong>
              {totalApplications} / {goals.applications}
            </strong>
          </div>

          <div className="goal-progress">
            <div style={{ width: `${applicationPercent}%` }} />
          </div>
        </article>

        <article className="goal-item">
          <div className="goal-heading">
            <span>Interviews</span>
            <strong>
              {interviews} / {goals.interviews}
            </strong>
          </div>

          <div className="goal-progress">
            <div style={{ width: `${interviewPercent}%` }} />
          </div>
        </article>

        <article className="goal-item">
          <div className="goal-heading">
            <span>Offers</span>
            <strong>
              {offers} / {goals.offers}
            </strong>
          </div>

          <div className="goal-progress">
            <div style={{ width: `${offerPercent}%` }} />
          </div>
        </article>
      </div>
    </section>
  );
}
import ProgressBar from "./ProgressBar";
import RecommendationCard from "./RecommendationCard";
import StatsCard from "./StatsCard";

export default function DashboardStats({ stats }) {
  if (!stats) {
    return (
      <div className="widget dashboard-loading">
        <h3>Loading dashboard...</h3>
        <p>Neko is checking your progress 🐱</p>
      </div>
    );
  }

  const productivityScore = Math.min(
    100,
    Math.max(0, Number(stats.productivity_score) || 0)
  );

  const totalTasks = Number(stats.total_tasks) || 0;
  const completedTasks = Number(stats.completed_tasks) || 0;
  const pendingTasks = Number(stats.pending_tasks) || 0;

  let recommendation = "Let's finish one task together! 🐱";

  if (totalTasks === 0) {
    recommendation =
      "You don't have any tasks yet. Let's plan your day!";
  } else if (pendingTasks === 0) {
    recommendation =
      "Amazing! You completed every task today! 🎉";
  } else if (productivityScore >= 80) {
    recommendation =
      "Amazing work! You're having a fantastic day! 🎉";
  } else if (productivityScore >= 50) {
    recommendation =
      "You're making good progress. Keep going! 🚀";
  }

  return (
    <section className="dashboard-stats">
      <div className="cards">
        <StatsCard
          title="Productivity"
          value={`${productivityScore}%`}
          icon="📈"
        />

        <StatsCard
          title="Total Tasks"
          value={totalTasks}
          icon="📝"
        />

        <StatsCard
          title="Completed"
          value={completedTasks}
          icon="✅"
        />

        <StatsCard
          title="Pending"
          value={pendingTasks}
          icon="⏳"
        />
      </div>

      <h3>Today's Progress</h3>

      <ProgressBar value={productivityScore} />

      <RecommendationCard message={recommendation} />
    </section>
  );
}
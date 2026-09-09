export default function StatsCard({
  title,
  value,
  icon,
  progress,
  onClick,
}) {
  function handleKeyDown(event) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      onClick?.();
    }
  }

  return (
    <article
      className="dashboard-stat-card"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="stat-card-top">
        <span className="stat-card-icon">
          {icon}
        </span>

        <span className="stat-card-arrow">
          →
        </span>
      </div>

      <strong className="stat-card-value">
        {value}
      </strong>

      <span className="stat-card-label">
        {title}
      </span>

      {typeof progress === "number" && (
        <div className="stat-progress-track">
          <div
            className="stat-progress-fill"
            style={{
              width: `${Math.min(
                Math.max(progress, 0),
                100
              )}%`,
            }}
          />
        </div>
      )}
    </article>
  );
}
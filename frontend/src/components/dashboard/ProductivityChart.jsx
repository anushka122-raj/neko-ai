import "./Dashboard.css";

export default function ProductivityChart({ value = 0 }) {
  const productivity = Math.min(
    100,
    Math.max(0, Number(value) || 0)
  );

  return (
    <div className="widget productivity-card">
      <h2>📈 Productivity</h2>

      <h1>{productivity}%</h1>

      <p>Based on completed tasks</p>

      <div
        className="progress-line"
        role="progressbar"
        aria-label="Productivity progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={productivity}
      >
        <div
          className="progress-fill"
          style={{ width: `${productivity}%` }}
        />
      </div>
    </div>
  );
}
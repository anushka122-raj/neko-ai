import "./ProgressBar.css";

export default function ProgressBar({
  value = 0,
}) {
  const progress = Math.min(
    100,
    Math.max(0, Number(value) || 0)
  );

  return (
    <div
      className="progress"
      role="progressbar"
      aria-label="Productivity Progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="fill"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
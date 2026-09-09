import "./RecommendationCard.css";

export default function RecommendationCard({
  message = "You're doing great today! 🐱",
}) {
  return (
    <div
      className="recommendation"
      role="status"
      aria-live="polite"
    >
      <span className="recommendation-icon">
        🐱
      </span>

      <span className="recommendation-text">
        {message}
      </span>
    </div>
  );
}
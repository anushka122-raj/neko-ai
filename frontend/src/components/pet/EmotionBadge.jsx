const COLORS = {
  happy: "#22c55e",
  idle: "#6b7280",
  thinking: "#3b82f6",
  sleep: "#8b5cf6",
  sad: "#ef4444",
  celebrate: "#f59e0b",
};

export default function EmotionBadge({
  emotion = "idle",
}) {
  const color =
    COLORS[emotion] || COLORS.idle;

  return (
    <span
      className="emotion-badge"
      style={{
        backgroundColor: color,
        color: "#ffffff",
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "0.85rem",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {emotion}
    </span>
  );
}
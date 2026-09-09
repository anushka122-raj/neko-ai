import "./Dashboard.css";

export default function MoodCard({
  emotion = "Happy 😊",
  energy = 94,
  message = "Neko is ready to help you today!",
}) {
  return (
    <div className="widget mood-card">
      <h2>🐱 Neko Mood</h2>

      <h1>{emotion}</h1>

      <p>Energy: {energy}%</p>

      <small>{message}</small>
    </div>
  );
}
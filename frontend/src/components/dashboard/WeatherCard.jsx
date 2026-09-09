import "./WeatherCard.css";

export default function WeatherCard({
  temperature = "--",
  city = "Jaipur",
  condition = "Loading...",
}) {
  return (
    <div className="widget weather-card">
      <h2>🌤 Weather</h2>

      <h1>{temperature}°C</h1>

      <p>{city}</p>

      <small>{condition}</small>
    </div>
  );
}
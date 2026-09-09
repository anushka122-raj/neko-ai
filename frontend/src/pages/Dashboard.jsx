import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDashboardStats } from "../services/analytics";

import StatsCard from "../components/dashboard/StatsCard";
import InsightCard from "../components/dashboard/InsightCard";

import "../styles/dashboard.css";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";

  return "Good night";
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";

  return "🌤️";
}

function getWeatherLabel(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";

  return "Current conditions";
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");

  const [loadingError, setLoadingError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoadingError("");

        const data = await getDashboardStats();

        setStats(data);
      } catch (error) {
        console.error("Dashboard error:", error);

        setLoadingError(
          "Dashboard statistics could not be loaded."
        );
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    loadWeather();
  }, []);

  function loadWeather() {
    if (!navigator.geolocation) {
      setWeatherError("Location is unavailable.");
      return;
    }

    setWeatherError("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const parameters = new URLSearchParams({
            latitude: coords.latitude.toString(),
            longitude: coords.longitude.toString(),
            current:
              "temperature_2m,apparent_temperature,weather_code,relative_humidity_2m",
            timezone: "auto",
          });

          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${parameters}`
          );

          if (!response.ok) {
            throw new Error("Weather request failed.");
          }

          const data = await response.json();

          setWeather({
            temperature: Math.round(
              data.current.temperature_2m
            ),
            feelsLike: Math.round(
              data.current.apparent_temperature
            ),
            humidity:
              data.current.relative_humidity_2m,
            weatherCode: data.current.weather_code,
          });
        } catch (error) {
          console.error("Weather error:", error);
          setWeatherError("Weather unavailable.");
        }
      },
      () => {
        setWeatherError(
          "Allow location access to view local weather."
        );
      },
      {
        timeout: 10000,
        maximumAge: 600000,
      }
    );
  }

  function openTasks(filter = "all") {
    navigate(`/tasks?filter=${filter}`);
  }

  if (!stats && !loadingError) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-cat">
          🐱
        </div>

        <p>Preparing your workspace...</p>
      </div>
    );
  }

  const formattedTime = currentTime.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const formattedDate = currentTime.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );

  return (
    <div className="dashboard-page">
      {loadingError && (
        <div className="dashboard-error">
          {loadingError}
        </div>
      )}

      {stats && (
        <>
          <section className="dashboard-hero">
            <div className="hero-decoration hero-decoration-one" />
            <div className="hero-decoration hero-decoration-two" />

            <div className="hero-copy">
              <div className="hero-badge">
                <span />
                {getGreeting()}
              </div>

              <h1>
                Build momentum,
                <br />
                one small win at a time.
              </h1>

              <p className="hero-description">
                You completed{" "}
                <strong>
                  {stats.completed_tasks}
                </strong>{" "}
                of{" "}
                <strong>{stats.total_tasks}</strong>{" "}
                tasks. Keep moving forward with Neko by
                your side.
              </p>

              <button
                type="button"
                className="hero-action-button"
                onClick={() => openTasks("all")}
              >
                View your tasks
                <span>→</span>
              </button>
            </div>

            <div className="hero-mascot">
              <div className="hero-mascot-glow" />
              <span>🐱</span>
            </div>
          </section>

          <section className="dashboard-info-grid">
            <article className="dashboard-info-card">
              <div className="info-card-icon">
                🕒
              </div>

              <div className="info-card-content">
                <span className="info-card-label">
                  Local time
                </span>

                <strong>{formattedTime}</strong>

                <small>{formattedDate}</small>
              </div>
            </article>

            <article className="dashboard-info-card">
              <div className="info-card-icon weather-icon">
                {weather
                  ? getWeatherIcon(
                      weather.weatherCode
                    )
                  : "📍"}
              </div>

              <div className="info-card-content">
                <span className="info-card-label">
                  Local weather
                </span>

                {weather ? (
                  <>
                    <strong>
                      {weather.temperature}°C
                    </strong>

                    <small>
                      {getWeatherLabel(
                        weather.weatherCode
                      )}
                      {" · "}
                      Feels like {weather.feelsLike}°C
                      {" · "}
                      {weather.humidity}% humidity
                    </small>
                  </>
                ) : (
                  <>
                    <strong>--</strong>

                    <small>
                      {weatherError ||
                        "Loading local weather..."}
                    </small>
                  </>
                )}
              </div>

              {!weather && weatherError && (
                <button
                  type="button"
                  className="weather-retry-button"
                  onClick={loadWeather}
                >
                  Retry
                </button>
              )}
            </article>
          </section>

          <section className="dashboard-overview">
            <div className="overview-heading">
              <div>
                <span>ACTIVITY OVERVIEW</span>
                <h2>Your progress</h2>
              </div>

              <button
                type="button"
                onClick={() => openTasks("all")}
              >
                Manage tasks
                <span>→</span>
              </button>
            </div>

            <div className="stats-grid">
              <StatsCard
                title="Productivity"
                value={`${stats.productivity_score}%`}
                icon="📈"
                progress={stats.productivity_score}
                onClick={() => openTasks("all")}
              />

              <StatsCard
                title="Total tasks"
                value={stats.total_tasks}
                icon="📋"
                onClick={() => openTasks("all")}
              />

              <StatsCard
                title="Completed"
                value={stats.completed_tasks}
                icon="✅"
                onClick={() =>
                  openTasks("completed")
                }
              />

              <StatsCard
                title="Pending"
                value={stats.pending_tasks}
                icon="⏳"
                onClick={() => openTasks("pending")}
              />

              <StatsCard
                title="High priority"
                value={stats.high_priority_tasks}
                icon="🔥"
                onClick={() => openTasks("high")}
              />
            </div>
          </section>

          <InsightCard />

          <section className="dashboard-footer-note">
            <span className="paw-trail">
              🐾 🐾 🐾
            </span>

            <div>
              <strong>
                Consistency beats intensity.
              </strong>

              <p>
                Show up today, even if the step is
                small.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
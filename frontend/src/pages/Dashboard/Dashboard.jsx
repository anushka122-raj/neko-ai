import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDashboardStats } from "../services/analytics";

import GreetingCard from "../components/dashboard/GreetingCard";
import StatsCard from "../components/dashboard/StatsCard";
import InsightCard from "../components/dashboard/InsightCard";

import "../styles/dashboard.css";

const WEATHER_CODES = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Cloudy", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Foggy", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌦️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Heavy showers", icon: "⛈️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm", icon: "⛈️" },
  99: { label: "Heavy thunderstorm", icon: "⛈️" },
};

function getGreeting(date) {
  const hour = date.getHours();

  if (hour < 12) {
    return {
      text: "Good Morning",
      icon: "🌞",
    };
  }

  if (hour < 17) {
    return {
      text: "Good Afternoon",
      icon: "☀️",
    };
  }

  if (hour < 21) {
    return {
      text: "Good Evening",
      icon: "🌇",
    };
  }

  return {
    text: "Good Night",
    icon: "🌙",
  };
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setDashboardError("");

        const data = await getDashboardStats();

        setStats(data);
      } catch (error) {
        console.error("Dashboard loading error:", error);
        setDashboardError("Could not load dashboard statistics.");
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

  const greeting = useMemo(
    () => getGreeting(currentTime),
    [currentTime]
  );

  const formattedTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function loadWeather() {
    if (!navigator.geolocation) {
      setWeatherError("Location is not supported by this browser.");
      setWeatherLoading(false);
      return;
    }

    setWeatherLoading(true);
    setWeatherError("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            latitude: coords.latitude.toString(),
            longitude: coords.longitude.toString(),
            current:
              "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
            timezone: "auto",
          });

          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${params}`
          );

          if (!response.ok) {
            throw new Error("Weather request failed.");
          }

          const data = await response.json();

          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(
              data.current.apparent_temperature
            ),
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
            weatherCode: data.current.weather_code,
          });
        } catch (error) {
          console.error("Weather error:", error);
          setWeatherError("Could not load weather.");
        } finally {
          setWeatherLoading(false);
        }
      },
      (error) => {
        console.error("Location error:", error);

        setWeatherError(
          "Allow location access to view local weather."
        );
        setWeatherLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000,
      }
    );
  }

  function openTasks(filter = "all") {
    navigate(`/tasks?filter=${filter}`);
  }

  if (!stats && !dashboardError) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loader">🐱</div>
        <h2>Loading your workspace...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div className="hero-content">
          <p className="hero-label">PERSONAL WORKSPACE</p>

          <h1>
            🐱 {greeting.text} {greeting.icon}, there!
          </h1>

          <p>
            Let&apos;s make today productive with NekoAI.
          </p>
        </div>

        <div className="hero-date">
          <span>{formattedDate}</span>
        </div>
      </section>

      <section className="dashboard-widgets">
        <article className="dashboard-widget time-widget">
          <div className="widget-icon">🕒</div>

          <div className="widget-content">
            <span className="widget-label">Local time</span>
            <strong>{formattedTime}</strong>
            <small>{formattedDate}</small>
          </div>
        </article>

        <article className="dashboard-widget weather-widget">
          {weatherLoading ? (
            <div className="widget-loading">
              <span>🌤️</span>
              <p>Loading weather...</p>
            </div>
          ) : weather ? (
            <>
              <div className="weather-main">
                <span className="weather-icon">
                  {WEATHER_CODES[weather.weatherCode]?.icon ||
                    "🌤️"}
                </span>

                <div>
                  <span className="widget-label">
                    Local weather
                  </span>

                  <strong>{weather.temperature}°C</strong>

                  <p>
                    {WEATHER_CODES[weather.weatherCode]?.label ||
                      "Current weather"}
                  </p>
                </div>
              </div>

              <div className="weather-details">
                <span>
                  Feels like
                  <strong>{weather.feelsLike}°C</strong>
                </span>

                <span>
                  Humidity
                  <strong>{weather.humidity}%</strong>
                </span>

                <span>
                  Wind
                  <strong>{weather.windSpeed} km/h</strong>
                </span>
              </div>
            </>
          ) : (
            <div className="weather-error">
              <span>📍</span>

              <div>
                <p>{weatherError}</p>

                <button type="button" onClick={loadWeather}>
                  Try again
                </button>
              </div>
            </div>
          )}
        </article>
      </section>

      {dashboardError && (
        <div className="dashboard-error">
          {dashboardError}
        </div>
      )}

      {stats && (
        <section className="stats-section">
          <div className="section-heading">
            <div>
              <span>OVERVIEW</span>
              <h2>Your productivity</h2>
            </div>

            <button
              type="button"
              onClick={() => openTasks("all")}
            >
              View all tasks →
            </button>
          </div>

          <div className="stats-grid">
            <StatsCard
              title="Productivity"
              value={`${stats.productivity_score}%`}
              icon="📈"
              onClick={() => openTasks("all")}
            />

            <StatsCard
              title="Total Tasks"
              value={stats.total_tasks}
              icon="📋"
              onClick={() => openTasks("all")}
            />

            <StatsCard
              title="Completed"
              value={stats.completed_tasks}
              icon="✅"
              onClick={() => openTasks("completed")}
            />

            <StatsCard
              title="Pending"
              value={stats.pending_tasks}
              icon="⏳"
              onClick={() => openTasks("pending")}
            />

            <StatsCard
              title="High Priority"
              value={stats.high_priority_tasks}
              icon="🔥"
              onClick={() => openTasks("high")}
            />
          </div>
        </section>
      )}

      <InsightCard />
    </div>
  );
}
import { useEffect, useState } from "react";
import axios from "axios";

import CalendarCard from "./CalendarCard";
import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import MoodCard from "./MoodCard";
import ProductivityChart from "./ProductivityChart";
import QuickNotes from "./QuickNotes";
import TodayTasks from "./TodayTasks";
import WeatherCard from "./WeatherCard";

import "./Dashboard.css";

const ANALYTICS_URL =
  "http://127.0.0.1:8000/analytics/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      try {
        const response = await axios.get(
          ANALYTICS_URL
        );

        if (isMounted) {
          setStats(response.data);
          setError("");
        }
      } catch {
        if (isMounted) {
          setError(
            "Neko could not load the dashboard data."
          );
        }
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="dashboard">
      <DashboardHeader />

      {error ? (
        <div className="widget dashboard-error">
          <h3>Dashboard unavailable</h3>
          <p>{error}</p>
        </div>
      ) : (
        <DashboardStats stats={stats} />
      )}

      <div className="dashboard-grid">
        <WeatherCard />

        <MoodCard />

        <ProductivityChart
          value={stats?.productivity_score ?? 0}
        />

        <CalendarCard />

        <TodayTasks />

        <QuickNotes />
      </div>
    </section>
  );
}
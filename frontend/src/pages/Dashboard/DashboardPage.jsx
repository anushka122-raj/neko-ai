import { useEffect, useState } from "react";

import Dashboard from "../../components/dashboard/Dashboard";
import { getDashboardStats } from "../../services/analytics.js";



export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDashboardStats() {
      try {
        const data = await getDashboardStats();

        if (isActive) {
          setStats(data);
          setError("");
        }
      } catch (requestError) {
        console.error(
          "Failed to load dashboard stats:",
          requestError
        );

        if (isActive) {
          setError(
            "Unable to load dashboard data. Make sure the backend is running."
          );
        }
      }
    }

    loadDashboardStats();

    return () => {
      isActive = false;
    };
  }, []);

  if (error) {
    return (
      <section className="page-error">
        <h2>Dashboard unavailable</h2>
        <p>{error}</p>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="page-loading">
        <h2>Loading dashboard...</h2>
        <p>Neko is checking your progress 🐱</p>
      </section>
    );
  }

  return <Dashboard stats={stats} />;
}
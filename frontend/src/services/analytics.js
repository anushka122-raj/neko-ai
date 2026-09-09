export async function getDashboardStats() {
  try {
    const res = await fetch(
      "http://127.0.0.1:8000/analytics/dashboard"
    );

    if (!res.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }

    return await res.json();
  } catch (error) {
    console.warn(
      "Backend unavailable, using demo dashboard data."
    );

    return {
      completed_tasks: 4,
      total_tasks: 8,
      pending_tasks: 4,
      high_priority_tasks: 2,
      productivity_score: 50,
    };
  }
}
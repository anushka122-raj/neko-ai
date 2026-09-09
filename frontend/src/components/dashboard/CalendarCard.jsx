import { useEffect, useState } from "react";

import "./Dashboard.css";

export default function CalendarCard() {
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setToday(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const day = today.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const date = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="widget calendar-card">
      <h2>📅 Today</h2>

      <h1>{today.getDate()}</h1>

      <p>{day}</p>

      <span>{date}</span>
    </div>
  );
}
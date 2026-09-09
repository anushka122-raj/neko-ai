import { useEffect, useState } from "react";

import "./DashboardHeader.css";

export default function DashboardHeader({
  username = "Rishi",
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();

  let greeting = "Good Evening 🌙";

  if (hour < 12) {
    greeting = "Good Morning ☀️";
  } else if (hour < 18) {
    greeting = "Good Afternoon 🌤️";
  }

  return (
    <div className="dashboard-header">
      <div>
        <h1>
          {greeting}, {username}!
        </h1>

        <p>
          Let's make today productive with NekoAI.
        </p>
      </div>

      <div className="header-actions">
        <div>
          <h2>
            {now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </h2>

          <p>
            {now.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
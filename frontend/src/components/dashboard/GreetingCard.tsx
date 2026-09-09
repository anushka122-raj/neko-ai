import { useEffect, useState } from "react";

import "./Dashboard.css";

type GreetingCardProps = {
  username?: string;
};

export default function GreetingCard({
  username = "there",
}: GreetingCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();

  let greeting = "Good Evening 🌙";

  if (hour < 12) {
    greeting = "Good Morning ☀️";
  } else if (hour < 17) {
    greeting = "Good Afternoon 🌤️";
  }

  return (
    <div className="widget greeting-card">
      <div>
        <h1>
          🐱 {greeting}, {username}!
        </h1>

        <p>
          Let's make today productive with NekoAI.
        </p>
      </div>
    </div>
  );
}
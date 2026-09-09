import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: "🏠",
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: "📋",
  },
  {
    name: "Focus",
    path: "/focus",
    icon: "⚡",
  },
  {
    name: "Alarms",
    path: "/alarms",
    icon: "⏰",
  },
  {
    name: "Journal",
    path: "/journal",
    icon: "📖",
  },
  {
    name: "Habits",
    path: "/habits",
    icon: "🌱",
  },
  {
    name: "Memories",
    path: "/memories",
    icon: "🧠",
  },
  {
    name: "Chat",
    path: "/chat",
    icon: "💬",
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">🐱 NekoAI</h2>

      <nav>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/"}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

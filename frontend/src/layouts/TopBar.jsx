import { useLocation } from "react-router-dom";

const pageInformation = {
  "/": {
    title: "Dashboard",
    icon: "🏠",
  },

  "/tasks": {
    title: "Tasks",
    icon: "📋",
  },

  "/focus": {
    title: "Focus Mode",
    icon: "⚡",
  },

  "/alarms": {
    title: "Alarms",
    icon: "⏰",
  },

  "/journal": {
    title: "Journal",
    icon: "📖",
  },

  "/habits": {
    title: "Habit Tracker",
    icon: "🌱",
  },

  "/memories": {
    title: "Memories",
    icon: "🧠",
  },

  "/chat": {
    title: "Chat",
    icon: "💬",
  },
};

export default function TopBar() {
  const location = useLocation();

  const currentPage =
    pageInformation[location.pathname] || pageInformation["/"];

  return (
    <header className="topbar">
      <div className="topbar-title-group">
        <div className="topbar-page-icon">
          {currentPage.icon}
        </div>

        <h2>{currentPage.title}</h2>
      </div>

      <div className="topbar-status">
        <span className="topbar-status-dot" />
        <span>Neko is online</span>
      </div>
    </header>
  );
}
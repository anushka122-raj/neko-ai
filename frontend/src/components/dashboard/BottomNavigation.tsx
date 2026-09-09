import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Dashboard", path: "/", icon: "🏠" },
  { name: "Tasks", path: "/tasks", icon: "✅" },
  { name: "Pet", path: "/pet", icon: "🐱" },
  { name: "Chat", path: "/chat", icon: "💬" },
  { name: "Analytics", path: "/analytics", icon: "📊" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
];

export default function BottomNavigation() {
  return (
    <nav
      className="bottom-navigation"
      aria-label="Main Navigation"
    >
      {navigation.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          className={({ isActive }) =>
            isActive
              ? "bottom-nav-item active"
              : "bottom-nav-item"
          }
        >
          <span className="bottom-nav-icon">
            {item.icon}
          </span>

          <span className="bottom-nav-label">
            {item.name}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
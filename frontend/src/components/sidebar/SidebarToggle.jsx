export default function SidebarToggle({
  collapsed = false,
  onToggle,
}) {
  return (
    <button
      type="button"
      className="sidebar-toggle"
      onClick={onToggle}
      aria-label={
        collapsed
          ? "Expand sidebar"
          : "Collapse sidebar"
      }
      title={
        collapsed
          ? "Expand sidebar"
          : "Collapse sidebar"
      }
    >
      {collapsed ? "☰" : "←"}
    </button>
  );
}
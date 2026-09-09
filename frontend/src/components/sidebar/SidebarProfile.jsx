export default function SidebarProfile({
  username = "Rishi",
  status = "Ready to focus",
}) {
  return (
    <div className="sidebar-profile">
      <div className="sidebar-profile-avatar">
        🐱
      </div>

      <div className="sidebar-profile-info">
        <strong>{username}</strong>
        <small>{status}</small>
      </div>
    </div>
  );
}
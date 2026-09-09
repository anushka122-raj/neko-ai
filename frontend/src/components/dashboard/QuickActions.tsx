import "./Dashboard.css";

type QuickActionsProps = {
  onAddTask?: () => void;
  onOpenChat?: () => void;
  onFeedPet?: () => void;
};

export default function QuickActions({
  onAddTask,
  onOpenChat,
  onFeedPet,
}: QuickActionsProps) {
  return (
    <div className="widget quick-actions">
      <h2>⚡ Quick Actions</h2>

      <div className="quick-actions-grid">
        <button
          type="button"
          className="action-button"
          onClick={onAddTask}
        >
          ➕ Add Task
        </button>

        <button
          type="button"
          className="action-button"
          onClick={onOpenChat}
        >
          💬 Chat
        </button>

        <button
          type="button"
          className="action-button"
          onClick={onFeedPet}
        >
          🐟 Feed Neko
        </button>
      </div>
    </div>
  );
}
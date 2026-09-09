import "./Dashboard.css";

type Task = {
  id: number;
  title: string;
  status: string;
};

type TaskListCardProps = {
  tasks?: Task[];
};

export default function TaskListCard({
  tasks = [],
}: TaskListCardProps) {
  return (
    <div className="widget task-list-card">
      <h2>📝 Today's Tasks</h2>

      {tasks.length === 0 ? (
        <p>No tasks for today.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id}>
              {task.status === "Completed"
                ? "✅"
                : "⬜"}{" "}
              {task.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
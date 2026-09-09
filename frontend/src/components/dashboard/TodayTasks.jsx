import { useEffect, useState } from "react";
import axios from "axios";

import "./Dashboard.css";

const TASKS_URL = "http://127.0.0.1:8000/tasks/";

export default function TodayTasks() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchTasks() {
      try {
        const response = await axios.get(TASKS_URL);

        if (isMounted) {
          setTasks(response.data);
          setError("");
        }
      } catch (fetchError) {
        console.error("Failed to load tasks:", fetchError);

        if (isMounted) {
          setError("Neko could not load your tasks.");
        }
      }
    }

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleTasks = tasks.slice(0, 5);

  return (
    <div className="widget today-tasks">
      <h2>📋 Today's Tasks</h2>

      {error ? (
        <p className="dashboard-error-text">{error}</p>
      ) : visibleTasks.length === 0 ? (
        <p>No tasks yet. Add one to start your day.</p>
      ) : (
        <ul className="today-task-list">
          {visibleTasks.map((task) => (
            <li key={task.id}>
              <span>
                {task.status === "Completed" ? "✅" : "⬜"}
              </span>

              <span>{task.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
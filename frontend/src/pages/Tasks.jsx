import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  completeTask,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../services/taskApi";

import "./Tasks.css";

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  category: "General",
  due_date: "",
};

function Tasks() {
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingTaskId, setWorkingTaskId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filter = searchParams.get("filter") || "all";

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const data = await getTasks();

      setTasks(Array.isArray(data) ? data : data?.tasks || []);
    } catch (err) {
      console.error("Task loading error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const visibleTasks = useMemo(() => {
    if (filter === "completed") {
      return tasks.filter(
        (task) => task.status === "Completed"
      );
    }

    if (filter === "pending") {
      return tasks.filter(
        (task) => task.status !== "Completed"
      );
    }

    if (filter === "high") {
      return tasks.filter(
        (task) => task.priority === "High"
      );
    }

    return tasks;
  }, [tasks, filter]);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingTaskId(null);
  }

  function buildPayload() {
    return {
      title: formData.title.trim(),
      description:
        formData.description.trim() || null,
      priority: formData.priority,
      category:
        formData.category.trim() || "General",
      due_date: formData.due_date
        ? new Date(formData.due_date).toISOString()
        : null,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!formData.category.trim()) {
      setError("Please enter a task category.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = buildPayload();

      if (editingTaskId !== null) {
        await updateTask(editingTaskId, payload);
        setSuccess("Task updated successfully.");
      } else {
        await createTask(payload);
        setSuccess("Task added successfully.");
      }

      resetForm();
      await loadTasks();
    } catch (err) {
      console.error("Task save error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(task) {
    setEditingTaskId(task.id);
    setError("");
    setSuccess("");

    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      category: task.category || "General",
      due_date: task.due_date
        ? new Date(task.due_date)
            .toISOString()
            .slice(0, 16)
        : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function toggleTask(task) {
    try {
      setWorkingTaskId(task.id);
      setError("");
      setSuccess("");

      if (task.status === "Completed") {
        await updateTask(task.id, {
          status: "Pending",
        });

        setSuccess("Task marked as pending.");
      } else {
        await completeTask(task.id);
        setSuccess("Task marked as completed.");
      }

      await loadTasks();
    } catch (err) {
      console.error("Task status error:", err);
      setError(err.message);
    } finally {
      setWorkingTaskId(null);
    }
  }

  async function handleDelete(taskId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingTaskId(taskId);
      setError("");
      setSuccess("");

      await deleteTask(taskId);

      if (editingTaskId === taskId) {
        resetForm();
      }

      setSuccess("Task deleted successfully.");
      await loadTasks();
    } catch (err) {
      console.error("Task delete error:", err);
      setError(err.message);
    } finally {
      setWorkingTaskId(null);
    }
  }

  function formatDueDate(dueDate) {
    if (!dueDate) {
      return "No due date";
    }

    return new Date(dueDate).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getFilterTitle() {
    if (filter === "completed") {
      return "Completed Tasks";
    }

    if (filter === "pending") {
      return "Pending Tasks";
    }

    if (filter === "high") {
      return "High Priority Tasks";
    }

    return "Your Tasks";
  }

  return (
    <main className="tasks-page">
      <section className="tasks-header">
        <div>
          <p className="tasks-label">
            PERSONAL WORKSPACE
          </p>

          <h1>My Tasks</h1>

          <p>
            Add, update, complete or remove your tasks.
          </p>
        </div>
      </section>

      <section className="task-form-card">
        <h2>
          {editingTaskId !== null
            ? "✏️ Edit Task"
            : "➕ Add New Task"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="task-form"
        >
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Task title"
            maxLength={150}
            disabled={saving}
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Task description"
            rows={3}
            disabled={saving}
          />

          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            disabled={saving}
          >
            <option value="Low">
              Low priority
            </option>

            <option value="Medium">
              Medium priority
            </option>

            <option value="High">
              High priority
            </option>
          </select>

          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="Category, e.g. Study, Work, Personal"
            maxLength={50}
            disabled={saving}
          />

          <input
            type="datetime-local"
            name="due_date"
            value={formData.due_date}
            onChange={handleInputChange}
            disabled={saving}
          />

          <div className="task-form-actions">
            <button
              type="submit"
              className="save-task-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingTaskId !== null
                  ? "Save Changes"
                  : "Add Task"}
            </button>

            {editingTaskId !== null && (
              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {error && (
        <div className="task-error">
          {error}
        </div>
      )}

      {success && (
        <div className="task-success">
          {success}
        </div>
      )}

      <section className="task-list-section">
        <div className="task-list-heading">
          <div>
            <h2>{getFilterTitle()}</h2>

            <p>
              {visibleTasks.length} task
              {visibleTasks.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={loadTasks}
            disabled={loading}
          >
            🔄 {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="task-message">
            Loading tasks...
          </p>
        ) : visibleTasks.length === 0 ? (
          <p className="task-message">
            No matching tasks found.
          </p>
        ) : (
          <div className="task-grid">
            {visibleTasks.map((task) => {
              const isCompleted =
                task.status === "Completed";

              const isWorking =
                workingTaskId === task.id;

              return (
                <article
                  key={task.id}
                  className={`task-card ${
                    isCompleted
                      ? "task-completed"
                      : ""
                  }`}
                >
                  <div className="task-card-top">
                    <div>
                      <h3>{task.title}</h3>

                      <div className="task-badges">
                        <span
                          className={`priority-badge priority-${(
                            task.priority || "Medium"
                          ).toLowerCase()}`}
                        >
                          {task.priority || "Medium"}
                        </span>

                        <span className="category-badge">
                          {task.category || "General"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="complete-button"
                      onClick={() =>
                        toggleTask(task)
                      }
                      disabled={isWorking}
                      title={
                        isCompleted
                          ? "Mark as pending"
                          : "Mark as completed"
                      }
                    >
                      {isWorking
                        ? "..."
                        : isCompleted
                          ? "↩️"
                          : "✅"}
                    </button>
                  </div>

                  <p className="task-description">
                    {task.description ||
                      "No description provided."}
                  </p>

                  <div className="task-meta">
                    <p className="task-status">
                      Status:{" "}
                      <strong>{task.status}</strong>
                    </p>

                    <p className="task-due-date">
                      Due:{" "}
                      <strong>
                        {formatDueDate(task.due_date)}
                      </strong>
                    </p>
                  </div>

                  <div className="task-card-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        startEditing(task)
                      }
                      disabled={isWorking}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(task.id)
                      }
                      disabled={isWorking}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Tasks;
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabitDashboard,
  getHabits,
  undoHabitCompletion,
  updateHabit,
} from "../services/habitApi";

import "./Habits.css";

const weekdays = [
  {
    value: 0,
    label: "Mon",
  },
  {
    value: 1,
    label: "Tue",
  },
  {
    value: 2,
    label: "Wed",
  },
  {
    value: 3,
    label: "Thu",
  },
  {
    value: 4,
    label: "Fri",
  },
  {
    value: 5,
    label: "Sat",
  },
  {
    value: 6,
    label: "Sun",
  },
];

const categories = [
  "General",
  "Study",
  "Health",
  "Fitness",
  "Work",
  "Sleep",
  "Mindfulness",
  "Personal",
];

const difficultyRewards = {
  Easy: {
    xp: 10,
    coins: 2,
  },
  Medium: {
    xp: 20,
    coins: 5,
  },
  Hard: {
    xp: 40,
    coins: 10,
  },
};

const categoryIcons = {
  General: "🌱",
  Study: "📚",
  Health: "💧",
  Fitness: "🏃",
  Work: "💼",
  Sleep: "🌙",
  Mindfulness: "🧘",
  Personal: "✨",
};

const emptyForm = {
  title: "",
  description: "",
  category: "General",
  difficulty: "Medium",
  frequency: "Daily",
  custom_days: [],
  target_count: 1,
  is_active: true,
};

const emptyDashboard = {
  total_habits: 0,
  active_habits: 0,
  completed_today: 0,
  pending_today: 0,
  completion_rate: 0,
  current_streak: 0,
  best_streak: 0,
  total_xp: 0,
  total_coins: 0,
  today_completed: false,
};

function getFrequencyLabel(habit) {
  if (habit.frequency === "Daily") {
    return "Every day";
  }

  if (habit.frequency === "Weekdays") {
    return "Monday to Friday";
  }

  if (habit.frequency === "Weekends") {
    return "Saturday and Sunday";
  }

  if (habit.frequency === "Custom") {
    const selectedDays = weekdays
      .filter((day) =>
        habit.custom_days?.includes(day.value)
      )
      .map((day) => day.label)
      .join(", ");

    return selectedDays || "Custom days";
  }

  return habit.frequency;
}

export default function Habits() {
  const [habits, setHabits] =
    useState([]);

  const [dashboard, setDashboard] =
    useState(emptyDashboard);

  const [formData, setFormData] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const [filter, setFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [workingId, setWorkingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadHabitData();
  }, []);

  const visibleHabits = useMemo(() => {
    if (filter === "completed") {
      return habits.filter(
        (habit) =>
          habit.completed_today
      );
    }

    if (filter === "pending") {
      return habits.filter(
        (habit) =>
          !habit.completed_today &&
          habit.is_active
      );
    }

    if (filter === "inactive") {
      return habits.filter(
        (habit) => !habit.is_active
      );
    }

    return habits;
  }, [habits, filter]);

  const selectedReward =
    difficultyRewards[
      formData.difficulty
    ];

  async function loadHabitData() {
    try {
      setLoading(true);
      setError("");

      const [
        habitData,
        dashboardData,
      ] = await Promise.all([
        getHabits(),
        getHabitDashboard(),
      ]);

      setHabits(
        Array.isArray(habitData)
          ? habitData
          : []
      );

      setDashboard(
        dashboardData ||
          emptyDashboard
      );
    } catch (loadError) {
      console.error(loadError);

      setError(
        loadError.message ||
          "Habit data could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : name === "target_count"
            ? Number(value)
            : value,
    }));
  }

  function toggleCustomDay(dayValue) {
    setFormData((current) => {
      const exists =
        current.custom_days.includes(
          dayValue
        );

      return {
        ...current,
        custom_days: exists
          ? current.custom_days.filter(
              (day) =>
                day !== dayValue
            )
          : [
              ...current.custom_days,
              dayValue,
            ],
      };
    });
  }

  function resetForm() {
    setFormData(emptyForm);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const title =
      formData.title.trim();

    if (!title) {
      setError(
        "Give your habit a name first."
      );
      return;
    }

    if (
      formData.frequency === "Custom" &&
      formData.custom_days.length === 0
    ) {
      setError(
        "Choose at least one custom day."
      );
      return;
    }

    const payload = {
      title,
      description:
        formData.description.trim() ||
        null,
      category:
        formData.category,
      difficulty:
        formData.difficulty,
      frequency:
        formData.frequency,
      custom_days:
        formData.frequency ===
        "Custom"
          ? formData.custom_days
          : [],
      target_count:
        Number(
          formData.target_count
        ) || 1,
      xp_reward:
        selectedReward.xp,
      coin_reward:
        selectedReward.coins,
      is_active:
        formData.is_active,
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId !== null) {
        await updateHabit(
          editingId,
          payload
        );

        setSuccess(
          "Habit updated. Character development continues."
        );
      } else {
        await createHabit(payload);

        setSuccess(
          "New daily quest unlocked 🌱"
        );
      }

      resetForm();
      await loadHabitData();

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (saveError) {
      console.error(saveError);

      setError(
        saveError.message ||
          "Habit could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEditing(habit) {
    setEditingId(habit.id);

    setFormData({
      title: habit.title || "",
      description:
        habit.description || "",
      category:
        habit.category || "General",
      difficulty:
        habit.difficulty || "Medium",
      frequency:
        habit.frequency || "Daily",
      custom_days:
        habit.custom_days || [],
      target_count:
        habit.target_count || 1,
      is_active:
        Boolean(habit.is_active),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(
    habit
  ) {
    const confirmed =
      window.confirm(
        `Delete "${habit.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingId(habit.id);
      setError("");

      await deleteHabit(habit.id);

      if (editingId === habit.id) {
        resetForm();
      }

      await loadHabitData();
    } catch (deleteError) {
      console.error(deleteError);

      setError(
        deleteError.message ||
          "Habit could not be deleted."
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function handleProgress(
    habit
  ) {
    try {
      setWorkingId(habit.id);
      setError("");
      setSuccess("");

      const wasAlreadyComplete =
        habit.completed_today;

      await completeHabit(
        habit.id,
        1
      );

      await loadHabitData();

      if (!wasAlreadyComplete) {
        const nextCount =
          habit.completed_count_today +
          1;

        if (
          nextCount >=
          habit.target_count
        ) {
          const currentXp =
            Number(
              localStorage.getItem(
                "neko-xp"
              ) || 0
            );

          localStorage.setItem(
            "neko-xp",
            String(
              currentXp +
                habit.xp_reward
            )
          );

          setSuccess(
            `Quest complete! +${habit.xp_reward} XP and +${habit.coin_reward} coins.`
          );

          window.dispatchEvent(
            new CustomEvent(
              "neko-habit-complete",
              {
                detail: {
                  habit,
                },
              }
            )
          );
        }
      }

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (progressError) {
      console.error(progressError);

      setError(
        progressError.message ||
          "Habit progress could not be updated."
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function handleUndo(
    habit
  ) {
    try {
      setWorkingId(habit.id);
      setError("");

      await undoHabitCompletion(
        habit.id
      );

      await loadHabitData();
    } catch (undoError) {
      console.error(undoError);

      setError(
        undoError.message ||
          "Habit completion could not be undone."
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function toggleActive(
    habit
  ) {
    try {
      setWorkingId(habit.id);

      await updateHabit(
        habit.id,
        {
          is_active:
            !habit.is_active,
        }
      );

      await loadHabitData();
    } catch (toggleError) {
      console.error(toggleError);

      setError(
        toggleError.message ||
          "Habit status could not be updated."
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="habits-page">
      <section className="habits-hero">
        <div className="habits-hero-copy">
          <span className="habits-eyebrow">
            NEKO DAILY QUESTS
          </span>

          <h1>
            Build habits.
            <br />
            Evolve your Neko.
          </h1>

          <p>
            Complete your daily quests,
            protect your streak and earn
            XP for the pet evolution arc.
          </p>
        </div>

        <div className="habits-hero-pet">
          <span>
            {dashboard.today_completed
              ? "😻"
              : "😼"}
          </span>

          <small>
            {dashboard.today_completed
              ? "Daily quests cleared"
              : "Neko is watching"}
          </small>
        </div>
      </section>

      <section className="habit-stats-grid">
        <article>
          <span>Today</span>
          <strong>
            {dashboard.completed_today}/
            {dashboard.active_habits}
          </strong>
          <small>Quests cleared</small>
        </article>

        <article>
          <span>Completion</span>
          <strong>
            {Math.round(
              dashboard.completion_rate
            )}
            %
          </strong>
          <small>Today’s consistency</small>
        </article>

        <article>
          <span>Current streak</span>
          <strong>
            🔥 {dashboard.current_streak}
          </strong>
          <small>Keep it alive</small>
        </article>

        <article>
          <span>Total rewards</span>
          <strong>
            {dashboard.total_xp} XP
          </strong>
          <small>
            🪙 {dashboard.total_coins} coins
          </small>
        </article>
      </section>

      <section className="habit-day-progress">
        <div>
          <span>DAILY QUEST PROGRESS</span>

          <strong>
            {dashboard.today_completed
              ? "You cooked today."
              : `${dashboard.pending_today} quest${
                  dashboard.pending_today === 1
                    ? ""
                    : "s"
                } remaining`}
          </strong>
        </div>

        <div className="habit-progress-track">
          <div
            className="habit-progress-fill"
            style={{
              width: `${Math.min(
                100,
                dashboard.completion_rate
              )}%`,
            }}
          />
        </div>

        <span className="habit-progress-value">
          {Math.round(
            dashboard.completion_rate
          )}
          %
        </span>
      </section>

      <section className="habits-layout">
        <section className="habit-form-card">
          <div className="habit-section-heading">
            <span>
              {editingId !== null
                ? "EDIT QUEST"
                : "CREATE A NEW QUEST"}
            </span>

            <h2>
              {editingId !== null
                ? "Update habit"
                : "New habit"}
            </h2>
          </div>

          <form
            className="habit-form"
            onSubmit={handleSubmit}
          >
            <label>
              <span>Habit name</span>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Study DSA"
                maxLength={150}
              />
            </label>

            <label>
              <span>Description</span>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder="What does completing this habit look like?"
                rows={3}
                maxLength={2000}
              />
            </label>

            <div className="habit-form-row">
              <label>
                <span>Category</span>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={handleChange}
                >
                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span>Difficulty</span>

                <select
                  name="difficulty"
                  value={
                    formData.difficulty
                  }
                  onChange={handleChange}
                >
                  <option value="Easy">
                    Easy
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Hard">
                    Hard
                  </option>
                </select>
              </label>
            </div>

            <div className="habit-form-row">
              <label>
                <span>Schedule</span>

                <select
                  name="frequency"
                  value={
                    formData.frequency
                  }
                  onChange={handleChange}
                >
                  <option value="Daily">
                    Every day
                  </option>

                  <option value="Weekdays">
                    Weekdays
                  </option>

                  <option value="Weekends">
                    Weekends
                  </option>

                  <option value="Custom">
                    Custom days
                  </option>
                </select>
              </label>

              <label>
                <span>
                  Daily target
                </span>

                <input
                  type="number"
                  name="target_count"
                  min="1"
                  max="100"
                  value={
                    formData.target_count
                  }
                  onChange={handleChange}
                />
              </label>
            </div>

            {formData.frequency ===
              "Custom" && (
              <div className="habit-day-picker">
                <span>
                  Choose active days
                </span>

                <div>
                  {weekdays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={
                        formData.custom_days.includes(
                          day.value
                        )
                          ? "habit-day-selected"
                          : ""
                      }
                      onClick={() =>
                        toggleCustomDay(
                          day.value
                        )
                      }
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="habit-reward-preview">
              <span>Quest reward</span>

              <strong>
                +{selectedReward.xp} XP
              </strong>

              <strong>
                +{selectedReward.coins} 🪙
              </strong>
            </div>

            <label className="habit-active-check">
              <input
                type="checkbox"
                name="is_active"
                checked={
                  formData.is_active
                }
                onChange={handleChange}
              />

              <span>
                Keep this quest active
              </span>
            </label>

            {error && (
              <div className="habit-error">
                {error}
              </div>
            )}

            {success && (
              <div className="habit-success">
                {success}
              </div>
            )}

            <div className="habit-form-actions">
              <button
                type="submit"
                className="habit-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save changes"
                    : "🌱 Create habit"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="habit-cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="habit-list-card">
          <div className="habit-list-header">
            <div className="habit-section-heading">
              <span>TODAY’S QUESTS</span>
              <h2>Your habits</h2>
            </div>

            <button
              type="button"
              className="habit-refresh-button"
              onClick={loadHabitData}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="habit-filters">
            {[
              ["all", "All"],
              ["pending", "Pending"],
              ["completed", "Completed"],
              ["inactive", "Paused"],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    filter === value
                      ? "habit-filter-active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(value)
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>

          {loading ? (
            <div className="habit-empty-state">
              <span>🌱</span>
              <h3>Loading quests...</h3>
            </div>
          ) : visibleHabits.length ===
            0 ? (
            <div className="habit-empty-state">
              <span>🐾</span>
              <h3>No quests here</h3>
              <p>
                Create your first habit
                and begin the evolution
                arc.
              </p>
            </div>
          ) : (
            <div className="habit-list">
              {visibleHabits.map(
                (habit) => {
                  const progress =
                    Math.min(
                      100,
                      (habit.completed_count_today /
                        habit.target_count) *
                        100
                    );

                  const disabled =
                    workingId === habit.id;

                  return (
                    <article
                      key={habit.id}
                      className={`habit-card ${
                        habit.completed_today
                          ? "habit-card-complete"
                          : ""
                      } ${
                        !habit.is_active
                          ? "habit-card-inactive"
                          : ""
                      }`}
                    >
                      <div className="habit-card-top">
                        <div className="habit-category-icon">
                          {categoryIcons[
                            habit.category
                          ] || "🌱"}
                        </div>

                        <div className="habit-card-title">
                          <h3>
                            {habit.title}
                          </h3>

                          <span>
                            {getFrequencyLabel(
                              habit
                            )}
                          </span>
                        </div>

                        <span
                          className={`habit-difficulty habit-difficulty-${habit.difficulty.toLowerCase()}`}
                        >
                          {habit.difficulty}
                        </span>
                      </div>

                      {habit.description && (
                        <p className="habit-description">
                          {habit.description}
                        </p>
                      )}

                      <div className="habit-card-progress">
                        <div>
                          <span>
                            Today’s progress
                          </span>

                          <strong>
                            {
                              habit.completed_count_today
                            }
                            /
                            {
                              habit.target_count
                            }
                          </strong>
                        </div>

                        <div className="habit-card-track">
                          <div
                            className="habit-card-fill"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="habit-card-stats">
                        <span>
                          🔥{" "}
                          {
                            habit.current_streak
                          }{" "}
                          day streak
                        </span>

                        <span>
                          🏆 Best{" "}
                          {
                            habit.best_streak
                          }
                        </span>

                        <span>
                          +{habit.xp_reward} XP
                        </span>

                        <span>
                          +{
                            habit.coin_reward
                          }{" "}
                          🪙
                        </span>
                      </div>

                      <div className="habit-card-actions">
                        {habit.completed_today ? (
                          <button
                            type="button"
                            className="habit-undo-button"
                            disabled={disabled}
                            onClick={() =>
                              handleUndo(habit)
                            }
                          >
                            ↩ Undo today
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="habit-complete-button"
                            disabled={
                              disabled ||
                              !habit.is_active
                            }
                            onClick={() =>
                              handleProgress(
                                habit
                              )
                            }
                          >
                            {disabled
                              ? "Updating..."
                              : habit.target_count >
                                  1
                                ? "＋ Add progress"
                                : "✓ Complete"}
                          </button>
                        )}

                        <button
                          type="button"
                          className="habit-edit-button"
                          onClick={() =>
                            startEditing(habit)
                          }
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="habit-pause-button"
                          disabled={disabled}
                          onClick={() =>
                            toggleActive(habit)
                          }
                        >
                          {habit.is_active
                            ? "⏸"
                            : "▶"}
                        </button>

                        <button
                          type="button"
                          className="habit-delete-button"
                          disabled={disabled}
                          onClick={() =>
                            handleDelete(habit)
                          }
                        >
                          🗑
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
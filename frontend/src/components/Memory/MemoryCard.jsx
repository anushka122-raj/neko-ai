import "./MemoryCard.css";

const categoryInformation = {
  General: {
    icon: "🧠",
    className: "memory-category-general",
  },

  Goal: {
    icon: "🎯",
    className: "memory-category-goal",
  },

  Study: {
    icon: "📚",
    className: "memory-category-study",
  },

  Project: {
    icon: "🛠️",
    className: "memory-category-project",
  },

  Work: {
    icon: "💼",
    className: "memory-category-work",
  },

  Personal: {
    icon: "💜",
    className: "memory-category-personal",
  },
};

export default function MemoryCard({
  memory,
  onDelete,
  deleting = false,
}) {
  const category =
    categoryInformation[memory.category] ||
    categoryInformation.General;

  function handleDelete() {
    if (!onDelete || deleting) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${memory.title}"?`
    );

    if (confirmed) {
      onDelete(memory.id);
    }
  }

  return (
    <article className="memory-card">
      <div className="memory-card-header">
        <div
          className={`memory-card-icon ${category.className}`}
        >
          {category.icon}
        </div>

        <span
          className={`memory-category-badge ${category.className}`}
        >
          {memory.category || "General"}
        </span>
      </div>

      <div className="memory-card-content">
        <h3>{memory.title}</h3>

        <p>{memory.content}</p>
      </div>

      <div className="memory-card-footer">
        <span>
          Saved memory
        </span>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "🗑 Delete"}
        </button>
      </div>
    </article>
  );
}
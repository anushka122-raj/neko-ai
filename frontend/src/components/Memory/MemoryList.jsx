import MemoryCard from "./MemoryCard";

import "./MemoryList.css";

export default function MemoryList({
  memories = [],
  onDelete,
  deletingId,
  loading,
}) {
  if (loading) {
    return (
      <div className="memory-list-state">
        <span>🧠</span>
        <h3>Loading memories...</h3>
      </div>
    );
  }

  if (!memories.length) {
    return (
      <div className="memory-list-state">
        <span>🗂️</span>

        <h3>No memories found</h3>

        <p>
          Save a new memory or change your current search
          and category filters.
        </p>
      </div>
    );
  }

  return (
    <div className="memory-list">
      {memories.map((memory) => (
        <MemoryCard
          key={memory.id}
          memory={memory}
          onDelete={onDelete}
          deleting={
            deletingId === memory.id
          }
        />
      ))}
    </div>
  );
}
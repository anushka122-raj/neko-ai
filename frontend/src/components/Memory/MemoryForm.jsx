import { useState } from "react";

import "./MemoryForm.css";

const initialForm = {
  title: "",
  content: "",
  category: "General",
};

export default function MemoryForm({
  onSave,
}) {
  const [formData, setFormData] =
    useState(initialForm);

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const title = formData.title.trim();
    const content = formData.content.trim();
    const category =
      formData.category.trim() || "General";

    if (!title || !content) {
      setError(
        "Please enter both a title and memory content."
      );
      return;
    }

    if (!onSave) {
      setError("Memory saving is unavailable.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      await onSave({
        title,
        content,
        category,
      });

      setFormData(initialForm);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Memory could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="memory-form"
      onSubmit={handleSubmit}
    >
      <div className="memory-form-grid">
        <label className="memory-form-field">
          <span>Memory title</span>

          <input
            type="text"
            name="title"
            placeholder="Example: My internship goal"
            value={formData.title}
            onChange={handleChange}
            maxLength={120}
            disabled={isSaving}
          />
        </label>

        <label className="memory-form-field">
          <span>Category</span>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isSaving}
          >
            <option value="General">General</option>
            <option value="Goal">Goal</option>
            <option value="Study">Study</option>
            <option value="Project">Project</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
          </select>
        </label>
      </div>

      <label className="memory-form-field">
        <span>What should Neko remember?</span>

        <textarea
          name="content"
          placeholder="Write the important detail you want Neko to remember..."
          value={formData.content}
          onChange={handleChange}
          maxLength={2000}
          rows={5}
          disabled={isSaving}
        />
      </label>

      <div className="memory-form-footer">
        <div>
          {error && (
            <p className="memory-form-error">
              {error}
            </p>
          )}

          <small>
            {formData.content.length}/2000 characters
          </small>
        </div>

        <button
          type="submit"
          disabled={isSaving}
        >
          <span>＋</span>

          {isSaving
            ? "Saving memory..."
            : "Save memory"}
        </button>
      </div>
    </form>
  );
}
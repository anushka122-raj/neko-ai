import { useState } from "react";

export default function QuickNotes() {
  const [note, setNote] = useState(() => {
    return localStorage.getItem("neko_notes") || "";
  });

  function handleChange(e) {
    const value = e.target.value;

    setNote(value);

    localStorage.setItem("neko_notes", value);
  }

  return (
    <div className="widget">
      <h2>📝 Quick Notes</h2>

      <textarea
        rows={8}
        value={note}
        onChange={handleChange}
        placeholder="Write anything..."
      />
    </div>
  );
}
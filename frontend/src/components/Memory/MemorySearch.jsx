import "./MemorySearch.css";

export default function MemorySearch({
  onSearch,
}) {
  function handleChange(event) {
    onSearch?.(event.target.value);
  }

  return (
    <div className="memory-search">
      <label htmlFor="memory-search-input">
        Search memories
      </label>

      <input
        id="memory-search-input"
        type="search"
        placeholder="Search by title, content, or category..."
        onChange={handleChange}
      />
    </div>
  );
}
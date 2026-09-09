export default function PetControls({
  onFeed,
  onPlay,
  onRest,
  onTalk,
}) {
  return (
    <div className="pet-controls">
      <button
        type="button"
        onClick={onFeed}
      >
        🐟 Feed
      </button>

      <button
        type="button"
        onClick={onPlay}
      >
        🎮 Play
      </button>

      <button
        type="button"
        onClick={onRest}
      >
        😴 Rest
      </button>

      <button
        type="button"
        onClick={onTalk}
      >
        💬 Talk
      </button>
    </div>
  );
}
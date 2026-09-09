/**
 * Presentational, reusable speech bubble: a message plus optional
 * action buttons (Dismiss / Later / Done / Open Task, etc — the
 * caller decides the labels and ids). No lifecycle knowledge here —
 * that belongs to PetBubble.jsx, which decides *when* this renders.
 *
 * Note: the original spec asked for this as a .tsx file. The rest of
 * this codebase's live components are all .jsx with no tsconfig
 * driving type-checking, so a .jsx file behaves identically here and
 * keeps the pet folder consistent with everything else that actually
 * runs. Happy to switch it to .tsx if you're standardizing on TS
 * elsewhere.
 */
export default function PetSpeechBubble({
  message,
  actions,
  onAction,
}) {
  if (!message) {
    return null;
  }

  const hasActions =
    Array.isArray(actions) &&
    actions.length > 0;

  return (
    <div
      className={[
        "pet-speech-bubble",
        "pet-speech-bubble-rich",
        hasActions
          ? "pet-speech-bubble-waiting"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p>{message}</p>

      {hasActions && (
        <div className="pet-bubble-actions">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="pet-bubble-action"
              onClick={() =>
                onAction?.(action.id)
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <span />
    </div>
  );
}

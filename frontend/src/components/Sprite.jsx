import useEmotion from "../hooks/useEmotion";

/**
 * Layered CSS/vector cat sprite.
 *
 * No image assets are used — body, ears (via Pet.css pseudo-elements
 * on .pet-body), tail, four legs, eyes and mouth are all real DOM
 * parts animated per locomotion `state` and `emotion`. If real
 * sprite-sheet art is added later, only this file needs to change
 * (e.g. swap the parts below for <img> frame-cycling) — nothing in
 * the state machine, movement hook, or Electron layer depends on how
 * the sprite is drawn.
 */
export default function Sprite({
  state = "idle",
  direction = 1,
  isDragging = false,
  talking = false,
}) {
  const { emotion } = useEmotion();

  return (
    <div
      className={[
        "pet-sprite",
        `pet-state-${state}`,
        isDragging ? "pet-dragging" : "",
        talking ? "pet-talking" : "",
        `pet-emotion-${emotion}`,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--pet-direction": direction,
      }}
    >
      <div className="pet-shadow" />

      <div className="pet-tail" />

      <div className="pet-leg pet-leg-back-l" />
      <div className="pet-leg pet-leg-back-r" />

      <div className="pet-body">
        <div className="pet-eye pet-eye-left" />
        <div className="pet-eye pet-eye-right" />
        <div className="pet-mouth" />

        {state === "sleep" && (
          <div className="pet-effect">
            Zzz
          </div>
        )}

        {emotion === "angry" && (
          <div className="pet-effect">
            💢
          </div>
        )}

        {emotion === "celebrate" && (
          <div className="pet-effect">
            ✨
          </div>
        )}
      </div>

      <div className="pet-leg pet-leg-front-l" />
      <div className="pet-leg pet-leg-front-r" />
    </div>
  );
}

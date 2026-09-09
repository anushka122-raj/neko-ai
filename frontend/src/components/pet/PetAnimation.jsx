import Sprite from "./Sprite";

const emotionToAnimation = {
  happy: "happy",
  focused: "thinking",
  thinking: "thinking",
  sad: "sad",
  sleepy: "sleep",
  proud: "celebrate",
  excited: "celebrate",
  idle: "idle",
};

export default function PetAnimation({
  emotion = "idle",
  alt = "NekoAI desktop pet",
}) {
  const animation =
    emotionToAnimation[emotion.toLowerCase()] || "idle";

  return (
    <div
      className={`pet-animation pet-animation-${animation}`}
      aria-live="polite"
    >
      <Sprite
        animation={animation}
        alt={alt}
      />
    </div>
  );
}
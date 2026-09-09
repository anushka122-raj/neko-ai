type Emotion =
  | "happy"
  | "idle"
  | "thinking"
  | "sleep"
  | "sad"
  | "celebrate";

type PetEmotionProps = {
  emotion?: Emotion;
};

const emotionMap: Record<
  Emotion,
  { emoji: string; label: string }
> = {
  happy: {
    emoji: "😊",
    label: "Happy",
  },
  idle: {
    emoji: "😺",
    label: "Idle",
  },
  thinking: {
    emoji: "🤔",
    label: "Thinking",
  },
  sleep: {
    emoji: "😴",
    label: "Sleeping",
  },
  sad: {
    emoji: "😿",
    label: "Sad",
  },
  celebrate: {
    emoji: "🎉",
    label: "Celebrating",
  },
};

export default function PetEmotion({
  emotion = "idle",
}: PetEmotionProps) {
  const current =
    emotionMap[emotion] ?? emotionMap.idle;

  return (
    <div className="pet-emotion">
      <span
        className="pet-emotion-emoji"
        role="img"
        aria-label={current.label}
      >
        {current.emoji}
      </span>

      <span className="pet-emotion-label">
        {current.label}
      </span>
    </div>
  );
}
type PetSpeechBubbleProps = {
  message?: string;
};

export default function PetSpeechBubble({
  message = "Hello! I'm Neko 🐱",
}: PetSpeechBubbleProps) {
  return (
    <div className="pet-speech-bubble">
      <div className="pet-speech-content">
        {message}
      </div>

      <div className="pet-speech-tail" />
    </div>
  );
}
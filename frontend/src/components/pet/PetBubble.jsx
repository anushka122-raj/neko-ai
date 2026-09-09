import PetSpeechBubble from "./PetSpeechBubble";

export default function PetBubble({
  message = "Hello! I'm Neko 🐱",
}) {
  return (
    <div className="pet-bubble">
      <PetSpeechBubble
        message={message}
      />
    </div>
  );
}
import PetAvatar from "./PetAvatar";
import PetBubble from "./PetBubble";
import PetControls from "./PetControls";

export default function Pet({
  emotion = "happy",
  message = "Neko is ready to help you! 🐱",
  onFeed,
  onPlay,
  onRest,
}) {
  return (
    <section className="pet">
      <PetBubble message={message} />

      <PetAvatar emotion={emotion} />

      <PetControls
        onFeed={onFeed}
        onPlay={onPlay}
        onRest={onRest}
      />
    </section>
  );
}
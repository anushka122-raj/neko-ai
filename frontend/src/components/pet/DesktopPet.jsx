import { useState } from "react";

import PetAnimation from "./PetAnimation";
import PetBubble from "./PetBubble";
import PetControls from "./PetControls";
import PetEmotion from "./PetEmotion";

export default function DesktopPet() {
  const [emotion, setEmotion] = useState("happy");
  const [message, setMessage] = useState(
    "Hello! I'm Neko 🐱"
  );

  function handleFeed() {
    setEmotion("happy");
    setMessage("Yummy! Thanks for feeding me! 🐟");
  }

  function handlePlay() {
    setEmotion("celebrate");
    setMessage("Let's have some fun! 🎉");
  }

  function handleRest() {
    setEmotion("sleep");
    setMessage("Zzz... I'll regain my energy. 😴");
  }

  function handleTalk() {
    setEmotion("thinking");
    setMessage("I'm listening. Tell me what's on your mind. 💬");
  }

  return (
    <div className="desktop-pet">
      <PetBubble
        message={message}
      />

      <PetAnimation
        emotion={emotion}
      />

      <PetEmotion
        emotion={emotion}
      />

      <PetControls
        onFeed={handleFeed}
        onPlay={handlePlay}
        onRest={handleRest}
        onTalk={handleTalk}
      />
    </div>
  );
}
import { useMemo } from "react";

const SPRITES = {
  idle: "/sprites/idle.png",
  happy: "/sprites/happy.png",
  thinking: "/sprites/thinking.png",
  sad: "/sprites/sad.png",
  sleep: "/sprites/sleep.png",
  celebrate: "/sprites/celebrate.png",
  walk: "/sprites/walk.png",
};

export default function Sprite({
  animation = "idle",
  alt = "Neko",
  className = "",
}) {
  const sprite = useMemo(() => {
    return SPRITES[animation] || SPRITES.idle;
  }, [animation]);

  return (
    <img
      className={`neko-sprite ${className}`}
      src={sprite}
      alt={alt}
      draggable={false}
    />
  );
}
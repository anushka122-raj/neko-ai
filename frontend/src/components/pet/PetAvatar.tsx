import { motion } from "framer-motion";

type PetAvatarProps = {
  emotion?: string;
};

export default function PetAvatar({
  emotion = "happy",
}: PetAvatarProps) {

  const animation =
    emotion === "sleep"
      ? {
          scale: [1, 1.04, 1],
        }
      : emotion === "happy" || emotion === "celebrate"
      ? {
          y: [0, -15, 0],
          rotate: [0, 3, -3, 0],
        }
      : {
          y: [0, -8, 0],
        };


  return (
    <motion.div
      className="pet-avatar"
      animate={animation}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >

      <img
        src={`/sprites/${emotion}.png`}
        alt={`Neko is ${emotion}`}
        draggable={false}
      />

    </motion.div>
  );
}
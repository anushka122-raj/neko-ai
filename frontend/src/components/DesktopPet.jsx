import { useState, useEffect } from "react";
import animationMap from "../utils/animationManager";
import usePetAnimation from "../hooks/usePetAnimation";

// ✅ Static mapping moved outside the component
const emotionAnimation = {
  happy: "happy",
  studying: "thinking",
  worried: "sad",
  celebrate: "celebrate",
  idle: "idle",
  sleeping: "sleep",
};

export default function DesktopPet({ emotion, completedTasks, totalTasks, isSpeaking, message }) {
  const { animation, play } = usePetAnimation();
  const [x, setX] = useState(200);

  // Step 5 — Emotion → Animation mapping
  useEffect(() => {
    if (emotion && emotionAnimation[emotion]) {
      play(emotionAnimation[emotion]);
    }
  }, [emotion, play]);

  // Step 6 — Idle Timer (reset on user activity)
  useEffect(() => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => play("sleep"), 600000); // 10 minutes
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer(); // start timer immediately

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      clearTimeout(timer);
    };
  }, [play]);

  // Step 7 — Celebration trigger when all tasks done
  useEffect(() => {
    if (completedTasks && totalTasks && completedTasks === totalTasks) {
      play("celebrate");
      const timer = setTimeout(() => play("idle"), 5000);
      return () => clearTimeout(timer);
    }
  }, [completedTasks, totalTasks, play]);

  // Step 9 — Walking simulation with bounce at screen edges
  useEffect(() => {
    let direction = 1;
    const id = setInterval(() => {
      setX((prev) => {
        if (prev > window.innerWidth - 200) direction = -1;
        if (prev < 0) direction = 1;
        return prev + 5 * direction;
      });
    }, 120);
    return () => clearInterval(id);
  }, []);

  // Step 10 — Speech bubble sync
  useEffect(() => {
    if (isSpeaking) {
      play("happy");
      const timer = setTimeout(() => play("idle"), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, play]);

  return (
    <div
      style={{
        position: "fixed",
        left: x,
        bottom: 30,
      }}
    >
      <img src={animationMap[animation]} alt="Neko" width={180} />

      {isSpeaking && (
        <div
          style={{
            position: "absolute",
            bottom: 200,
            left: 0,
            background: "#333",
            color: "white",
            padding: "10px 15px",
            borderRadius: "12px",
            fontSize: "16px",
            maxWidth: "250px",
            boxShadow: "0 2px 8px rgba(0,0,0,.3)",
          }}
        >
          💬 {message || "Neko is speaking..."}
        </div>
      )}
    </div>
  );
}

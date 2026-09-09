import {
  useEffect,
  useRef,
} from "react";

import Pet from "../components/Pet";
import {
  EmotionProvider,
} from "../context/EmotionContext.jsx";

import "./PetWindow.css";

export default function PetWindow() {
  const interactiveRef = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    html.classList.add("pet-route");
    body.classList.add("pet-route");
    root?.classList.add("pet-route");

    function updateInteraction(event) {
      const element =
        document.elementFromPoint(
          event.clientX,
          event.clientY
        );

      const shouldBeInteractive =
        Boolean(
          element?.closest(
            ".pet-drag-area, .pet-face-button, .pet-bubble-actions"
          )
        );

      if (
        interactiveRef.current ===
        shouldBeInteractive
      ) {
        return;
      }

      interactiveRef.current =
        shouldBeInteractive;

      window.electronAPI?.setPetInteractive(
        shouldBeInteractive
      );
    }

    window.addEventListener(
      "mousemove",
      updateInteraction
    );

    window.electronAPI?.setPetInteractive(
      false
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        updateInteraction
      );

      window.electronAPI?.setPetInteractive(
        false
      );

      html.classList.remove("pet-route");
      body.classList.remove("pet-route");
      root?.classList.remove("pet-route");
    };
  }, []);

  return (
    <EmotionProvider>
      <main className="pet-window-page">
        <Pet />
      </main>
    </EmotionProvider>
  );
}
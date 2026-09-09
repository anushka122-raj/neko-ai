import { useContext } from "react";

import {
  EmotionContext,
} from "../context/EmotionContext.jsx";

export default function useEmotion() {
  const context = useContext(EmotionContext);

  if (!context) {
    throw new Error(
      "useEmotion must be used inside EmotionProvider."
    );
  }

  return context;
}
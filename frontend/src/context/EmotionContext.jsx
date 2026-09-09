import {
  createContext,
  useMemo,
  useState,
} from "react";

export const EmotionContext = createContext(null);

export function EmotionProvider({ children }) {
  const [emotion, setEmotion] = useState("idle");

  const value = useMemo(
    () => ({
      emotion,
      setEmotion,
    }),
    [emotion]
  );

  return (
    <EmotionContext.Provider value={value}>
      {children}
    </EmotionContext.Provider>
  );
}
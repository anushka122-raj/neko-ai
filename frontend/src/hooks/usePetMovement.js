import {
  useEffect,
  useRef,
  useState,
} from "react";

const WALK_SPEED = 2;
const RUN_SPEED = 5;
const WALK_INTERVAL = 45;

/**
 * Moves the transparent pet window across the screen.
 *
 * This hook no longer decides *when* to walk — that is owned
 * entirely by usePetStateMachine. It only reacts to the locomotion
 * `state` it's given ("walk" / "run" move, anything else stays put)
 * and is paused while `isDragging` is true so it never fights the
 * native OS window drag.
 */
export default function usePetMovement(
  state,
  isDragging = false
) {
  const [direction, setDirection] =
    useState(1);

  const walkTimerRef = useRef(null);
  const movingRef = useRef(false);

  const isLocomoting =
    !isDragging &&
    (state === "walk" || state === "run");

  const speed =
    state === "run" ? RUN_SPEED : WALK_SPEED;

  useEffect(() => {
    if (
      !window.electronAPI?.movePetBy ||
      !isLocomoting
    ) {
      return undefined;
    }

    walkTimerRef.current =
      window.setInterval(async () => {
        if (movingRef.current) {
          return;
        }

        movingRef.current = true;

        try {
          const result =
            await window.electronAPI.movePetBy(
              direction * speed,
              0
            );

          if (
            result?.hitLeft ||
            result?.hitRight
          ) {
            setDirection((current) =>
              current === 1 ? -1 : 1
            );
          }
        } catch (error) {
          console.error(
            "Pet movement failed:",
            error
          );
        } finally {
          movingRef.current = false;
        }
      }, WALK_INTERVAL);

    return () => {
      window.clearInterval(
        walkTimerRef.current
      );
    };
  }, [direction, isLocomoting, speed]);

  function turnAround() {
    setDirection((current) =>
      current === 1 ? -1 : 1
    );
  }

  return {
    direction,
    turnAround,
  };
}

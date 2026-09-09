import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Core locomotion/behaviour state machine for the desktop pet.
 *
 * States: "idle" | "walk" | "run" | "sit" | "sleep"
 *
 * Autonomously cycles between states on its own timers. Anything else
 * (click/tickle reactions, alarm IPC events, etc.) should call
 * `forceState(next, holdMs)` instead of touching state directly — it
 * takes over for `holdMs`, then hands control back to the autonomous
 * cycle from wherever it left off. This keeps exactly one system in
 * charge of locomotion at any moment instead of multiple timers
 * fighting over it.
 */

const STATE_DURATIONS = {
  idle: [3000, 6000],
  walk: [4000, 9000],
  run: [2000, 4000],
  sit: [3500, 7000],
  sleep: [9000, 22000],
};

// [nextState, weight] — weights don't need to sum to 1, they're
// normalized at pick-time.
const TRANSITIONS = {
  idle: [
    ["walk", 0.42],
    ["sit", 0.2],
    ["idle", 0.28],
    ["sleep", 0.1],
  ],
  walk: [
    ["idle", 0.35],
    ["run", 0.2],
    ["sit", 0.15],
    ["walk", 0.3],
  ],
  run: [
    ["walk", 0.65],
    ["idle", 0.35],
  ],
  sit: [
    ["idle", 0.5],
    ["sleep", 0.25],
    ["sit", 0.25],
  ],
  sleep: [
    ["idle", 0.85],
    ["sleep", 0.15],
  ],
};

function pickNextState(current) {
  const options =
    TRANSITIONS[current] || TRANSITIONS.idle;

  const total = options.reduce(
    (sum, [, weight]) => sum + weight,
    0
  );

  let roll = Math.random() * total;

  for (const [next, weight] of options) {
    roll -= weight;

    if (roll <= 0) {
      return next;
    }
  }

  return options[0][0];
}

function randomDuration(state) {
  const [min, max] =
    STATE_DURATIONS[state] ||
    STATE_DURATIONS.idle;

  return min + Math.random() * (max - min);
}

export default function usePetStateMachine(
  initialState = "idle"
) {
  const [state, setState] =
    useState(initialState);

  const nextTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const heldRef = useRef(false);

  const scheduleNext = useCallback(
    (currentState) => {
      window.clearTimeout(
        nextTimerRef.current
      );

      nextTimerRef.current =
        window.setTimeout(() => {
          if (heldRef.current) {
            return;
          }

          setState(
            pickNextState(currentState)
          );
        }, randomDuration(currentState));
    },
    []
  );

  useEffect(() => {
    if (!heldRef.current) {
      scheduleNext(state);
    }

    return () => {
      window.clearTimeout(
        nextTimerRef.current
      );
    };
  }, [state, scheduleNext]);

  useEffect(() => {
    return () => {
      window.clearTimeout(
        nextTimerRef.current
      );

      window.clearTimeout(
        resumeTimerRef.current
      );
    };
  }, []);

  const forceState = useCallback(
    (next, holdMs = 2000) => {
      heldRef.current = true;

      window.clearTimeout(
        nextTimerRef.current
      );

      window.clearTimeout(
        resumeTimerRef.current
      );

      setState(next);

      resumeTimerRef.current =
        window.setTimeout(() => {
          heldRef.current = false;
          scheduleNext(next);
        }, holdMs);
    },
    [scheduleNext]
  );

  return {
    state,
    forceState,
  };
}

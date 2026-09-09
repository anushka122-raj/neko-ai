import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Drives the living companion reminder flow:
 *
 * idle -> entering -> talking -> waiting/reacting -> leaving -> idle
 *
 * This hook only manages the pet's social lifecycle and reminder data.
 * Pet drawing, animation, movement, and positioning belong in the pet
 * components.
 */

export const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "ws://127.0.0.1:8000/ws";

export const PET_LIFECYCLE_PHASES = {
  IDLE: "idle",
  HIDDEN: "hidden",
  ENTERING: "entering",
  TALKING: "talking",
  WAITING: "waiting",
  REACTING: "reacting",
  LEAVING: "leaving",
};

// Shared timing constants (also used by Pet.jsx for snooze).
export const NORMAL_REMINDER_INTERVAL_MS = 2 * 60 * 1000;
export const PET_VISIBLE_DURATION_MS = 15 * 1000;
export const DRAG_SNOOZE_DURATION_MS = 10 * 60 * 1000;

const PHASE_DURATION_MS = {
  entering: 1100,
  talking: 2600,
  reacting: 1500,
  leaving: 1100,
};

const WS_RECONNECT_DELAY_MS = 5000;

const SNOOZE_STORAGE_KEY = "neko-snooze-until";

/** Read persisted snooze timestamp; returns 0 if not set or expired. */
function readSnoozeUntil() {
  try {
    const raw = localStorage.getItem(SNOOZE_STORAGE_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

/** Persist snooze expiry to localStorage. */
function writeSnoozeUntil(ts) {
  try {
    localStorage.setItem(SNOOZE_STORAGE_KEY, String(ts));
  } catch {
    /* ignore */
  }
}

function clearSnoozeStorage() {
  try {
    localStorage.removeItem(SNOOZE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export default function usePetLifecycle() {
  const [phase, setPhase] = useState(
    PET_LIFECYCLE_PHASES.IDLE
  );

  const [reminder, setReminder] = useState(null);

  // snoozeUntil === 0 means "not snoozed". Initialized from localStorage
  // so a snooze persists across page refreshes.
  const [snoozeUntil, setSnoozeUntil] = useState(
    () => readSnoozeUntil()
  );

  const phaseTimerRef = useRef(null);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const lastEventKeyRef = useRef(null);
  const mountedRef = useRef(true);

  // Keep a ref in sync with state so callbacks can read it without
  // going stale.
  const snoozeUntilRef = useRef(snoozeUntil);
  snoozeUntilRef.current = snoozeUntil;

  const clearPhaseTimer = useCallback(() => {
    if (phaseTimerRef.current) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  }, []);

  const advanceAfter = useCallback(
    (nextPhase, delay) => {
      clearPhaseTimer();

      phaseTimerRef.current = window.setTimeout(
        () => {
          if (mountedRef.current) {
            setPhase(nextPhase);
          }
        },
        delay
      );
    },
    [clearPhaseTimer]
  );

  const triggerReminder = useCallback(
    (incoming) => {
      if (!incoming?.message) {
        return;
      }

      // Respect snooze: drop reminder if still snoozed.
      if (
        snoozeUntilRef.current > 0 &&
        Date.now() < snoozeUntilRef.current
      ) {
        return;
      }

      setReminder({
        message: incoming.message,
        emotion: incoming.emotion || "thinking",
        actions: Array.isArray(incoming.actions)
          ? incoming.actions
          : [],
        type: incoming.type || "task",
        taskId: incoming.taskId ?? null,
        respondedWith: null,
      });

      setPhase(PET_LIFECYCLE_PHASES.ENTERING);
    },
    []
  );

  const respond = useCallback((actionId) => {
    setReminder((current) =>
      current
        ? {
            ...current,
            respondedWith: actionId,
          }
        : current
    );

    setPhase(PET_LIFECYCLE_PHASES.REACTING);

    try {
      if (
        socketRef.current?.readyState ===
        WebSocket.OPEN
      ) {
        socketRef.current.send(
          JSON.stringify({
            type: "reminder-response",
            actionId,
          })
        );
      }
    } catch (error) {
      console.error(
        "Could not send reminder response:",
        error
      );
    }
  }, []);

  const goIdle = useCallback(() => {
    clearPhaseTimer();
    setReminder(null);
    setPhase(PET_LIFECYCLE_PHASES.IDLE);
  }, [clearPhaseTimer]);

  const goHidden = useCallback(() => {
    clearPhaseTimer();
    setReminder(null);
    setPhase(PET_LIFECYCLE_PHASES.HIDDEN);
  }, [clearPhaseTimer]);

  /**
   * Snooze the pet for DRAG_SNOOZE_DURATION_MS.
   * Persisted in localStorage so it survives refreshes.
   */
  const snooze = useCallback(() => {
    const until = Date.now() + DRAG_SNOOZE_DURATION_MS;
    setSnoozeUntil(until);
    writeSnoozeUntil(until);
    lastEventKeyRef.current = null; // allow same event to re-fire after snooze

    // Clear any active reminder immediately.
    clearPhaseTimer();
    setReminder(null);
    setPhase(PET_LIFECYCLE_PHASES.LEAVING);
  }, [clearPhaseTimer]);

  /**
   * Clear snooze early (called when pet returns from snooze).
   */
  const clearSnooze = useCallback(() => {
    setSnoozeUntil(0);
    clearSnoozeStorage();
  }, []);

  // Auto-clear expired snooze on a 10-second tick.
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (
        snoozeUntilRef.current > 0 &&
        Date.now() >= snoozeUntilRef.current
      ) {
        clearSnooze();
      }
    }, 10_000);

    return () => window.clearInterval(interval);
  }, [clearSnooze]);

  useEffect(() => {
    if (
      phase === PET_LIFECYCLE_PHASES.ENTERING
    ) {
      advanceAfter(
        PET_LIFECYCLE_PHASES.TALKING,
        PHASE_DURATION_MS.entering
      );
    } else if (
      phase === PET_LIFECYCLE_PHASES.TALKING
    ) {
      advanceAfter(
        reminder?.actions?.length
          ? PET_LIFECYCLE_PHASES.WAITING
          : PET_LIFECYCLE_PHASES.REACTING,
        PHASE_DURATION_MS.talking
      );
    } else if (
      phase === PET_LIFECYCLE_PHASES.REACTING
    ) {
      advanceAfter(
        PET_LIFECYCLE_PHASES.LEAVING,
        PHASE_DURATION_MS.reacting
      );
    } else if (
      phase === PET_LIFECYCLE_PHASES.LEAVING
    ) {
      advanceAfter(
        PET_LIFECYCLE_PHASES.IDLE,
        PHASE_DURATION_MS.leaving
      );
    }

    return clearPhaseTimer;
  }, [
    phase,
    reminder,
    advanceAfter,
    clearPhaseTimer,
  ]);

  useEffect(() => {
    if (phase === PET_LIFECYCLE_PHASES.IDLE) {
      setReminder(null);
    }
  }, [phase]);

  useEffect(() => {
    mountedRef.current = true;

    function scheduleReconnect() {
      if (!mountedRef.current) {
        return;
      }

      window.clearTimeout(
        reconnectTimerRef.current
      );

      reconnectTimerRef.current =
        window.setTimeout(
          connect,
          WS_RECONNECT_DELAY_MS
        );
    }

    function connect() {
      if (!mountedRef.current) {
        return;
      }

      let socket;

      try {
        socket = new WebSocket(WS_URL);
      } catch (error) {
        console.error(
          "Could not create pet WebSocket:",
          error
        );

        scheduleReconnect();
        return;
      }

      socketRef.current = socket;

      socket.onopen = () => {
        console.info(
          "Neko pet WebSocket connected."
        );
      };

      socket.onmessage = (event) => {
        let data;

        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        if (!data?.message) {
          return;
        }

        const eventKey = `${
          data.type || "task"
        }:${data.taskId ?? ""}:${data.message}`;

        if (
          eventKey === lastEventKeyRef.current
        ) {
          return;
        }

        lastEventKeyRef.current = eventKey;
        triggerReminder(data);
      };

      socket.onerror = (error) => {
        console.error(
          "Pet WebSocket error:",
          error
        );

        socket.close();
      };

      socket.onclose = () => {
        if (
          socketRef.current === socket
        ) {
          socketRef.current = null;
        }

        scheduleReconnect();
      };
    }

    connect();

    return () => {
      mountedRef.current = false;

      clearPhaseTimer();

      window.clearTimeout(
        reconnectTimerRef.current
      );

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [clearPhaseTimer, triggerReminder]);

  const isSnoozed =
    snoozeUntil > 0 && Date.now() < snoozeUntil;

  return {
    phase,
    reminder,
    triggerReminder,
    respond,
    goIdle,
    goHidden,
    snooze,
    clearSnooze,
    isSnoozed,
    snoozeUntil,
  };
}

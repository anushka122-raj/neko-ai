import {
  useEffect,
  useRef,
  useState,
} from "react";

import Sprite from "./Sprite";
import PetBubble from "./PetBubble";
import useEmotion from "../hooks/useEmotion";
import usePetLifecycle, {
  PET_LIFECYCLE_PHASES,
} from "../hooks/usePetLifecycle";
import usePetMovement from "../hooks/usePetMovement";
import usePetStateMachine from "../hooks/usePetStateMachine";

import "./Pet.css";

// Movement threshold: pointer must travel more than this many pixels
// before we call it a drag instead of a click.
const DRAG_THRESHOLD_PX = 6;

// How far past the screen edge (in px) before we treat the drag as
// "intentionally off-screen" and snooze the pet.
const OFFSCREEN_SNOOZE_THRESHOLD_PX = 60;

// Worst-case failsafe: if the OS swallows pointerup (e.g. on a native
// drag), clear the dragging pose automatically.
const DRAG_FAILSAFE_MS = 4000;

const randomMotivations = [
  "Meow! Ready for one small win? 🐾",
  "No side quests. Lock in.",
  "Tiny progress still counts.",
  "I am watching supportively 😼",
  "Hydration check, bestie 💧",
  "Do not make me use the sad eyes 🥺",
];

export default function Pet() {
  const {
    state,
    forceState,
  } = usePetStateMachine("idle");

  const [isDragging, setIsDragging] =
    useState(false);

  const {
    direction,
    turnAround,
  } = usePetMovement(state, isDragging);

  const {
    emotion,
    setEmotion,
  } = useEmotion();

  // Lifecycle hook — single WebSocket connection, reminder state machine.
  const {
    phase,
    reminder,
    respond,
    snooze,
  } = usePetLifecycle();

  // When a lifecycle reminder arrives, mirror its emotion onto the
  // sprite. Reset to "idle" when the reminder is gone.
  useEffect(() => {
    if (reminder?.emotion) {
      setEmotion(reminder.emotion);
    } else if (
      phase === PET_LIFECYCLE_PHASES.IDLE ||
      phase === PET_LIFECYCLE_PHASES.HIDDEN
    ) {
      setEmotion("idle");
    }
  }, [reminder, phase, setEmotion]);

  // Keep locomotion in sync with lifecycle phase.
  useEffect(() => {
    if (
      phase === PET_LIFECYCLE_PHASES.ENTERING ||
      phase === PET_LIFECYCLE_PHASES.LEAVING
    ) {
      forceState("walk", 1500);
    } else if (
      phase === PET_LIFECYCLE_PHASES.TALKING ||
      phase === PET_LIFECYCLE_PHASES.WAITING ||
      phase === PET_LIFECYCLE_PHASES.REACTING
    ) {
      forceState("sit", 3500);
    }
  }, [phase, forceState]);

  const [message, setMessage] =
    useState("");

  const [xp, setXp] = useState(() => {
    const saved =
      localStorage.getItem("neko-xp");

    return Number(saved || 0);
  });

  const [showXp, setShowXp] =
    useState(false);

  const speechTimerRef = useRef(null);
  const emotionTimerRef = useRef(null);
  const clickTimerRef = useRef(null);
  const dragFailsafeRef = useRef(null);

  // Pointer-drag tracking.
  const pointerDownRef = useRef(null); // { x, y, pointerId, offsetX, offsetY }
  const isDraggingRef = useRef(false); // mirrors isDragging without stale closure

  const level = Math.floor(xp / 100) + 1;
  const levelProgress = xp % 100;

  useEffect(() => {
    localStorage.setItem(
      "neko-xp",
      String(xp)
    );
  }, [xp]);

  // IPC: onPetEmotion / onPetMessage listeners (alarm module, etc.)
  useEffect(() => {
    const removeMessageListener =
      window.electronAPI?.onPetMessage?.(
        (newMessage) => {
          showMessage(newMessage);
          playMeow("happy");
        }
      );

    const removeEmotionListener =
      window.electronAPI?.onPetEmotion?.(
        (newEmotion) => {
          setEmotion(newEmotion);

          if (newEmotion === "sleep") {
            forceState("sleep", 6000);
          } else if (newEmotion === "sad") {
            forceState("sit", 5000);
          }
        }
      );

    return () => {
      removeMessageListener?.();
      removeEmotionListener?.();
    };
  }, [setEmotion, forceState]);

  // Personality timer: occasional motivational messages when there is
  // NO active lifecycle reminder. Avoids polluting the reminder bubble.
  useEffect(() => {
    const personalityTimer =
      window.setInterval(() => {
        // Only show random messages when the pet is idle (not in a
        // lifecycle reminder flow).
        if (
          phase !== PET_LIFECYCLE_PHASES.IDLE
        ) {
          return;
        }

        if (Math.random() < 0.35) {
          const nextMessage =
            randomMotivations[
              Math.floor(
                Math.random() *
                  randomMotivations.length
              )
            ];

          showMessage(nextMessage);
        }

        if (Math.random() < 0.2) {
          setEmotion("happy");

          window.clearTimeout(
            emotionTimerRef.current
          );

          emotionTimerRef.current =
            window.setTimeout(() => {
              setEmotion("idle");
            }, 1600);
        }
      }, 15000);

    return () => {
      window.clearInterval(
        personalityTimer
      );

      window.clearTimeout(
        emotionTimerRef.current
      );
    };
  }, [phase, setEmotion]);

  // Global pointerup / blur to end drag safely.
  useEffect(() => {
    function handleGlobalPointerUp(e) {
      if (isDraggingRef.current) {
        endDrag(e);
      }
    }

    function handleBlur() {
      if (isDraggingRef.current) {
        endDrag(null);
      }
    }

    window.addEventListener(
      "pointerup",
      handleGlobalPointerUp
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    return () => {
      window.removeEventListener(
        "pointerup",
        handleGlobalPointerUp
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );

      window.clearTimeout(
        dragFailsafeRef.current
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showMessage(text) {
    window.clearTimeout(
      speechTimerRef.current
    );

    setMessage(text);

    speechTimerRef.current =
      window.setTimeout(() => {
        setMessage("");
      }, 4800);
  }

  function playMeow(type = "normal") {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      const context = new AudioContext();
      const oscillator =
        context.createOscillator();
      const gain = context.createGain();

      const sounds = {
        normal: [520, 760, 430],
        happy: [650, 900, 580],
        sad: [480, 350, 260],
      };

      const notes =
        sounds[type] ||
        sounds.normal;

      const now = context.currentTime;

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        notes[0],
        now
      );

      oscillator.frequency.linearRampToValueAtTime(
        notes[1],
        now + 0.12
      );

      oscillator.frequency.linearRampToValueAtTime(
        notes[2],
        now + 0.4
      );

      gain.gain.setValueAtTime(
        0.0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        0.14,
        now + 0.03
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.45
      );

      oscillator.start(now);
      oscillator.stop(now + 0.46);
    } catch (error) {
      console.error(
        "Meow sound failed:",
        error
      );
    }
  }

  function rewardXp(amount) {
    setXp((current) =>
      current + amount
    );

    setShowXp(true);

    window.setTimeout(() => {
      setShowXp(false);
    }, 1000);
  }

  function performTickle() {
    const nextEmotion =
      emotion === "happy"
        ? "celebrate"
        : "happy";

    setEmotion(nextEmotion);
    forceState("sit", 2000);

    rewardXp(5);
    playMeow("happy");

    showMessage(
      nextEmotion === "celebrate"
        ? "More pets! I approve 😻"
        : "Purrrrr... tickles!"
    );

    window.clearTimeout(
      emotionTimerRef.current
    );

    emotionTimerRef.current =
      window.setTimeout(() => {
        setEmotion("idle");
      }, 2000);
  }

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    window.clearTimeout(
      clickTimerRef.current
    );

    clickTimerRef.current =
      window.setTimeout(() => {
        performTickle();
      }, 230);
  }

  function handleDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    window.clearTimeout(
      clickTimerRef.current
    );

    setEmotion("excited");
    forceState("sit", 1800);

    rewardXp(15);
    playMeow("happy");

    showMessage(
      "Opening your productivity HQ! ⚡"
    );

    window.electronAPI?.openDashboard();

    window.clearTimeout(
      emotionTimerRef.current
    );

    emotionTimerRef.current =
      window.setTimeout(() => {
        setEmotion("idle");
      }, 1800);
  }

  function handleContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();

    turnAround();
    setEmotion("surprised");

    window.clearTimeout(
      emotionTimerRef.current
    );

    emotionTimerRef.current =
      window.setTimeout(() => {
        setEmotion("idle");
      }, 1500);

    showMessage(
      "Whoa! Secret turnaround unlocked 🙀"
    );
  }

  // ─── Pointer-event dragging ──────────────────────────────────────
  // We use pointerdown/pointermove/pointerup (instead of mousedown) so
  // the drag also works on touch / pen and we can capture the pointer
  // to receive events outside the element.

  function handlePointerDown(event) {
    // Only left-button / primary touch; ignore right-click etc.
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    pointerDownRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };

    // Capture pointer so we keep receiving events even if the cursor
    // leaves the element.
    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {
      /* ignore */
    }
  }

  function handlePointerMove(event) {
    const pd = pointerDownRef.current;

    if (!pd || pd.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - pd.startX;
    const dy = event.clientY - pd.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!isDraggingRef.current) {
      if (dist < DRAG_THRESHOLD_PX) {
        return;
      }

      // Crossed the threshold — this is a drag.
      isDraggingRef.current = true;
      setIsDragging(true);

      forceState(state, DRAG_FAILSAFE_MS + 500);

      window.clearTimeout(
        dragFailsafeRef.current
      );

      dragFailsafeRef.current =
        window.setTimeout(() => {
          if (isDraggingRef.current) {
            endDrag(null);
          }
        }, DRAG_FAILSAFE_MS);

      // Tell Electron to start the native window-drag interval,
      // passing the cursor offset within the window so the pet
      // doesn't jump.
      window.electronAPI?.startPetDrag({
        x: pd.startX,
        y: pd.startY,
      });
    }
  }

  async function endDrag(event) {
    window.clearTimeout(
      dragFailsafeRef.current
    );

    if (!isDraggingRef.current) {
      pointerDownRef.current = null;
      return;
    }

    isDraggingRef.current = false;
    pointerDownRef.current = null;

    window.electronAPI?.stopPetDrag();

    // Check whether the user intentionally dragged the pet off-screen.
    // Electron clamps the window at screen edges so windowBounds alone
    // won't show off-screen values; instead we compare the final cursor
    // position (from the last pointer event) against the work area.
    try {
      const info =
        await window.electronAPI?.getPetScreenInfo?.();

      if (info && event) {
        const { workArea } = info;

        // clientX/clientY are in the pet window's coordinate system
        // (0,0 = top-left of pet window). Convert to screen coords by
        // adding windowBounds position.
        const { windowBounds } = info;

        const screenCursorX =
          windowBounds.x + event.clientX;

        const screenCursorY =
          windowBounds.y + event.clientY;

        const offLeft =
          workArea.x - screenCursorX;

        const offRight =
          screenCursorX -
          (workArea.x + workArea.width);

        const offTop =
          workArea.y - screenCursorY;

        const offBottom =
          screenCursorY -
          (workArea.y + workArea.height);

        const maxOff = Math.max(
          offLeft,
          offRight,
          offTop,
          offBottom
        );

        if (maxOff > OFFSCREEN_SNOOZE_THRESHOLD_PX) {
          // The pet was dragged off-screen — snooze.
          snooze();
          setIsDragging(false);
          return;
        }
      }
    } catch {
      /* screen info unavailable — just end drag normally */
    }

    setIsDragging((wasDragging) => {
      if (wasDragging) {
        forceState("idle", 300);
      }
      return false;
    });
  }

  // The bubble shown above the pet during lifecycle talk/wait phases.
  // Rendered inside the same wrapper so it moves with the window.
  const showLifecycleBubble =
    (phase === PET_LIFECYCLE_PHASES.TALKING ||
      phase === PET_LIFECYCLE_PHASES.WAITING) &&
    reminder?.message;

  // The simple personality message bubble (shown when idle).
  const showSimpleBubble =
    !showLifecycleBubble && message;

  return (
    <div className="desktop-pet">
      {/* Shared wrapper so bubble + sprite move as one unit */}
      <div
        className={[
          "pet-wrapper",
          `pet-lifecycle-${phase}`,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Lifecycle reminder bubble (task/emotion-aware) */}
        {showLifecycleBubble && (
          <div className="pet-bubble-above">
            <PetBubble
              lifecyclePhase={phase}
              message={reminder.message}
              actions={reminder.actions}
              onAction={respond}
            />
          </div>
        )}

        {/* Simple personality message bubble */}
        {showSimpleBubble && (
          <div className="pet-speech-bubble pet-bubble-above-simple">
            <p>{message}</p>
            <span />
          </div>
        )}

        <div className="pet-level-card">
          <span>Lv. {level}</span>

          <div className="pet-xp-track">
            <div
              className="pet-xp-fill"
              style={{
                width: `${levelProgress}%`,
              }}
            />
          </div>
        </div>

        {showXp && (
          <div className="pet-xp-popup">
            +5 XP
          </div>
        )}

        {/* Drag area — captures pointer events to move the window */}
        <div
          className="pet-drag-area"
          title="Drag Neko"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        >
          <Sprite
            state={state}
            direction={direction}
            isDragging={isDragging}
            talking={
              phase === PET_LIFECYCLE_PHASES.TALKING ||
              phase === PET_LIFECYCLE_PHASES.WAITING
            }
          />
        </div>

        <button
          type="button"
          className="pet-face-button"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          aria-label="Tickle Neko"
          title="Click to tickle · Double-click to open NekoAI"
        />
      </div>
    </div>
  );
}

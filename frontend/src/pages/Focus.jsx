import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./Focus.css";

const presets = [
  {
    id: "quick",
    title: "Quick Lock-In",
    subtitle: "25 min focus",
    focusMinutes: 25,
    breakMinutes: 5,
    icon: "⚡",
  },
  {
    id: "deep",
    title: "Deep Work",
    subtitle: "50 min focus",
    focusMinutes: 50,
    breakMinutes: 10,
    icon: "🔥",
  },
  {
    id: "soft",
    title: "Soft Start",
    subtitle: "15 min focus",
    focusMinutes: 15,
    breakMinutes: 5,
    icon: "🌱",
  },
];

const focusMessages = [
  "Phone down. Aura up.",
  "Locked in. No side quests.",
  "Main character productivity arc.",
  "One session now. Flex later.",
  "Cook the task before it cooks you.",
];

const breakMessages = [
  "Hydrate. Stretch. Touch grass briefly.",
  "Tiny break, then we lock in again.",
  "Rest is part of the grind.",
];

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getStoredNumber(key) {
  const value = Number(localStorage.getItem(key));

  return Number.isFinite(value) ? value : 0;
}

export default function Focus() {
  const [selectedPreset, setSelectedPreset] =
    useState(presets[0]);

  const [mode, setMode] = useState("focus");
  const [customMinutes, setCustomMinutes] =
    useState(30);

  const [totalSeconds, setTotalSeconds] = useState(
    presets[0].focusMinutes * 60
  );

  const [secondsLeft, setSecondsLeft] = useState(
    presets[0].focusMinutes * 60
  );

  const [status, setStatus] = useState("idle");

  const [sessionsToday, setSessionsToday] = useState(
    () =>
      getStoredNumber(
        `neko-focus-sessions-${getTodayKey()}`
      )
  );

  const [focusMinutesToday, setFocusMinutesToday] =
    useState(() =>
      getStoredNumber(
        `neko-focus-minutes-${getTodayKey()}`
      )
    );

  const [earnedXp, setEarnedXp] = useState(0);
  const [completionMessage, setCompletionMessage] =
    useState("");

  const intervalRef = useRef(null);
  const completionHandledRef = useRef(false);

  const activeMinutes =
    mode === "focus"
      ? selectedPreset.focusMinutes
      : selectedPreset.breakMinutes;

  const progress = useMemo(() => {
    if (totalSeconds <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        ((totalSeconds - secondsLeft) /
          totalSeconds) *
          100
      )
    );
  }, [secondsLeft, totalSeconds]);

  const motivationalMessage = useMemo(() => {
    const source =
      mode === "focus"
        ? focusMessages
        : breakMessages;

    const index =
      (selectedPreset.focusMinutes +
        selectedPreset.breakMinutes) %
      source.length;

    return source[index];
  }, [mode, selectedPreset]);

  useEffect(() => {
    if (status !== "running") {
      return undefined;
    }

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalRef.current);
    };
  }, [status]);

  useEffect(() => {
    if (
      secondsLeft !== 0 ||
      completionHandledRef.current
    ) {
      return;
    }

    completionHandledRef.current = true;
    window.clearInterval(intervalRef.current);
    setStatus("completed");

    if (mode === "focus") {
      completeFocusSession();
    } else {
      playFinishSound();
      setCompletionMessage(
        "Break complete. Neko says it’s lock-in time again 😼"
      );
    }
  }, [secondsLeft, mode]);

  function setTimer(minutes) {
    const seconds = Math.max(1, minutes) * 60;

    completionHandledRef.current = false;
    setTotalSeconds(seconds);
    setSecondsLeft(seconds);
    setStatus("idle");
    setCompletionMessage("");
    setEarnedXp(0);
  }

  function choosePreset(preset) {
    setSelectedPreset(preset);
    setMode("focus");
    setTimer(preset.focusMinutes);
  }

  function switchMode(nextMode) {
    setMode(nextMode);

    const minutes =
      nextMode === "focus"
        ? selectedPreset.focusMinutes
        : selectedPreset.breakMinutes;

    setTimer(minutes);
  }

  function applyCustomTimer() {
    const safeMinutes = Math.min(
      180,
      Math.max(1, Number(customMinutes) || 1)
    );

    const customPreset = {
      id: "custom",
      title: "Custom Session",
      subtitle: `${safeMinutes} min focus`,
      focusMinutes: safeMinutes,
      breakMinutes: 5,
      icon: "🧪",
    };

    setSelectedPreset(customPreset);
    setMode("focus");
    setTimer(safeMinutes);
  }

  function startTimer() {
    if (secondsLeft === 0) {
      setTimer(activeMinutes);
    }

    completionHandledRef.current = false;
    setStatus("running");
    setCompletionMessage("");
  }

  function pauseTimer() {
    setStatus("paused");
  }

  function resetTimer() {
    const minutes =
      mode === "focus"
        ? selectedPreset.focusMinutes
        : selectedPreset.breakMinutes;

    setTimer(minutes);
  }

  function playFinishSound() {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      const context = new AudioContext();
      const gain = context.createGain();

      gain.connect(context.destination);

      const notes = [523.25, 659.25, 783.99];

      notes.forEach((frequency, index) => {
        const oscillator =
          context.createOscillator();

        oscillator.connect(gain);
        oscillator.type = "sine";

        const start =
          context.currentTime + index * 0.16;

        oscillator.frequency.setValueAtTime(
          frequency,
          start
        );

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(
          0.15,
          start + 0.02
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + 0.15
        );

        oscillator.start(start);
        oscillator.stop(start + 0.16);
      });
    } catch (error) {
      console.error("Focus sound error:", error);
    }
  }

  function completeFocusSession() {
    const completedMinutes =
      selectedPreset.focusMinutes;

    const xpReward = Math.max(
      10,
      Math.round(completedMinutes * 1.5)
    );

    const nextSessions = sessionsToday + 1;
    const nextMinutes =
      focusMinutesToday + completedMinutes;

    setSessionsToday(nextSessions);
    setFocusMinutesToday(nextMinutes);
    setEarnedXp(xpReward);

    localStorage.setItem(
      `neko-focus-sessions-${getTodayKey()}`,
      String(nextSessions)
    );

    localStorage.setItem(
      `neko-focus-minutes-${getTodayKey()}`,
      String(nextMinutes)
    );

    const currentXp = getStoredNumber("neko-xp");

    localStorage.setItem(
      "neko-xp",
      String(currentXp + xpReward)
    );

    const history = JSON.parse(
      localStorage.getItem("neko-focus-history") ||
        "[]"
    );

    history.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      minutes: completedMinutes,
      xp: xpReward,
      preset: selectedPreset.title,
    });

    localStorage.setItem(
      "neko-focus-history",
      JSON.stringify(history.slice(0, 100))
    );

    window.dispatchEvent(
      new CustomEvent("neko-focus-complete", {
        detail: {
          minutes: completedMinutes,
          xp: xpReward,
        },
      })
    );

    playFinishSound();

    setCompletionMessage(
      `You absolutely cooked. +${xpReward} XP unlocked.`
    );

    if (
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification("NekoAI Focus Complete", {
        body: `You completed ${completedMinutes} minutes and earned ${xpReward} XP.`,
      });
    }
  }

  async function requestNotifications() {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  return (
    <div className="focus-page">
      <section className="focus-hero">
        <div className="focus-hero-content">
          <span className="focus-eyebrow">
            NEKO LOCK-IN ZONE
          </span>

          <h1>
            Lock in now.
            <br />
            Flex the results later.
          </h1>

          <p>
            Pick a session, silence the chaos and let
            Neko guard your focus streak.
          </p>
        </div>

        <div className="focus-hero-mascot">
          <span>😼</span>
          <small>Zero distractions allowed</small>
        </div>
      </section>

      <section className="focus-layout">
        <div className="focus-main-card">
          <div className="focus-mode-switch">
            <button
              type="button"
              className={
                mode === "focus"
                  ? "focus-mode-active"
                  : ""
              }
              onClick={() => switchMode("focus")}
            >
              ⚡ Focus
            </button>

            <button
              type="button"
              className={
                mode === "break"
                  ? "focus-mode-active"
                  : ""
              }
              onClick={() => switchMode("break")}
            >
              🌿 Break
            </button>
          </div>

          <div className="focus-timer-wrapper">
            <div
              className="focus-progress-ring"
              style={{
                "--focus-progress": `${progress * 3.6}deg`,
              }}
            >
              <div className="focus-progress-inner">
                <span className="focus-timer-label">
                  {mode === "focus"
                    ? selectedPreset.title
                    : "Recovery Arc"}
                </span>

                <strong>
                  {formatTime(secondsLeft)}
                </strong>

                <small>
                  {status === "running"
                    ? motivationalMessage
                    : status === "paused"
                      ? "Paused. Neko is judging respectfully."
                      : status === "completed"
                        ? "Session complete."
                        : "Ready when you are."}
                </small>
              </div>
            </div>
          </div>

          <div className="focus-controls">
            {status === "running" ? (
              <button
                type="button"
                className="focus-secondary-button"
                onClick={pauseTimer}
              >
                ⏸ Pause
              </button>
            ) : (
              <button
                type="button"
                className="focus-primary-button"
                onClick={startTimer}
              >
                {status === "paused"
                  ? "▶ Resume"
                  : "▶ Start locking in"}
              </button>
            )}

            <button
              type="button"
              className="focus-reset-button"
              onClick={resetTimer}
            >
              ↻ Reset
            </button>
          </div>

          {completionMessage && (
            <div className="focus-complete-message">
              <span>🏆</span>

              <div>
                <strong>{completionMessage}</strong>

                {earnedXp > 0 && (
                  <small>
                    Neko’s respect for you increased.
                  </small>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="focus-side-panel">
          <section className="focus-stat-grid">
            <article>
              <span>Sessions today</span>
              <strong>{sessionsToday}</strong>
              <small>Certified lock-ins</small>
            </article>

            <article>
              <span>Focus today</span>
              <strong>{focusMinutesToday}m</strong>
              <small>Brain gains</small>
            </article>
          </section>

          <section className="focus-presets-card">
            <div className="focus-section-heading">
              <span>CHOOSE YOUR VIBE</span>
              <h2>Focus presets</h2>
            </div>

            <div className="focus-preset-list">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={
                    selectedPreset.id === preset.id
                      ? "focus-preset-active"
                      : ""
                  }
                  onClick={() => choosePreset(preset)}
                >
                  <span className="focus-preset-icon">
                    {preset.icon}
                  </span>

                  <span>
                    <strong>{preset.title}</strong>
                    <small>{preset.subtitle}</small>
                  </span>

                  <span className="focus-preset-arrow">
                    →
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="focus-custom-card">
            <div>
              <span>CUSTOM CHAOS CONTROL</span>
              <h2>Set your own timer</h2>
            </div>

            <div className="focus-custom-input">
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutes}
                onChange={(event) =>
                  setCustomMinutes(event.target.value)
                }
              />

              <span>minutes</span>

              <button
                type="button"
                onClick={applyCustomTimer}
              >
                Apply
              </button>
            </div>
          </section>

          <button
            type="button"
            className="focus-notification-button"
            onClick={requestNotifications}
          >
            🔔 Enable finish notifications
          </button>
        </aside>
      </section>
    </div>
  );
}
import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./AlarmRing.css";

export default function AlarmRing() {
  const [alarm, setAlarm] = useState(null);
  const [status, setStatus] = useState(
    "Rise and grind, bestie."
  );

  const audioContextRef = useRef(null);
  const soundTimerRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add(
      "alarm-ring-route"
    );

    document.body.classList.add(
      "alarm-ring-route"
    );

    const root =
      document.getElementById("root");

    root?.classList.add("alarm-ring-route");

    loadAlarm();

    const removeListener =
      window.electronAPI?.onAlarmPopupData?.(
        (incomingAlarm) => {
          setAlarm(incomingAlarm);
          startAlarmSound();
        }
      );

    return () => {
      stopAlarmSound();
      removeListener?.();

      document.documentElement.classList.remove(
        "alarm-ring-route"
      );

      document.body.classList.remove(
        "alarm-ring-route"
      );

      root?.classList.remove(
        "alarm-ring-route"
      );
    };
  }, []);

  async function loadAlarm() {
    try {
      const currentAlarm =
        await window.electronAPI?.getActiveAlarm?.();

      if (currentAlarm) {
        setAlarm(currentAlarm);
        startAlarmSound();
      }
    } catch (error) {
      console.error(
        "Could not load active alarm:",
        error
      );
    }
  }

  function playAlarmPattern() {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current =
          new AudioContext();
      }

      const context =
        audioContextRef.current;

      const gain = context.createGain();

      gain.connect(context.destination);

      const notes = [
        740,
        920,
        740,
        1040,
        820,
        1100,
      ];

      notes.forEach((frequency, index) => {
        const oscillator =
          context.createOscillator();

        const start =
          context.currentTime +
          index * 0.17;

        oscillator.type =
          index % 2 === 0
            ? "square"
            : "sine";

        oscillator.frequency.setValueAtTime(
          frequency,
          start
        );

        oscillator.connect(gain);

        gain.gain.setValueAtTime(
          0.0001,
          start
        );

        gain.gain.exponentialRampToValueAtTime(
          0.16,
          start + 0.02
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + 0.13
        );

        oscillator.start(start);
        oscillator.stop(start + 0.14);
      });
    } catch (error) {
      console.error(
        "Alarm sound error:",
        error
      );
    }
  }

  function startAlarmSound() {
    stopAlarmSound();

    playAlarmPattern();

    soundTimerRef.current =
      window.setInterval(() => {
        playAlarmPattern();
      }, 1500);
  }

  function stopAlarmSound() {
    if (soundTimerRef.current) {
      window.clearInterval(
        soundTimerRef.current
      );

      soundTimerRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current
        .close()
        .catch(() => {});

      audioContextRef.current = null;
    }
  }

  async function snooze(minutes) {
    if (!alarm) {
      return;
    }

    try {
      setStatus(
        `Fine... ${minutes} more minutes. 😾`
      );

      stopAlarmSound();

      await window.electronAPI?.snoozeAlarm?.(
        alarm.id,
        minutes
      );

      window.electronAPI?.closeAlarmPopup?.();
    } catch (error) {
      console.error(error);
      setStatus("Snooze failed. Neko is confused.");
      startAlarmSound();
    }
  }

  async function dismiss() {
    if (!alarm) {
      return;
    }

    try {
      setStatus(
        "Okay, you're awake. +20 XP ✨"
      );

      stopAlarmSound();

      await window.electronAPI?.dismissAlarm?.(
        alarm.id
      );

      window.setTimeout(() => {
        window.electronAPI?.closeAlarmPopup?.();
      }, 700);
    } catch (error) {
      console.error(error);
      setStatus("Dismiss failed. Try again.");
      startAlarmSound();
    }
  }

  return (
    <main className="alarm-ring-page">
      <div className="alarm-ring-glow" />

      <section className="alarm-ring-card">
        <div className="alarm-ring-cat">
          😾
        </div>

        <span className="alarm-ring-eyebrow">
          NEKO IS YELLING
        </span>

        <h1>
          {alarm?.label || "Wake up!"}
        </h1>

        <div className="alarm-ring-time">
          {alarm?.time || "--:--"}
        </div>

        <p>{status}</p>

        <div className="alarm-ring-warning">
          Ignoring this alarm will disappoint
          Neko emotionally.
        </div>

        <div className="alarm-ring-snooze">
          <button
            type="button"
            onClick={() => snooze(5)}
          >
            😴 5 min
          </button>

          <button
            type="button"
            onClick={() => snooze(10)}
          >
            😪 10 min
          </button>

          <button
            type="button"
            onClick={() => snooze(15)}
          >
            💤 15 min
          </button>
        </div>

        <button
          type="button"
          className="alarm-ring-dismiss"
          onClick={dismiss}
        >
          I’m awake — dismiss alarm
        </button>
      </section>
    </main>
  );
}
import { useEffect, useRef, useState } from "react";

import { WS_URL } from "../hooks/usePetLifecycle";

import "./PetTest.css";

/**
 * Developer-only page for exercising the pet's reminder lifecycle
 * without waiting for a real alarm/task/habit event.
 *
 * This page runs inside the dashboard window, while the pet lives in
 * its own transparent window — they're separate renderer processes,
 * so there's no shared React state to call into directly. Instead,
 * each button sends a structured JSON event over the same /ws
 * connection the pet's usePetLifecycle hook is already listening on,
 * which is the same path a real backend-triggered reminder takes.
 * "Leave" is the one exception — it goes through the existing
 * hidePet() Electron IPC, since disappearing the pet window entirely
 * is a real window-level action, not a reminder.
 */
export default function PetTest() {
  const socketRef = useRef(null);
  const [connected, setConnected] =
    useState(false);

  const [log, setLog] = useState([]);

  useEffect(() => {
    let cancelled = false;
    let socket;

    function connect() {
      if (cancelled) {
        return;
      }

      socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
      };

      socket.onclose = () => {
        setConnected(false);

        if (!cancelled) {
          window.setTimeout(connect, 4000);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      socket?.close();
    };
  }, []);

  function send(event) {
    appendLog(
      `→ sent: ${event.message}`
    );

    try {
      socketRef.current?.send(
        JSON.stringify(event)
      );
    } catch (error) {
      appendLog(
        `✗ send failed: ${error.message}`
      );
    }
  }

  function appendLog(line) {
    setLog((current) =>
      [line, ...current].slice(0, 12)
    );
  }

  function triggerReminder() {
    send({
      type: "task",
      message:
        "Your DSA task is due.",
      emotion: "thinking",
      actions: [
        {
          id: "done",
          label: "Mark Done",
        },
        {
          id: "later",
          label: "Later",
        },
      ],
    });
  }

  function triggerCelebrate() {
    send({
      type: "celebrate",
      message:
        "Great job! You completed today's task!",
      emotion: "celebrate",
    });
  }

  function triggerSleep() {
    send({
      type: "break",
      message:
        "Taking a quick nap... zzz 😴",
      emotion: "sleep",
    });
  }

  function triggerLeave() {
    appendLog("→ hidePet() via Electron IPC");
    window.electronAPI?.hidePet();
  }

  return (
    <div className="pet-test-page">
      <h1>Pet Behavior Test</h1>

      <p className="pet-test-status">
        /ws connection:{" "}
        <span
          className={
            connected
              ? "pet-test-status-ok"
              : "pet-test-status-bad"
          }
        >
          {connected
            ? "connected"
            : "connecting..."}
        </span>
      </p>

      <div className="pet-test-buttons">
        <button
          type="button"
          onClick={triggerReminder}
        >
          Trigger Reminder
        </button>

        <button
          type="button"
          onClick={triggerCelebrate}
        >
          Celebrate
        </button>

        <button
          type="button"
          onClick={triggerSleep}
        >
          Sleep
        </button>

        <button
          type="button"
          onClick={triggerLeave}
        >
          Leave
        </button>
      </div>

      <div className="pet-test-log">
        {log.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
}

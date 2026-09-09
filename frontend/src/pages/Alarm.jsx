import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./Alarm.css";

const weekDays = [
  {
    value: 1,
    short: "M",
    label: "Monday",
  },
  {
    value: 2,
    short: "T",
    label: "Tuesday",
  },
  {
    value: 3,
    short: "W",
    label: "Wednesday",
  },
  {
    value: 4,
    short: "T",
    label: "Thursday",
  },
  {
    value: 5,
    short: "F",
    label: "Friday",
  },
  {
    value: 6,
    short: "S",
    label: "Saturday",
  },
  {
    value: 0,
    short: "S",
    label: "Sunday",
  },
];

const alarmPresets = [
  {
    label: "Wake-up arc",
    icon: "🌅",
    time: "07:00",
    repeat: "daily",
  },
  {
    label: "Study grind",
    icon: "📚",
    time: "18:00",
    repeat: "weekdays",
  },
  {
    label: "Hydration check",
    icon: "💧",
    time: "12:00",
    repeat: "daily",
  },
];

function getTodayInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(
    now.getTime() - offset * 60_000
  )
    .toISOString()
    .slice(0, 10);
}

function createInitialForm() {
  return {
    label: "",
    time: "08:00",
    date: getTodayInputValue(),
    repeat: "once",
    days: [1, 2, 3, 4, 5],
    enabled: true,
  };
}

function formatAlarmTime(time) {
  if (!time) {
    return "--:--";
  }

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRepeatLabel(alarm) {
  if (alarm.snoozeUntil) {
    return "Snoozed";
  }

  if (alarm.repeat === "once") {
    return alarm.date
      ? new Date(
          `${alarm.date}T00:00:00`
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })
      : "Once";
  }

  if (alarm.repeat === "daily") {
    return "Every day";
  }

  if (alarm.repeat === "weekdays") {
    return "Weekdays";
  }

  if (alarm.repeat === "weekends") {
    return "Weekends";
  }

  if (alarm.repeat === "custom") {
    return `${alarm.days?.length || 0} days`;
  }

  return "Custom";
}

export default function Alarm() {
  const [alarms, setAlarms] = useState([]);
  const [formData, setFormData] = useState(
    createInitialForm
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeAlarm, setActiveAlarm] =
    useState(null);

  useEffect(() => {
    loadAlarms();

    const removeAlarmListener =
      window.electronAPI?.onAlarmFired?.(
        (alarm) => {
          setActiveAlarm(alarm);
          playAlarmSound();
        }
      );

    return () => {
      removeAlarmListener?.();
    };
  }, []);

  const enabledCount = useMemo(
    () =>
      alarms.filter((alarm) => alarm.enabled)
        .length,
    [alarms]
  );

  const nextAlarm = useMemo(() => {
    const enabled = alarms
      .filter((alarm) => alarm.enabled)
      .sort((first, second) =>
        first.time.localeCompare(second.time)
      );

    return enabled[0] || null;
  }, [alarms]);

  async function loadAlarms() {
    try {
      setLoading(true);
      setError("");

      if (window.electronAPI?.getAlarms) {
        const data =
          await window.electronAPI.getAlarms();

        setAlarms(
          Array.isArray(data) ? data : []
        );

        return;
      }

      const stored = JSON.parse(
        localStorage.getItem("neko-alarms") ||
          "[]"
      );

      setAlarms(
        Array.isArray(stored) ? stored : []
      );
    } catch (loadError) {
      console.error(loadError);
      setError("Could not load your alarms.");
    } finally {
      setLoading(false);
    }
  }

  function updateForm(name, value) {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function toggleCustomDay(day) {
    setFormData((current) => {
      const selected =
        current.days.includes(day);

      return {
        ...current,
        days: selected
          ? current.days.filter(
              (item) => item !== day
            )
          : [...current.days, day],
      };
    });
  }

  function applyPreset(preset) {
    setFormData((current) => ({
      ...current,
      label: preset.label,
      time: preset.time,
      repeat: preset.repeat,
      days:
        preset.repeat === "weekdays"
          ? [1, 2, 3, 4, 5]
          : current.days,
    }));
  }

  async function saveAlarm(event) {
    event.preventDefault();

    const cleanLabel =
      formData.label.trim();

    if (!cleanLabel) {
      setError(
        "Give this alarm a name first."
      );
      return;
    }

    if (!formData.time) {
      setError("Select an alarm time.");
      return;
    }

    if (
      formData.repeat === "custom" &&
      formData.days.length === 0
    ) {
      setError(
        "Choose at least one repeat day."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const alarm = {
        id: crypto.randomUUID(),
        ...formData,
        label: cleanLabel,
        createdAt: new Date().toISOString(),
        snoozeUntil: null,
        lastTriggeredKey: null,
      };

      let updatedAlarms;

      if (window.electronAPI?.saveAlarm) {
        updatedAlarms =
          await window.electronAPI.saveAlarm(
            alarm
          );
      } else {
        updatedAlarms = [...alarms, alarm];

        localStorage.setItem(
          "neko-alarms",
          JSON.stringify(updatedAlarms)
        );
      }

      setAlarms(updatedAlarms);
      setFormData(createInitialForm());

      setSuccess(
        "Alarm created. Neko is officially on duty."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (saveError) {
      console.error(saveError);
      setError("Alarm could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAlarm(alarm) {
    try {
      let updatedAlarms;

      if (window.electronAPI?.toggleAlarm) {
        updatedAlarms =
          await window.electronAPI.toggleAlarm(
            alarm.id,
            !alarm.enabled
          );
      } else {
        updatedAlarms = alarms.map((item) =>
          item.id === alarm.id
            ? {
                ...item,
                enabled: !item.enabled,
              }
            : item
        );

        localStorage.setItem(
          "neko-alarms",
          JSON.stringify(updatedAlarms)
        );
      }

      setAlarms(updatedAlarms);
    } catch (toggleError) {
      console.error(toggleError);
      setError(
        "Could not update this alarm."
      );
    }
  }

  async function deleteAlarm(alarm) {
    const confirmed = window.confirm(
      `Delete "${alarm.label}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      let updatedAlarms;

      if (window.electronAPI?.deleteAlarm) {
        updatedAlarms =
          await window.electronAPI.deleteAlarm(
            alarm.id
          );
      } else {
        updatedAlarms = alarms.filter(
          (item) => item.id !== alarm.id
        );

        localStorage.setItem(
          "neko-alarms",
          JSON.stringify(updatedAlarms)
        );
      }

      setAlarms(updatedAlarms);
    } catch (deleteError) {
      console.error(deleteError);
      setError("Could not delete this alarm.");
    }
  }

  async function snoozeAlarm(minutes) {
    if (!activeAlarm) {
      return;
    }

    try {
      if (window.electronAPI?.snoozeAlarm) {
        const updated =
          await window.electronAPI.snoozeAlarm(
            activeAlarm.id,
            minutes
          );

        setAlarms(updated);
      }

      setActiveAlarm(null);
    } catch (snoozeError) {
      console.error(snoozeError);
      setError("Could not snooze the alarm.");
    }
  }

  async function dismissAlarm() {
    if (!activeAlarm) {
      return;
    }

    try {
      if (window.electronAPI?.dismissAlarm) {
        const updated =
          await window.electronAPI.dismissAlarm(
            activeAlarm.id
          );

        setAlarms(updated);
      }

      setActiveAlarm(null);

      const currentXp = Number(
        localStorage.getItem("neko-xp") || 0
      );

      localStorage.setItem(
        "neko-xp",
        String(currentXp + 5)
      );

      setSuccess(
        "Alarm handled on time. +5 XP."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (dismissError) {
      console.error(dismissError);
      setError(
        "Could not dismiss the alarm."
      );
    }
  }

  function playAlarmSound() {
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

      [660, 880, 660, 990].forEach(
        (frequency, index) => {
          const oscillator =
            context.createOscillator();

          const start =
            context.currentTime +
            index * 0.18;

          oscillator.type = "square";
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
            0.09,
            start + 0.02
          );

          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            start + 0.14
          );

          oscillator.start(start);
          oscillator.stop(start + 0.15);
        }
      );
    } catch (soundError) {
      console.error(
        "Alarm sound failed:",
        soundError
      );
    }
  }

  return (
    <div className="alarm-page">
      <section className="alarm-hero">
        <div>
          <span className="alarm-eyebrow">
            NEKO TIME CONTROL
          </span>

          <h1>
            Future you called.
            <br />
            They said: set the alarm.
          </h1>

          <p>
            Create alarms for study sessions,
            hydration, sleep, deadlines and your
            main-character morning routine.
          </p>
        </div>

        <div className="alarm-hero-clock">
          <span>⏰</span>
          <small>Neko never forgets</small>
        </div>
      </section>

      <section className="alarm-summary-grid">
        <article>
          <span>Total alarms</span>
          <strong>{alarms.length}</strong>
          <small>Time traps created</small>
        </article>

        <article>
          <span>Active</span>
          <strong>{enabledCount}</strong>
          <small>Neko is watching</small>
        </article>

        <article>
          <span>Next up</span>
          <strong>
            {nextAlarm
              ? formatAlarmTime(nextAlarm.time)
              : "--:--"}
          </strong>
          <small>
            {nextAlarm?.label ||
              "Nothing scheduled"}
          </small>
        </article>
      </section>

      <section className="alarm-layout">
        <section className="alarm-create-card">
          <div className="alarm-section-heading">
            <span>CREATE A TIME TRAP</span>
            <h2>New alarm</h2>
          </div>

          <div className="alarm-presets">
            {alarmPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  applyPreset(preset)
                }
              >
                <span>{preset.icon}</span>

                <div>
                  <strong>{preset.label}</strong>
                  <small>
                    {formatAlarmTime(
                      preset.time
                    )}
                  </small>
                </div>
              </button>
            ))}
          </div>

          <form
            className="alarm-form"
            onSubmit={saveAlarm}
          >
            <label>
              <span>Alarm name</span>

              <input
                type="text"
                value={formData.label}
                onChange={(event) =>
                  updateForm(
                    "label",
                    event.target.value
                  )
                }
                placeholder="Example: DSA grind session"
                maxLength={80}
              />
            </label>

            <div className="alarm-form-row">
              <label>
                <span>Time</span>

                <input
                  type="time"
                  value={formData.time}
                  onChange={(event) =>
                    updateForm(
                      "time",
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Repeat</span>

                <select
                  value={formData.repeat}
                  onChange={(event) =>
                    updateForm(
                      "repeat",
                      event.target.value
                    )
                  }
                >
                  <option value="once">
                    Once
                  </option>

                  <option value="daily">
                    Every day
                  </option>

                  <option value="weekdays">
                    Weekdays
                  </option>

                  <option value="weekends">
                    Weekends
                  </option>

                  <option value="custom">
                    Custom days
                  </option>
                </select>
              </label>
            </div>

            {formData.repeat === "once" && (
              <label>
                <span>Date</span>

                <input
                  type="date"
                  min={getTodayInputValue()}
                  value={formData.date}
                  onChange={(event) =>
                    updateForm(
                      "date",
                      event.target.value
                    )
                  }
                />
              </label>
            )}

            {formData.repeat === "custom" && (
              <div className="alarm-day-picker">
                <span>Repeat on</span>

                <div>
                  {weekDays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      title={day.label}
                      className={
                        formData.days.includes(
                          day.value
                        )
                          ? "alarm-day-active"
                          : ""
                      }
                      onClick={() =>
                        toggleCustomDay(
                          day.value
                        )
                      }
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="alarm-error">
                {error}
              </div>
            )}

            {success && (
              <div className="alarm-success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="alarm-save-button"
              disabled={saving}
            >
              {saving
                ? "Setting alarm..."
                : "⏰ Set the alarm"}
            </button>
          </form>
        </section>

        <section className="alarm-list-card">
          <div className="alarm-section-heading">
            <span>YOUR TIME TRAPS</span>
            <h2>Scheduled alarms</h2>
          </div>

          {loading ? (
            <div className="alarm-empty">
              Loading alarms...
            </div>
          ) : alarms.length === 0 ? (
            <div className="alarm-empty">
              <span>😴</span>
              <h3>No alarms yet</h3>
              <p>
                Your future self is currently
                unsupervised.
              </p>
            </div>
          ) : (
            <div className="alarm-list">
              {alarms.map((alarm) => (
                <article
                  key={alarm.id}
                  className={
                    alarm.enabled
                      ? "alarm-item"
                      : "alarm-item alarm-disabled"
                  }
                >
                  <div className="alarm-item-time">
                    {formatAlarmTime(
                      alarm.time
                    )}
                  </div>

                  <div className="alarm-item-info">
                    <strong>{alarm.label}</strong>

                    <span>
                      {getRepeatLabel(alarm)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`alarm-toggle ${
                      alarm.enabled
                        ? "alarm-toggle-active"
                        : ""
                    }`}
                    onClick={() =>
                      toggleAlarm(alarm)
                    }
                    aria-label={
                      alarm.enabled
                        ? "Disable alarm"
                        : "Enable alarm"
                    }
                  >
                    <span />
                  </button>

                  <button
                    type="button"
                    className="alarm-delete-button"
                    onClick={() =>
                      deleteAlarm(alarm)
                    }
                  >
                    🗑
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {activeAlarm && (
        <div className="alarm-overlay">
          <div className="alarm-ringing-card">
            <div className="alarm-ringing-icon">
              ⏰
            </div>

            <span className="alarm-ringing-label">
              NEKO IS YELLING
            </span>

            <h2>{activeAlarm.label}</h2>

            <p>
              Rise and grind, bestie. This is
              literally what you asked for.
            </p>

            <div className="alarm-snooze-buttons">
              <button
                type="button"
                onClick={() =>
                  snoozeAlarm(5)
                }
              >
                Snooze 5m
              </button>

              <button
                type="button"
                onClick={() =>
                  snoozeAlarm(10)
                }
              >
                Snooze 10m
              </button>

              <button
                type="button"
                onClick={() =>
                  snoozeAlarm(15)
                }
              >
                Snooze 15m
              </button>
            </div>

            <button
              type="button"
              className="alarm-dismiss-button"
              onClick={dismissAlarm}
            >
              I’m awake — dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
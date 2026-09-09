import { useEffect, useMemo, useRef, useState } from "react";
import "./JournalPage.css";

const moods = [
  { emoji: "😊", label: "Happy", color: "#ffd166" },
  { emoji: "😌", label: "Calm", color: "#8bd3dd" },
  { emoji: "😐", label: "Okay", color: "#b8b8c8" },
  { emoji: "😔", label: "Sad", color: "#9b8cff" },
  { emoji: "😡", label: "Angry", color: "#ff6b7a" },
];

const initialEntries = [
  {
    id: 1,
    mood: "Calm",
    emoji: "😌",
    text: "Today I decided to slow down and focus on one thing at a time.",
    date: "Today",
    time: "10:42 AM",
  },
];

export default function JournalPage() {
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [activeMode, setActiveMode] = useState("write");
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [recordingError, setRecordingError] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("neko-journal-entries");

      if (stored) {
        setEntries(JSON.parse(stored));
      } else {
        setEntries(initialEntries);
      }
    } catch {
      setEntries(initialEntries);
    }
  }, []);

  // Cleanup microphone/camera when leaving the page
  useEffect(() => {
    return () => {
      stopMediaStream();

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
      }
    };
  }, [recordingUrl]);

  const today = new Date();

  const dateLabel = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return entries;
    }

    return entries.filter(
      (entry) =>
        entry.text.toLowerCase().includes(query) ||
        entry.mood.toLowerCase().includes(query)
    );
  }, [entries, search]);

  function saveEntry() {
    if (!text.trim()) return;

    const mood =
      moods.find((item) => item.label === selectedMood) || moods[0];

    const newEntry = {
      id: Date.now(),
      mood: mood.label,
      emoji: mood.emoji,
      text: text.trim(),
      date: "Today",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedEntries = [newEntry, ...entries];

    setEntries(updatedEntries);

    localStorage.setItem(
      "neko-journal-entries",
      JSON.stringify(updatedEntries)
    );

    setText("");
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2200);
  }

  function deleteEntry(id) {
    const updatedEntries = entries.filter((entry) => entry.id !== id);

    setEntries(updatedEntries);

    localStorage.setItem(
      "neko-journal-entries",
      JSON.stringify(updatedEntries)
    );
  }

  function stopMediaStream() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      mediaStreamRef.current = null;
    }
  }

  function getSupportedMimeType(mode) {
    if (!window.MediaRecorder) {
      return "";
    }

    const types =
      mode === "video"
        ? [
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm",
          ]
        : [
            "audio/webm;codecs=opus",
            "audio/webm",
          ];

    return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  async function startRecording() {
    try {
      setRecordingError("");

      // Remove previous recording
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
        setRecordingUrl("");
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setRecordingError(
          "Your browser does not support microphone/camera recording."
        );
        return;
      }

      if (!window.MediaRecorder) {
        setRecordingError(
          "Media recording is not supported by this browser."
        );
        return;
      }

      const isVideo = activeMode === "video";

      const stream = await navigator.mediaDevices.getUserMedia(
        isVideo
          ? {
              video: true,
              audio: true,
            }
          : {
              audio: true,
            }
      );

      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getSupportedMimeType(activeMode);

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blobType =
          activeMode === "video" ? "video/webm" : "audio/webm";

        const blob = new Blob(chunksRef.current, {
          type: blobType,
        });

        const url = URL.createObjectURL(blob);

        setRecordingUrl(url);
        setIsRecording(false);

        stopMediaStream();

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recorder.onerror = () => {
        setRecordingError(
          "Something went wrong while recording. Please try again."
        );

        setIsRecording(false);
        stopMediaStream();
      };

      recorder.start(250);

      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1);
      }, 1000);
    } catch (error) {
      console.error("Recording error:", error);

      setIsRecording(false);
      stopMediaStream();

      if (error?.name === "NotAllowedError") {
        setRecordingError(
          "Permission was denied. Please allow microphone/camera access in your browser."
        );
      } else if (error?.name === "NotFoundError") {
        setRecordingError(
          "No microphone or camera was found on this device."
        );
      } else {
        setRecordingError(
          "Unable to start recording. Please check your device permissions."
        );
      }
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  function clearRecording() {
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }

    setRecordingUrl("");
    setRecordingSeconds(0);
    setRecordingError("");
    chunksRef.current = [];
  }

  function switchMode(mode) {
    if (isRecording) {
      stopRecording();
    }

    clearRecording();
    setRecordingError("");
    setActiveMode(mode);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  return (
    <div className="journal-page">
      <div className="journal-background-glow journal-glow-one" />
      <div className="journal-background-glow journal-glow-two" />

      <div className="journal-container">
        {/* HEADER */}
        <header className="journal-header">
          <div className="journal-heading">
            <div className="journal-eyebrow">
              <span className="eyebrow-icon">✦</span>
              YOUR QUIET CORNER
            </div>

            <h1>Journal</h1>

            <p>
              A peaceful little space to tell Neko everything.
            </p>
          </div>

          <div className="journal-date-card">
            <span className="date-small">TODAY</span>
            <strong>{dateLabel}</strong>
            <span className="date-moon">☾</span>
          </div>
        </header>

        {/* TOP STATS */}
        <section className="journal-stats">
          <div className="journal-stat">
            <span className="journal-stat-icon">📖</span>

            <div>
              <strong>{entries.length}</strong>
              <span>Total reflections</span>
            </div>
          </div>

          <div className="journal-stat">
            <span className="journal-stat-icon">💭</span>

            <div>
              <strong>
                {entries.reduce(
                  (total, entry) => total + entry.text.length,
                  0
                )}
              </strong>

              <span>Words written</span>
            </div>
          </div>

          <div className="journal-stat">
            <span className="journal-stat-icon">🌱</span>

            <div>
              <strong>Today</strong>
              <span>Keep the streak alive</span>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="journal-grid">
          {/* EDITOR */}
          <section className="journal-editor-card">
            <div className="editor-top">
              <div>
                <span className="section-label">
                  TODAY'S REFLECTION
                </span>

                <h2>How are you feeling?</h2>

                <p>No pressure. Just be real.</p>
              </div>

              <div className="editor-heart">♥</div>
            </div>

            {/* MOODS */}
            <div className="mood-selector">
              {moods.map((mood) => (
                <button
                  key={mood.label}
                  type="button"
                  className={`mood-button ${
                    selectedMood === mood.label ? "selected" : ""
                  }`}
                  style={{
                    "--mood-color": mood.color,
                  }}
                  onClick={() => setSelectedMood(mood.label)}
                >
                  <span className="mood-emoji">
                    {mood.emoji}
                  </span>

                  <span>{mood.label}</span>
                </button>
              ))}
            </div>

            {/* MODE TABS */}
            <div className="journal-mode-tabs">
              <button
                type="button"
                className={activeMode === "write" ? "active" : ""}
                onClick={() => switchMode("write")}
              >
                <span>✎</span>
                Write
              </button>

              <button
                type="button"
                className={activeMode === "voice" ? "active" : ""}
                onClick={() => switchMode("voice")}
              >
                <span>🎙</span>
                Voice
              </button>

              <button
                type="button"
                className={activeMode === "video" ? "active" : ""}
                onClick={() => switchMode("video")}
              >
                <span>🎥</span>
                Video
              </button>
            </div>

            {/* WRITE MODE */}
            {activeMode === "write" && (
              <div className="journal-writing-area">
                <div className="writing-label">
                  <span>Dear Neko,</span>
                  <span>{text.length} / 2000</span>
                </div>

                <textarea
                  value={text}
                  maxLength={2000}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Tell me about your day... the good, the difficult, the little things, or simply whatever is on your mind."
                />

                <div className="writing-footer">
                  <span>
                    ✨ This space is yours. There is no wrong way
                    to write.
                  </span>

                  <button
                    type="button"
                    className="save-entry-button"
                    disabled={!text.trim()}
                    onClick={saveEntry}
                  >
                    {saved ? "✓ Saved" : "Save Entry"}
                  </button>
                </div>
              </div>
            )}

            {/* VOICE MODE */}
            {activeMode === "voice" && (
              <div className="mode-placeholder">
                <div className="mode-icon">🎙</div>

                <h3>Speak your thoughts</h3>

                <p>
                  Record your thoughts privately and listen to them
                  whenever you want.
                </p>

                {isRecording && (
                  <div
                    style={{
                      margin: "18px 0",
                      fontWeight: 700,
                      fontSize: "18px",
                    }}
                  >
                    🔴 Recording {formatTime(recordingSeconds)}
                  </div>
                )}

                {!isRecording && recordingUrl && (
                  <div
                    style={{
                      width: "100%",
                      marginTop: "20px",
                    }}
                  >
                    <audio
                      controls
                      src={recordingUrl}
                      style={{ width: "100%" }}
                    />

                    <button
                      type="button"
                      className="record-button"
                      onClick={clearRecording}
                      style={{ marginTop: "12px" }}
                    >
                      🗑 Clear Recording
                    </button>
                  </div>
                )}

                {recordingError && (
                  <p
                    style={{
                      color: "#ff7b8a",
                      fontWeight: 600,
                      marginTop: "15px",
                    }}
                  >
                    {recordingError}
                  </p>
                )}

                {!recordingUrl && (
                  <button
                    type="button"
                    className="record-button"
                    onClick={
                      isRecording
                        ? stopRecording
                        : startRecording
                    }
                  >
                    <span>{isRecording ? "■" : "●"}</span>

                    {isRecording
                      ? "Stop Recording"
                      : "Start Recording"}
                  </button>
                )}
              </div>
            )}

            {/* VIDEO MODE */}
            {activeMode === "video" && (
              <div className="mode-placeholder">
                <div className="mode-icon">🎥</div>

                <h3>Video reflection</h3>

                <p>
                  Record a private video reflection and keep your
                  memories close.
                </p>

                {isRecording && (
                  <div
                    style={{
                      margin: "18px 0",
                      fontWeight: 700,
                      fontSize: "18px",
                    }}
                  >
                    🔴 Recording {formatTime(recordingSeconds)}
                  </div>
                )}

                {!isRecording && recordingUrl && (
                  <div
                    style={{
                      width: "100%",
                      marginTop: "20px",
                    }}
                  >
                    <video
                      controls
                      src={recordingUrl}
                      style={{
                        width: "100%",
                        maxHeight: "360px",
                        borderRadius: "18px",
                      }}
                    />

                    <button
                      type="button"
                      className="record-button"
                      onClick={clearRecording}
                      style={{ marginTop: "12px" }}
                    >
                      🗑 Clear Video
                    </button>
                  </div>
                )}

                {recordingError && (
                  <p
                    style={{
                      color: "#ff7b8a",
                      fontWeight: 600,
                      marginTop: "15px",
                    }}
                  >
                    {recordingError}
                  </p>
                )}

                {!recordingUrl && (
                  <button
                    type="button"
                    className="record-button"
                    onClick={
                      isRecording
                        ? stopRecording
                        : startRecording
                    }
                  >
                    <span>{isRecording ? "■" : "●"}</span>

                    {isRecording
                      ? "Stop Recording"
                      : "Start Recording"}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* NEKO CARD */}
          <aside className="neko-journal-card">
            <div className="neko-card-stars">✦ ✧ ✦</div>

            <div className="neko-avatar">🐱</div>

            <span className="section-label">
              A LITTLE NOTE FROM NEKO
            </span>

            <h3>
              You don't have to
              <br />
              have it all figured out.
            </h3>

            <p>
              Some days are messy. Some days are wonderful. Both
              deserve a place here.
            </p>

            <div className="neko-card-divider" />

            <div className="neko-card-footer">
              <span>I'm listening.</span>
              <span>♡</span>
            </div>
          </aside>
        </div>

        {/* HISTORY */}
        <section className="journal-history">
          <div className="history-header">
            <div>
              <span className="section-label">YOUR JOURNAL</span>
              <h2>Previous reflections</h2>
            </div>

            <div className="history-search">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search reflections..."
              />
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="empty-journal">
              <div>🌙</div>

              <h3>No reflections yet</h3>

              <p>
                Your thoughts will appear here once you save your
                first entry.
              </p>
            </div>
          ) : (
            <div className="journal-entry-list">
              {filteredEntries.map((entry) => (
                <article
                  className="journal-entry"
                  key={entry.id}
                >
                  <div className="entry-mood">
                    <span>{entry.emoji}</span>
                  </div>

                  <div className="entry-content">
                    <div className="entry-meta">
                      <span className="entry-mood-name">
                        {entry.mood}
                      </span>

                      <span>•</span>

                      <span>{entry.date}</span>

                      <span>•</span>

                      <span>{entry.time}</span>
                    </div>

                    <p>{entry.text}</p>
                  </div>

                  <button
                    type="button"
                    className="delete-entry"
                    onClick={() => deleteEntry(entry.id)}
                    aria-label="Delete entry"
                  >
                    🗑
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="journal-footer">
          <span>🐱</span>

          <span>
            Your thoughts are safe here. Keep being kind to
            yourself.
          </span>

          <span>✦</span>
        </footer>
      </div>
    </div>
  );
}
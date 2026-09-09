import { useEffect, useRef, useState } from "react";
import {
  BookHeart,
  Camera,
  Check,
  CircleStop,
  FileText,
  Heart,
  Mic,
  Trash2,
  Video,
  X,
} from "lucide-react";

import "./JournalPage.css";

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😡", label: "Angry" },
];

const STORAGE_KEY = "neko-journal";

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("😊");
  const [entries, setEntries] = useState([]);
  const [mode, setMode] = useState("text");

  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const videoPreviewRef = useRef(null);
  const timerRef = useRef(null);

  /* --------------------------------
     LOAD SAVED JOURNAL ENTRIES
  -------------------------------- */

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      setEntries(Array.isArray(saved) ? saved : []);
    } catch (error) {
      console.error("Could not load journal:", error);
      setEntries([]);
    }
  }, []);

  /* --------------------------------
     SAVE ENTRIES
  -------------------------------- */

  function saveEntries(updatedEntries) {
    setEntries(updatedEntries);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedEntries)
    );
  }

  /* --------------------------------
     SAVE TEXT ENTRY
  -------------------------------- */

  function saveTextEntry() {
    if (!entry.trim()) return;

    const newEntry = {
      id: Date.now(),
      type: "text",
      mood,
      text: entry.trim(),
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    saveEntries([newEntry, ...entries]);
    setEntry("");
  }

  /* --------------------------------
     START AUDIO / VIDEO RECORDING
  -------------------------------- */

  async function startRecording(type) {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert(
          "Your browser does not support microphone/camera recording."
        );
        return;
      }

      const constraints =
        type === "video"
          ? {
              video: true,
              audio: true,
            }
          : {
              audio: true,
            };

      const stream =
        await navigator.mediaDevices.getUserMedia(
          constraints
        );

      mediaStreamRef.current = stream;
      recordingChunksRef.current = [];

      setRecordingType(type);
      setRecordingUrl("");
      setRecordingTime(0);
      setIsRecording(true);

      if (
        type === "video" &&
        videoPreviewRef.current
      ) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.muted = true;
        videoPreviewRef.current.play().catch(() => {});
      }

      let mimeType = "";

      if (type === "video") {
        if (
          MediaRecorder.isTypeSupported(
            "video/webm;codecs=vp9,opus"
          )
        ) {
          mimeType =
            "video/webm;codecs=vp9,opus";
        } else if (
          MediaRecorder.isTypeSupported("video/webm")
        ) {
          mimeType = "video/webm";
        }
      } else {
        if (
          MediaRecorder.isTypeSupported("audio/webm")
        ) {
          mimeType = "audio/webm";
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (
          event.data &&
          event.data.size > 0
        ) {
          recordingChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onerror = (event) => {
        console.error(
          "MediaRecorder error:",
          event
        );

        alert(
          "Something went wrong while recording."
        );
      };

      recorder.onstop = () => {
        const blob = new Blob(
          recordingChunksRef.current,
          {
            type:
              type === "video"
                ? "video/webm"
                : "audio/webm",
          }
        );

        const url = URL.createObjectURL(blob);

        setRecordingUrl(url);
        setIsRecording(false);

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }

        if (mediaStreamRef.current) {
          mediaStreamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          mediaStreamRef.current = null;
        }
      };

      recorder.start();

      timerRef.current = setInterval(() => {
        setRecordingTime(
          (previous) => previous + 1
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Recording error:",
        error
      );

      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        mediaStreamRef.current = null;
      }

      if (error.name === "NotAllowedError") {
        alert(
          "Microphone/camera permission was blocked. Please allow access to localhost and try again."
        );
      } else if (
        error.name === "NotFoundError"
      ) {
        alert(
          "No microphone or camera was found on this device."
        );
      } else if (
        error.name === "NotReadableError"
      ) {
        alert(
          "Your microphone or camera is already being used by another application."
        );
      } else {
        alert(
          "Could not start recording. Please check your microphone/camera."
        );
      }
    }
  }

  /* --------------------------------
     STOP RECORDING
  -------------------------------- */

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
        "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }

  /* --------------------------------
     CANCEL RECORDING
  -------------------------------- */

  function cancelRecording() {
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }

    setRecordingUrl("");
    setRecordingType(null);
    setRecordingTime(0);

    if (mediaStreamRef.current) {
      mediaStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      mediaStreamRef.current = null;
    }
  }

  /* --------------------------------
     SAVE AUDIO / VIDEO
  -------------------------------- */

  function saveMediaEntry() {
    if (!recordingUrl || !recordingType) {
      return;
    }

    const newEntry = {
      id: Date.now(),
      type: recordingType,
      mood,
      date: new Date().toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      ),
      mediaUrl: recordingUrl,
    };

    saveEntries([newEntry, ...entries]);

    setRecordingUrl("");
    setRecordingType(null);
    setRecordingTime(0);
  }

  /* --------------------------------
     DELETE ENTRY
  -------------------------------- */

  function deleteEntry(id) {
    const confirmed = window.confirm(
      "Delete this journal entry?"
    );

    if (!confirmed) return;

    const updated = entries.filter(
      (item) => item.id !== id
    );

    saveEntries(updated);
  }

  /* --------------------------------
     FORMAT TIMER
  -------------------------------- */

  function formatRecordingTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  }

  /* --------------------------------
     CLEANUP
  -------------------------------- */

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (mediaRecorderRef.current) {
        try {
          if (
            mediaRecorderRef.current.state !==
            "inactive"
          ) {
            mediaRecorderRef.current.stop();
          }
        } catch (error) {
          console.error(
            "Recorder cleanup error:",
            error
          );
        }
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  /* --------------------------------
     UI
  -------------------------------- */

  return (
    <div className="journal-page">

      {/* HEADER */}

      <header className="journal-header">
        <div>
          <div className="journal-kicker">
            <BookHeart size={16} />
            YOUR LITTLE CORNER
          </div>

          <h1>Journal</h1>

          <p>
            A quiet little space to tell Neko
            everything.
          </p>
        </div>

        <div className="journal-date">
          <span>Today</span>

          <strong>
            {new Date().toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "long",
              }
            )}
          </strong>
        </div>
      </header>

      {/* MAIN */}

      <div className="journal-layout">

        <main>

          {/* REFLECTION */}

          <section className="reflection-card">

            <div className="reflection-heading">
              <div>
                <span className="section-label">
                  TODAY'S REFLECTION
                </span>

                <h2>
                  How are you feeling?
                </h2>

                <p>
                  No pressure. Just be real.
                </p>
              </div>

              <div className="heart-decoration">
                <Heart
                  size={22}
                  fill="currentColor"
                />
              </div>
            </div>

            {/* MOODS */}

            <div className="mood-selector">
              {moods.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={
                    mood === item.emoji
                      ? "mood-button active"
                      : "mood-button"
                  }
                  onClick={() =>
                    setMood(item.emoji)
                  }
                >
                  <span>
                    {item.emoji}
                  </span>

                  <small>
                    {item.label}
                  </small>
                </button>
              ))}
            </div>

            {/* ENTRY TABS */}

            <div className="entry-tabs">

              <button
                type="button"
                className={
                  mode === "text"
                    ? "entry-tab active"
                    : "entry-tab"
                }
                onClick={() =>
                  setMode("text")
                }
              >
                <FileText size={17} />
                Write
              </button>

              <button
                type="button"
                className={
                  mode === "audio"
                    ? "entry-tab active"
                    : "entry-tab"
                }
                onClick={() =>
                  setMode("audio")
                }
              >
                <Mic size={17} />
                Voice
              </button>

              <button
                type="button"
                className={
                  mode === "video"
                    ? "entry-tab active"
                    : "entry-tab"
                }
                onClick={() =>
                  setMode("video")
                }
              >
                <Video size={17} />
                Video
              </button>

            </div>

            {/* TEXT MODE */}

            {mode === "text" && (
              <div className="text-editor">

                <div className="editor-label">
                  Dear Neko...
                </div>

                <textarea
                  value={entry}
                  onChange={(event) =>
                    setEntry(
                      event.target.value
                    )
                  }
                  placeholder="Tell me about your day... the good, the bad, the random thoughts, anything."
                />

                <div className="editor-bottom">

                  <span>
                    {entry.length} characters
                  </span>

                  <button
                    type="button"
                    onClick={saveTextEntry}
                    disabled={!entry.trim()}
                    className="save-entry"
                  >
                    Save Entry
                    <Check size={16} />
                  </button>

                </div>

              </div>
            )}

            {/* AUDIO MODE */}

            {mode === "audio" && (
              <div className="recorder-box">

                <div className="recorder-icon">
                  <Mic size={30} />
                </div>

                <h3>
                  {isRecording
                    ? "Neko is listening..."
                    : "Talk it out"}
                </h3>

                <p>
                  Sometimes saying it is
                  easier than writing it.
                </p>

                {!isRecording &&
                  !recordingUrl && (
                    <button
                      type="button"
                      className="record-button"
                      onClick={() =>
                        startRecording(
                          "audio"
                        )
                      }
                    >
                      <Mic size={18} />
                      Start recording
                    </button>
                  )}

                {isRecording &&
                  recordingType ===
                    "audio" && (
                    <div>
                      <div className="recording-time">
                        ●{" "}
                        {formatRecordingTime(
                          recordingTime
                        )}
                      </div>

                      <button
                        type="button"
                        className="stop-button"
                        onClick={
                          stopRecording
                        }
                      >
                        <CircleStop
                          size={18}
                        />
                        Stop recording
                      </button>
                    </div>
                  )}

                {!isRecording &&
                  recordingUrl &&
                  recordingType ===
                    "audio" && (
                    <div className="media-preview">

                      <audio
                        controls
                        src={recordingUrl}
                      />

                      <div className="preview-actions">

                        <button
                          type="button"
                          onClick={
                            saveMediaEntry
                          }
                          className="save-entry"
                        >
                          Save voice note
                          <Check size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelRecording
                          }
                          className="cancel-button"
                        >
                          <X size={16} />
                          Discard
                        </button>

                      </div>

                    </div>
                  )}

              </div>
            )}

            {/* VIDEO MODE */}

            {mode === "video" && (
              <div className="recorder-box">

                <div className="recorder-icon video-icon">
                  <Camera size={30} />
                </div>

                <h3>
                  {isRecording
                    ? "Neko is recording..."
                    : "Video journal"}
                </h3>

                <p>
                  Capture a little moment
                  from your day.
                </p>

                {/* LIVE CAMERA */}

                {isRecording &&
                  recordingType ===
                    "video" && (
                    <div className="live-video-container">

                      <video
                        ref={
                          videoPreviewRef
                        }
                        autoPlay
                        muted
                        playsInline
                        className="live-video"
                      />

                      <div className="recording-overlay">
                        <span className="recording-dot" />
                        RECORDING{" "}
                        {formatRecordingTime(
                          recordingTime
                        )}
                      </div>

                      <button
                        type="button"
                        className="stop-button"
                        onClick={
                          stopRecording
                        }
                      >
                        <CircleStop
                          size={18}
                        />
                        Stop video
                      </button>

                    </div>
                  )}

                {!isRecording &&
                  !recordingUrl && (
                    <button
                      type="button"
                      className="record-button"
                      onClick={() =>
                        startRecording(
                          "video"
                        )
                      }
                    >
                      <Camera size={18} />
                      Start video
                    </button>
                  )}

                {/* VIDEO PREVIEW */}

                {!isRecording &&
                  recordingUrl &&
                  recordingType ===
                    "video" && (
                    <div className="media-preview">

                      <video
                        controls
                        playsInline
                        src={recordingUrl}
                      />

                      <div className="preview-actions">

                        <button
                          type="button"
                          onClick={
                            saveMediaEntry
                          }
                          className="save-entry"
                        >
                          Save video
                          <Check size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelRecording
                          }
                          className="cancel-button"
                        >
                          <X size={16} />
                          Discard
                        </button>

                      </div>

                    </div>
                  )}

              </div>
            )}

          </section>

          {/* HISTORY */}

          <section className="history-section">

            <div className="history-heading">

              <div>
                <span className="section-label">
                  YOUR JOURNAL
                </span>

                <h2>
                  Previous reflections
                </h2>
              </div>

              <span className="saved-count">
                {entries.length} saved
              </span>

            </div>

            {entries.length === 0 ? (
              <div className="empty-history">

                <BookHeart size={32} />

                <h3>
                  Your story starts here.
                </h3>

                <p>
                  Save your first reflection
                  and it'll appear here.
                </p>

              </div>
            ) : (
              <div className="history-grid">

                {entries.map((item) => (
                  <article
                    className="history-card"
                    key={item.id}
                  >

                    <div className="history-top">

                      <span className="history-mood">
                        {item.mood}
                      </span>

                      <span className="history-date">
                        {item.date}
                      </span>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          deleteEntry(
                            item.id
                          )
                        }
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                    {item.type ===
                      "text" && (
                      <>
                        <span className="entry-type">
                          Written reflection
                        </span>

                        <p className="history-text">
                          {item.text}
                        </p>
                      </>
                    )}

                    {item.type ===
                      "audio" && (
                      <>
                        <span className="entry-type">
                          Voice journal
                        </span>

                        {item.mediaUrl ? (
                          <audio
                            controls
                            src={
                              item.mediaUrl
                            }
                          />
                        ) : (
                          <div className="media-unavailable">
                            Audio unavailable
                            after reload.
                          </div>
                        )}
                      </>
                    )}

                    {item.type ===
                      "video" && (
                      <>
                        <span className="entry-type">
                          Video journal
                        </span>

                        {item.mediaUrl ? (
                          <video
                            controls
                            src={
                              item.mediaUrl
                            }
                          />
                        ) : (
                          <div className="media-unavailable">
                            Video unavailable
                            after reload.
                          </div>
                        )}
                      </>
                    )}

                  </article>
                ))}

              </div>
            )}

          </section>

        </main>

        {/* SIDEBAR */}

        <aside className="journal-sidebar">

          <div className="neko-note">

            <div className="neko-avatar">
              🐱
            </div>

            <span className="section-label">
              NEKO'S NOTE
            </span>

            <h2>
              You don't have to have it all
              figured out.
            </h2>

            <p>
              Your journal isn't about being
              productive. It's just a place
              where you can be completely
              yourself.
            </p>

            <div className="note-line" />

            <small>
              I'm listening. ♡
            </small>

          </div>

          <div className="journal-tip">

            <span>✨</span>

            <div>
              <strong>
                Tiny reminder
              </strong>

              <p>
                You showed up today.
                That counts.
              </p>
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}
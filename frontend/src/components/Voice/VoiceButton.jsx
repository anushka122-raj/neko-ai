import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import "./VoiceButton.css";

export default function VoiceButton({
  onResult,
  onStart,
  onEnd,
}) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return (
      <button className="voice-button" disabled>
        Voice Not Supported
      </button>
    );
  }

  function startListening() {
    resetTranscript();

    if (onStart) {
      onStart();
    }

    SpeechRecognition.startListening({
      continuous: false,
      language: "en-US",
    });
  }

  function stopListening() {
    SpeechRecognition.stopListening();

    if (onEnd) {
      onEnd();
    }

    const text = transcript.trim();

    if (text && onResult) {
      onResult(text);
    }

    resetTranscript();
  }

  return (
    <button
      className="voice-button"
      onMouseDown={startListening}
      onMouseUp={stopListening}
      onMouseLeave={() => {
        if (listening) stopListening();
      }}
      onTouchStart={startListening}
      onTouchEnd={stopListening}
    >
      {listening ? "🎙️ Listening..." : "🎤 Speak"}
    </button>
  );
}
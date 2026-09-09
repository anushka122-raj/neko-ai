import { useState } from "react";
import "./ChatInput.css";
import VoiceButton from "../Voice/VoiceButton";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

  function handleSend() {
    const message = text.trim();

    if (!message) return;

    onSend(message);
    setText("");
  }

  function handleVoiceResult(speechText) {
    const message = speechText.trim();

    if (!message) return;

    setText(message);

    // Automatically send the voice message
    onSend(message);

    // Clear input after sending
    setText("");
  }

  return (
    <div className="chat-input">
      <textarea
        rows={2}
        value={text}
        placeholder={
          isListening
            ? "🎤 Listening..."
            : "Ask Neko anything..."
        }
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      <div className="chat-actions">
        <VoiceButton
          onStart={() => setIsListening(true)}
          onEnd={() => setIsListening(false)}
          onResult={handleVoiceResult}
        />

        <button
          className="send-btn"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
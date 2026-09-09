import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ChatHistory, {
  getDateKey,
} from "./ChatHistory";

import "./Chat.css";

const API_URL = "http://127.0.0.1:8000";

export default function Chat() {
  const [allMessages, setAllMessages] = useState([]);
  const [currentMessages, setCurrentMessages] =
    useState([]);

  const [message, setMessage] = useState("");
  const [historyOpen, setHistoryOpen] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState("Today");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [speakingMessageId, setSpeakingMessageId] =
    useState(null);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadHistory();

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [currentMessages, sending]);

  async function loadHistory() {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/chat/history`
      );

      if (!response.ok) {
        throw new Error(
          "Could not load chat history."
        );
      }

      const data = await response.json();

      const history = Array.isArray(data)
        ? data
        : [];

      setAllMessages(history);

      const todayMessages = history.filter(
        (item) =>
          getDateKey(item.created_at) === "Today"
      );

      setCurrentMessages(todayMessages);
    } catch (error) {
      console.error("History error:", error);
      setError(error.message);
    }
  }

  const visibleMessages = useMemo(
    () => currentMessages,
    [currentMessages]
  );

  function openHistory() {
    setHistoryOpen(true);
  }

  function closeHistory() {
    setHistoryOpen(false);
  }

  function selectHistoryDate(date) {
    const filteredMessages = allMessages.filter(
      (item) =>
        getDateKey(item.created_at) === date
    );

    setSelectedDate(date);
    setCurrentMessages(filteredMessages);
    closeHistory();
  }

  function startNewChat() {
    window.speechSynthesis?.cancel();

    setSpeakingMessageId(null);
    setCurrentMessages([]);
    setSelectedDate("New Chat");
    setMessage("");
    setError("");

    closeHistory();
  }

  function startVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    setError("");

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        transcript +=
          event.results[index][0].transcript;
      }

      setMessage(transcript.trim());
    };

    recognition.onerror = (event) => {
      console.error(
        "Voice recognition error:",
        event.error
      );

      if (event.error !== "aborted") {
        setError(
          `Microphone error: ${event.error}`
        );
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  }

  function speakMessage(item) {
    if (!window.speechSynthesis) {
      setError(
        "Voice playback is not supported in this browser."
      );
      return;
    }

    if (speakingMessageId === item.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
      item.content
    );

    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;

    speech.onstart = () => {
      setSpeakingMessageId(item.id);
    };

    speech.onend = () => {
      setSpeakingMessageId(null);
    };

    speech.onerror = () => {
      setSpeakingMessageId(null);
      setError("Could not play this response.");
    };

    window.speechSynthesis.speak(speech);
  }

  async function sendMessage(event) {
    event?.preventDefault();

    const text = message.trim();

    if (!text || sending) {
      return;
    }

    recognitionRef.current?.stop();

    const temporaryUserMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setCurrentMessages((current) => [
      ...current,
      temporaryUserMessage,
    ]);

    setMessage("");
    setSending(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/chat/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.error ||
            data.detail ||
            "Neko could not respond."
        );
      }

      const aiMessage = data.ai_message || {
        id: `neko-${Date.now()}`,
        role: "neko",
        content: data.reply,
        created_at: new Date().toISOString(),
      };

      setCurrentMessages((current) => [
        ...current,
        aiMessage,
      ]);

      setAllMessages((current) => [
        ...current,
        data.user_message || temporaryUserMessage,
        aiMessage,
      ]);

      setSelectedDate("Today");
    } catch (error) {
      console.error("Chat error:", error);

      setError(error.message);

      setCurrentMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "neko",
          content:
            "Sorry... I couldn't reach my AI brain right now 🐱 Please try again.",
          created_at: new Date().toISOString(),
          failed: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-page">
      <ChatHistory
        messages={allMessages}
        isOpen={historyOpen}
        onClose={closeHistory}
        onSelectDate={selectHistoryDate}
        onNewChat={startNewChat}
        selectedDate={selectedDate}
      />

      <header className="chat-page-header">
        <div>
          <p className="chat-section-label">
            NEKOAI CHAT
          </p>

          <h1>
            {selectedDate === "New Chat"
              ? "New conversation"
              : selectedDate}
          </h1>
        </div>

        <div className="chat-header-actions">
          <button
            type="button"
            className="chat-new-button"
            onClick={startNewChat}
          >
            ＋ New
          </button>

          <button
            type="button"
            className="history-button"
            onClick={openHistory}
          >
            🕘 History
          </button>
        </div>
      </header>

      <section className="chat-messages">
        {visibleMessages.length === 0 ? (
          <div className="empty-chat-state">
            <div className="empty-chat-icon">
              🐱
            </div>

            <h2>Start a conversation</h2>

            <p>
              Ask Neko anything, plan your day or
              discuss your tasks.
            </p>
          </div>
        ) : (
          visibleMessages.map((item) => (
            <div
              key={item.id}
              className={`message-row ${
                item.role === "user"
                  ? "message-row-user"
                  : "message-row-neko"
              }`}
            >
              {item.role !== "user" && (
                <div className="message-avatar">
                  🐱
                </div>
              )}

              <div
                className={`message-bubble ${
                  item.role === "user"
                    ? "user-message"
                    : "neko-message"
                } ${
                  item.failed
                    ? "failed-message"
                    : ""
                }`}
              >
                <p>{item.content}</p>

                <div className="message-footer">
                  {item.created_at && (
                    <span className="message-time">
                      {new Date(
                        item.created_at
                      ).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  )}

                  {item.role !== "user" &&
                    !item.failed && (
                      <button
                        type="button"
                        className="message-speak-button"
                        onClick={() =>
                          speakMessage(item)
                        }
                        title={
                          speakingMessageId ===
                          item.id
                            ? "Stop speaking"
                            : "Read response aloud"
                        }
                        aria-label={
                          speakingMessageId ===
                          item.id
                            ? "Stop speaking"
                            : "Read response aloud"
                        }
                      >
                        {speakingMessageId ===
                        item.id
                          ? "⏹️"
                          : "🔊"}
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="message-row message-row-neko">
            <div className="message-avatar">
              🐱
            </div>

            <div className="message-bubble neko-message typing-message">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </section>

      {error && (
        <div className="chat-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            ✕
          </button>
        </div>
      )}

      <form
        className="chat-input-container"
        onSubmit={sendMessage}
      >
        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? "Listening..."
              : "Message NekoAI..."
          }
          rows={1}
          disabled={sending}
        />

        <button
          type="button"
          className={`chat-mic-button ${
            isListening
              ? "chat-mic-listening"
              : ""
          }`}
          onClick={startVoiceInput}
          disabled={sending}
          title={
            isListening
              ? "Stop listening"
              : "Speak your message"
          }
          aria-label={
            isListening
              ? "Stop listening"
              : "Speak your message"
          }
        >
          {isListening ? "⏹️" : "🎙️"}
        </button>

        <button
          type="submit"
          className="chat-send-button"
          disabled={!message.trim() || sending}
          aria-label="Send message"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
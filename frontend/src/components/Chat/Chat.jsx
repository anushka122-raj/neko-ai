import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import "./Chat.css";
import { sendMessage as sendAPI } from "../../api";
import { speak } from "../../utils/speech";

export default function Chat() {
  const [messages, setMessages] = useState([]);

  // ✅ Ref for auto-scroll
  const chatEndRef = useRef(null);

  // ✅ Auto-scroll effect
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("http://127.0.0.1:8000/chat/history");
        if (!response.ok) return;
        const history = await response.json();
        setMessages(history.map((item) => ({ sender: item.role, message: item.content })));
      } catch {
        // No canned greeting is shown if the service is unavailable.
      }
    }
    loadHistory();
  }, []);

  async function sendMessage(text) {
    setMessages((prev) => [
      ...prev,
      { sender: "user", message: text },
      { sender: "neko", message: "Thinking..." },
    ]);

    try {
      const result = await sendAPI(text);

      setMessages((prev) => {
        const copy = [...prev];
        copy.pop(); // remove "Thinking..."
        copy.push({ sender: "neko", message: result.reply });
        return copy;
      });

      // ✅ Make Neko speak the reply
      speak(result.reply);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unable to get an AI response.";
      setMessages((prev) => {
        const copy = [...prev];
        copy.pop();
        copy.push({
          sender: "neko",
          message: detail,
        });
        return copy;
      });
    }
  }

  return (
    <div className="chat-container">
      {messages.map((msg, index) => (
        <ChatMessage key={index} sender={msg.sender} message={msg.message} />
      ))}
      {/* ✅ Auto-scroll anchor */}
      <div ref={chatEndRef} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
}

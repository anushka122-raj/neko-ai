function getDateKey(createdAt) {
  if (!createdAt) {
    return "Older";
  }

  const messageDate = new Date(createdAt);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const messageKey = messageDate.toDateString();

  if (messageKey === today.toDateString()) {
    return "Today";
  }

  if (messageKey === yesterday.toDateString()) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function createConversationPreview(messages) {
  const userMessage = messages.find(
    (message) => message.role === "user"
  );

  if (!userMessage) {
    return "NekoAI conversation";
  }

  const text = userMessage.content || "";

  return text.length > 40
    ? `${text.slice(0, 40)}...`
    : text;
}

export default function ChatHistory({
  messages,
  isOpen,
  onClose,
  onSelectDate,
  onNewChat,
  selectedDate,
}) {
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const dateKey = getDateKey(message.created_at);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(message);

      return groups;
    },
    {}
  );

  return (
    <>
      {isOpen && (
        <div
          className="history-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`chat-history-panel ${
          isOpen ? "chat-history-open" : ""
        }`}
      >
        <div className="history-header">
          <div>
            <p className="history-label">
              NEKOAI
            </p>

            <h2>Chat history</h2>
          </div>

          <button
            type="button"
            className="history-close-button"
            onClick={onClose}
            aria-label="Close chat history"
          >
            ✕
          </button>
        </div>

        <button
          type="button"
          className="new-chat-button"
          onClick={onNewChat}
        >
          ＋ New chat
        </button>

        <div className="history-list">
          {Object.keys(groupedMessages).length === 0 ? (
            <p className="empty-history">
              No previous chats found.
            </p>
          ) : (
            Object.entries(groupedMessages)
              .reverse()
              .map(([date, dateMessages]) => (
                <div
                  className="history-group"
                  key={date}
                >
                  <h3>{date}</h3>

                  <button
                    type="button"
                    className={`history-item ${
                      selectedDate === date
                        ? "history-item-active"
                        : ""
                    }`}
                    onClick={() =>
                      onSelectDate(date)
                    }
                  >
                    <span className="history-chat-icon">
                      💬
                    </span>

                    <span className="history-item-content">
                      <strong>
                        {createConversationPreview(
                          dateMessages
                        )}
                      </strong>

                      <small>
                        {dateMessages.length} messages
                      </small>
                    </span>
                  </button>
                </div>
              ))
          )}
        </div>
      </aside>
    </>
  );
}

export { getDateKey };
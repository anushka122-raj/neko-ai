const API_BASE_URL = "http://127.0.0.1:8000";

async function readResponse(response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return {
    detail: text || "The server returned an unexpected response.",
  };
}

// Chat API
export async function sendMessage(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    throw new Error("Please enter a message.");
  }

  const response = await fetch(
    `${API_BASE_URL}/chat/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: cleanText,
      }),
    }
  );

  const payload = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      payload.detail ||
        payload.error ||
        "Unable to get an AI response."
    );
  }

  if (!payload.reply) {
    throw new Error(
      "The AI response did not contain a reply."
    );
  }

  return payload;
}

// Memory APIs
export async function getMemories() {
  const response = await fetch(
    `${API_BASE_URL}/memories/`
  );

  const payload = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      payload.detail || "Failed to fetch memories."
    );
  }

  return Array.isArray(payload) ? payload : [];
}

export async function createMemory(memory) {
  const response = await fetch(
    `${API_BASE_URL}/memories/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memory),
    }
  );

  const payload = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      payload.detail || "Failed to create memory."
    );
  }

  return payload;
}

export async function deleteMemory(id) {
  const response = await fetch(
    `${API_BASE_URL}/memories/${id}`,
    {
      method: "DELETE",
    }
  );

  const payload = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      payload.detail || "Failed to delete memory."
    );
  }

  return payload;
}
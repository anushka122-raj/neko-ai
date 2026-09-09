const API_BASE_URL = "http://127.0.0.1:8000";

async function readResponse(response) {
  const contentType =
    response.headers.get("content-type");

  let payload;

  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    payload = await response.json();
  } else {
    const text = await response.text();

    payload = {
      detail:
        text ||
        "The server returned an unexpected response.",
    };
  }

  if (!response.ok) {
    let message =
      payload.detail ||
      payload.message ||
      "Habit request failed.";

    if (Array.isArray(payload.detail)) {
      message = payload.detail
        .map((item) => item.msg)
        .join(", ");
    }

    throw new Error(message);
  }

  return payload;
}

export async function getHabits() {
  const response = await fetch(
    `${API_BASE_URL}/habit/`
  );

  return readResponse(response);
}

export async function getHabitDashboard() {
  const response = await fetch(
    `${API_BASE_URL}/habit/dashboard`
  );

  return readResponse(response);
}

export async function createHabit(
  habitData
) {
  const response = await fetch(
    `${API_BASE_URL}/habit/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(habitData),
    }
  );

  return readResponse(response);
}

export async function updateHabit(
  habitId,
  habitData
) {
  const response = await fetch(
    `${API_BASE_URL}/habit/${habitId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(habitData),
    }
  );

  return readResponse(response);
}

export async function deleteHabit(
  habitId
) {
  const response = await fetch(
    `${API_BASE_URL}/habit/${habitId}`,
    {
      method: "DELETE",
    }
  );

  return readResponse(response);
}

export async function completeHabit(
  habitId,
  count = 1
) {
  const response = await fetch(
    `${API_BASE_URL}/habit/${habitId}/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        count,
      }),
    }
  );

  return readResponse(response);
}

export async function undoHabitCompletion(
  habitId
) {
  const response = await fetch(
    `${API_BASE_URL}/habit/${habitId}/complete`,
    {
      method: "DELETE",
    }
  );

  return readResponse(response);
}
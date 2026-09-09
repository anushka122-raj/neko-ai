const API_BASE_URL = "http://127.0.0.1:8000";

async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = "Something went wrong while processing the task.";

    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => item.msg)
        .join(", ");
    } else if (data?.message) {
      message = data.message;
    }

    throw new Error(message);
  }

  return data;
}

export async function getTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks/`);

  return handleResponse(response);
}

export async function createTask(taskData) {
  const response = await fetch(`${API_BASE_URL}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  return handleResponse(response);
}

export async function updateTask(taskId, taskData) {
  const response = await fetch(
    `${API_BASE_URL}/tasks/${taskId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    }
  );

  return handleResponse(response);
}

export async function completeTask(taskId) {
  const response = await fetch(
    `${API_BASE_URL}/tasks/${taskId}/complete`,
    {
      method: "PATCH",
    }
  );

  return handleResponse(response);
}

export async function deleteTask(taskId) {
  const response = await fetch(
    `${API_BASE_URL}/tasks/${taskId}`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(response);
}
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import MemoryForm from "./MemoryForm.jsx";
import MemoryList from "./MemoryList.jsx";
import MemorySearch from "./MemorySearch.jsx";

const MEMORIES_URL = "http://127.0.0.1:8000/memories/";

export default function MemoryPageComponent() {
  const [memories, setMemories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get(MEMORIES_URL, {
        signal: controller.signal,
      })
      .then((response) => {
        setMemories(
          Array.isArray(response.data)
            ? response.data
            : []
        );

        setError("");
      })
      .catch((requestError) => {
        if (
          requestError.name === "CanceledError" ||
          requestError.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error(
          "Failed to load memories:",
          requestError
        );

        setError(
          "Neko could not load your memories."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const filteredMemories = useMemo(() => {
    const keyword = searchText
      .trim()
      .toLowerCase();

    if (!keyword) {
      return memories;
    }

    return memories.filter((memory) => {
      const title = String(
        memory.title ?? ""
      ).toLowerCase();

      const content = String(
        memory.content ?? ""
      ).toLowerCase();

      const category = String(
        memory.category ?? ""
      ).toLowerCase();

      return (
        title.includes(keyword) ||
        content.includes(keyword) ||
        category.includes(keyword)
      );
    });
  }, [memories, searchText]);

  async function addMemory(memoryData) {
    try {
      const response = await axios.post(
        MEMORIES_URL,
        memoryData
      );

      setMemories((currentMemories) => [
        response.data,
        ...currentMemories,
      ]);

      setError("");
    } catch (requestError) {
      console.error(
        "Failed to save memory:",
        requestError
      );

      throw new Error(
        "Neko could not save this memory.",
        {
          cause: requestError,
        }
      );
    }
  }

  async function deleteMemory(memoryId) {
    try {
      await axios.delete(
        `${MEMORIES_URL}${memoryId}`
      );

      setMemories((currentMemories) =>
        currentMemories.filter(
          (memory) => memory.id !== memoryId
        )
      );

      setError("");
    } catch (requestError) {
      console.error(
        "Failed to delete memory:",
        requestError
      );

      setError(
        "Neko could not delete this memory."
      );
    }
  }

  return (
    <section className="memory-page">
      <header className="memory-page-header">
        <h1>🧠 Memory</h1>

        <p>
          Save goals, preferences, study details,
          and anything Neko should remember.
        </p>
      </header>

      <MemoryForm onSave={addMemory} />

      <MemorySearch onSearch={setSearchText} />

      {error && (
        <p className="memory-page-error">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="memory-loading">
          <p>Neko is loading your memories... 🐱</p>
        </div>
      ) : (
        <MemoryList
          memories={filteredMemories}
          onDelete={deleteMemory}
        />
      )}
    </section>
  );
}
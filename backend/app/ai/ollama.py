"""
Ollama Local AI Backend

Currently optional.

Future purpose:
- Offline AI
- Local LLM support
- Privacy mode
- No internet required

Supported models:
- llama3
- mistral
- phi3
- deepseek
- qwen

"""

import os
import requests

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434/api/generate"
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "llama3"
)


def ask_ollama(prompt: str) -> str:
    """
    Generate a response using a local Ollama model.
    Returns None if Ollama is unavailable.
    """

    try:

        response = requests.post(

            OLLAMA_URL,

            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },

            timeout=60

        )

        response.raise_for_status()

        data = response.json()

        return data.get("response", "").strip()

    except Exception:

        return None
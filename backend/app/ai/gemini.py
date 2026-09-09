import os

from google import genai

from app.config.settings import GEMINI_API_KEY
from app.ai.prompts import SYSTEM_PROMPT


MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

client = genai.Client(api_key=GEMINI_API_KEY)


def ask_gemini(
    user_message: str,
    memory: str = "",
    tasks: str = "",
    habits: str = "",
    schedule: str = "",
    emotion: str = "happy"
):
    """
    Main Gemini interface for NekoAI.

    Everything the AI should know about the user
    is injected into the prompt here.
    """

    prompt = f"""
{SYSTEM_PROMPT}

==============================
CURRENT NEKO STATE
==============================

Current Emotion:
{emotion}

==============================
USER MEMORIES
==============================

{memory}

==============================
TODAY'S TASKS
==============================

{tasks}

==============================
TODAY'S HABITS
==============================

{habits}

==============================
TODAY'S SCHEDULE
==============================

{schedule}

==============================
USER MESSAGE
==============================

{user_message}

==============================
NEKO RESPONSE
==============================

Reply like Neko.

Keep responses:
- friendly
- warm
- motivational
- personal
- concise
- natural

Never mention you are ChatGPT.

Never say "As an AI language model".

Never break character.

Speak like the user's companion.
"""

    try:

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )

        if response.text:
            return response.text.strip()

        return "I'm thinking... could you ask me that again? 🐱"

    except Exception as e:
        print("Gemini Error:", e)

        return (
            "Sorry... I couldn't connect to my AI brain right now. "
            "Let's try again in a moment. 🐾"
        )
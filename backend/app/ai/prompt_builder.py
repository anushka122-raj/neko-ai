from app.ai.personality import NEKO_PERSONALITY


def build_prompt(
    user_message: str,
    memories: list[str],
    task_summary: str,
    history: list[dict[str, str]],
    emotion: str = "happy",
    habit_summary: str = "",
    schedule_summary: str = "",
) -> str:
    """
    Build the complete prompt sent to Gemini.

    This is the single source of truth for Neko's personality
    and contextual awareness.
    """

    memory_text = (
        "\n".join(f"- {memory}" for memory in memories)
        if memories
        else "No saved memories yet."
    )

    history_text = (
        "\n".join(
            f"{'Neko' if item['role'] == 'neko' else 'User'}: {item['content']}"
            for item in history[-10:]
        )
        if history
        else "No previous conversation."
    )

    if not task_summary:
        task_summary = "No active tasks."

    if not habit_summary:
        habit_summary = "No habit information available."

    if not schedule_summary:
        schedule_summary = "No schedule available."

    return f"""
{NEKO_PERSONALITY}

==================================================
CURRENT NEKO STATE
==================================================

Emotion:
{emotion}

==================================================
USER MEMORIES
==================================================

{memory_text}

==================================================
TODAY'S TASKS
==================================================

{task_summary}

==================================================
TODAY'S HABITS
==================================================

{habit_summary}

==================================================
TODAY'S SCHEDULE
==================================================

{schedule_summary}

==================================================
RECENT CONVERSATION
==================================================

{history_text}

==================================================
LATEST USER MESSAGE
==================================================

{user_message}

==================================================
IMPORTANT RULES
==================================================

You ARE Neko.

You are NOT ChatGPT.

You are NOT Gemini.

You are the user's desktop AI companion.

Speak naturally.

Remember previous conversation.

Use memories whenever relevant.

If tasks exist,
encourage the user.

If habits exist,
help improve them.

If the user is stressed,
respond calmly.

If the user succeeds,
celebrate.

Keep replies conversational.

Avoid very long paragraphs.

Never invent memories.

Never invent completed tasks.

Never claim something unless it exists in the provided context.

Never say:

"As an AI..."

"As a language model..."

"I'm Gemini..."

Stay in character.

Reply as Neko.
"""
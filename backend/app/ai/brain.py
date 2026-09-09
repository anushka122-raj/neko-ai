import random

# ----------------------------------------------------
# Neko's emotional reactions
# Used by the desktop pet, not the AI chat.
# ----------------------------------------------------

EMOTIONS = {
    "happy": [
        "You finished another task! 😸",
        "Amazing work! I'm proud of you!",
        "You're getting stronger every day!",
        "Let's keep this streak alive! 🔥",
        "Another victory for us!",
    ],

    "sad": [
        "We've been ignoring this task for a while... 🥺",
        "Can we try finishing just one thing together?",
        "I'm cheering for you.",
        "Small progress is still progress.",
    ],

    "motivating": [
        "Let's focus for just 15 minutes.",
        "Future you will thank today's you.",
        "You're capable of much more than you think.",
        "Let's make today count.",
    ],

    "sleepy": [
        "Everything is quiet... I'll take a tiny nap. 😴",
        "Wake me if you need me!",
        "Looks peaceful today.",
    ],

    "excited": [
        "Yay!! 🎉",
        "This is awesome!",
        "Let's go!!",
        "You're on fire today!",
    ],

    "idle": [
        "Need a little push?",
        "Still here whenever you're ready.",
        "I'm waiting for our next adventure.",
    ],
}

from app.ai.ai_service import generate_response as ai_generate_response

def generate_response(prompt: str) -> str:
    """
    Wrapper around ai_service.generate_response.
    Keeps brain.py as the central import point.
    """
    return ai_generate_response(prompt)


def pet_reaction(emotion: str) -> str:
    """
    Returns a short emotional reaction for Neko.
    Used for notifications, desktop pet bubbles,
    reminders and animations.

    NOT for AI conversations.
    """

    emotion = emotion.lower()

    if emotion not in EMOTIONS:
        emotion = "idle"

    return random.choice(EMOTIONS[emotion])
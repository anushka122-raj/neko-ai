import re

IMPORTANT_KEYWORDS = {
    "exam",
    "assignment",
    "project",
    "deadline",
    "interview",
    "meeting",
    "birthday",
    "goal",
    "dream",
    "learn",
    "study",
    "remember",
    "important",
    "college",
    "semester",
    "internship",
    "placement",
    "job",
    "python",
    "java",
    "c++",
    "ai",
    "machine learning",
    "deep learning",
    "friend",
    "family",
    "habit",
    "routine",
    "schedule",
    "health",
}


MEMORY_PATTERNS = [
    r"\bi like\b",
    r"\bi love\b",
    r"\bmy favorite\b",
    r"\bi want to\b",
    r"\bi am learning\b",
    r"\bi am studying\b",
    r"\bmy goal\b",
    r"\bplease remember\b",
    r"\bdon't forget\b",
]


def should_save_memory(text: str) -> bool:
    """
    Decide whether a user message is important enough
    to become a long-term memory.
    """

    if not text:
        return False

    text = text.strip().lower()

    # Ignore tiny messages
    if len(text) < 10:
        return False

    # Keyword detection
    for keyword in IMPORTANT_KEYWORDS:
        if keyword in text:
            return True

    # Pattern detection
    for pattern in MEMORY_PATTERNS:
        if re.search(pattern, text):
            return True

    return False
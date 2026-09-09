"""Gemini integration for Neko's conversational responses."""

import logging
import os

from fastapi import HTTPException
from google import genai

logger = logging.getLogger(__name__)


def generate_response(prompt: str) -> str:
    """
    Generate a conversational response using the Gemini API.
    """

    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.5-flash",
    )

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail=(
                "Gemini is not configured. Add GEMINI_API_KEY "
                "to backend/.env and restart the API."
            ),
        )

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )

        reply = (response.text or "").strip()

        if not reply:
            raise RuntimeError(
                "Gemini returned an empty response."
            )

        return reply

    except HTTPException:
        raise

    except Exception as error:
        logger.exception(
            "Gemini API request failed using model %s",
            model_name,
        )

        raise HTTPException(
            status_code=502,
            detail=f"Gemini request failed: {error}",
        ) from error
import asyncio
import json
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.manager import manager
from app.database.database import SessionLocal
from app.ai.reminder_engine import get_next_reminder

router = APIRouter(
    tags=["WebSocket"],
)

# How often the poll loop checks for new reminders (seconds).
REMINDER_POLL_INTERVAL_SECONDS = 20

# Per-task cooldown window: once a task has been reminded, we don't
# remind about the same task again until this many seconds have passed.
# Range: 15–30 minutes (use 20 min as default).
TASK_COOLDOWN_SECONDS = 20 * 60

# Wellbeing messages are shown when no task needs a reminder.
# We broadcast at most one per poll cycle and only when the last
# broadcast was a "no-task" cycle (avoids spamming idle messages).
WELLBEING_BROADCAST_INTERVAL_SECONDS = 10 * 60

_last_broadcast_key = None
_reminder_poll_task = None

# task_id -> unix timestamp of last broadcast for that task
_task_last_reminded: dict = {}

_last_wellbeing_broadcast_ts: float = 0.0


def _emotion_for_urgency(urgency: str) -> str:
    """
    Maps reminder urgency to a distinct pet emotion so each urgency
    level looks visually different on the sprite.
    """
    return {
        "overdue": "urgent",        # red/orange shake
        "high": "concerned",        # orange frown + glow
        "medium": "thinking",       # pursed mouth, thinking eyes
        "high_priority": "concerned",
    }.get(urgency, "neutral")


def _actions_for_urgency(urgency: str):
    """
    Action buttons only appear for urgent reminders where the user
    can immediately act ("Mark Done" / "Later").
    """
    if urgency in ("overdue", "high", "high_priority"):
        return [
            {"id": "done", "label": "Mark Done"},
            {"id": "later", "label": "Later"},
        ]

    return None


async def _poll_task_reminders():
    """
    Periodically checks the task reminder engine and, when a *new*
    reminder appears, pushes it to every connected client.

    Dedup rules:
    - Same urgency+title within the cooldown window → skipped.
    - Per-task cooldown prevents the same task from being repeated too
      quickly regardless of urgency change.
    - Wellbeing/motivational messages are broadcast on a slower
      separate interval only when no real task reminder fires.
    """

    global _last_broadcast_key
    global _last_wellbeing_broadcast_ts

    while True:
        try:
            db = SessionLocal()

            try:
                result = get_next_reminder(db)
            finally:
                db.close()

            urgency = result.get("urgency", "none")
            task_id = result.get("task_id")
            has_real_task = result.get("reminder", False)

            if has_real_task and task_id is not None:
                now_ts = time.time()

                # Check per-task cooldown.
                last_reminded = _task_last_reminded.get(task_id, 0)
                if now_ts - last_reminded < TASK_COOLDOWN_SECONDS:
                    # Still within cooldown for this task — skip.
                    await asyncio.sleep(REMINDER_POLL_INTERVAL_SECONDS)
                    continue

                broadcast_key = f"{urgency}:{task_id}"

                if broadcast_key != _last_broadcast_key:
                    _last_broadcast_key = broadcast_key
                    _task_last_reminded[task_id] = now_ts

                    await manager.broadcast(
                        json.dumps(
                            {
                                "type": "task_due",
                                "taskId": task_id,
                                "message": result.get("message"),
                                "emotion": _emotion_for_urgency(urgency),
                                "actions": _actions_for_urgency(urgency),
                            }
                        )
                    )
            else:
                # No urgent task this cycle.
                _last_broadcast_key = None

                # Broadcast a wellbeing message on the slower interval.
                now_ts = time.time()
                if (
                    now_ts - _last_wellbeing_broadcast_ts
                    >= WELLBEING_BROADCAST_INTERVAL_SECONDS
                    and result.get("message")
                ):
                    _last_wellbeing_broadcast_ts = now_ts

                    await manager.broadcast(
                        json.dumps(
                            {
                                "type": "wellbeing",
                                "message": result.get("message"),
                                "emotion": "happy",
                                "actions": None,
                            }
                        )
                    )

        except Exception as error:
            print("Reminder poll error:", error)

        await asyncio.sleep(REMINDER_POLL_INTERVAL_SECONDS)


@router.on_event("startup")
async def _start_reminder_poll():
    global _reminder_poll_task

    if _reminder_poll_task is None:
        _reminder_poll_task = asyncio.create_task(
            _poll_task_reminders()
        )


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
):
    """
    Real-time connection used by the frontend and the desktop pet.
    """

    await manager.connect(websocket)

    try:

        while True:

            message = await websocket.receive_text()

            # Structured events (from PetTest page, poll task above, or
            # any future sender) are broadcast to all connected clients.
            # Plain-text messages keep the original echo behaviour for
            # backward compatibility.
            try:
                json.loads(message)
                await manager.broadcast(message)
            except ValueError:
                await manager.send_message(
                    f"NekoAI: {message}"
                )

    except WebSocketDisconnect:

        manager.disconnect(websocket)

    except Exception as error:

        print("WebSocket Error:", error)

        manager.disconnect(websocket)

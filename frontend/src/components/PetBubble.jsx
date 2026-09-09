import PetSpeechBubble from "./PetSpeechBubble";
import { PET_LIFECYCLE_PHASES } from "../hooks/usePetLifecycle";

/**
 * Visibility gate for the reminder speech bubble: only rendered
 * during "talking" and "waiting". Action buttons only appear once
 * the pet has actually finished talking and moved into "waiting" —
 * and the bubble is gone entirely by the time "leaving" starts, per
 * the requested flow.
 */
export default function PetBubble({
  lifecyclePhase,
  message,
  actions,
  onAction,
}) {
  const isVisible =
    lifecyclePhase ===
      PET_LIFECYCLE_PHASES.TALKING ||
    lifecyclePhase ===
      PET_LIFECYCLE_PHASES.WAITING;

  if (!isVisible || !message) {
    return null;
  }

  return (
    <PetSpeechBubble
      message={message}
      actions={
        lifecyclePhase ===
        PET_LIFECYCLE_PHASES.WAITING
          ? actions
          : null
      }
      onAction={onAction}
    />
  );
}

import Sprite from "./Sprite";

/**
 * Maps the current lifecycle phase (from usePetLifecycle) onto a
 * locomotion pose for the Sprite. Pure mapping only — no messages,
 * no timers, no business logic, per the "PetAnimation renders, it
 * doesn't decide" separation.
 *
 * Exported so Pet.jsx can reuse the exact same mapping when it also
 * needs to know the effective locomotion state (e.g. to pause/resume
 * usePetMovement) — one source of truth instead of two copies.
 */
export const LIFECYCLE_LOCOMOTION_MAP = {
  entering: "walk",
  talking: "sit",
  waiting: "sit",
  reacting: "sit",
  leaving: "walk",
};

export default function PetAnimation({
  lifecyclePhase,
  locomotionState,
  direction,
  isDragging,
}) {
  const state =
    LIFECYCLE_LOCOMOTION_MAP[
      lifecyclePhase
    ] || locomotionState;

  const talking =
    lifecyclePhase === "talking" ||
    lifecyclePhase === "waiting";

  return (
    <Sprite
      state={state}
      direction={direction}
      isDragging={isDragging}
      talking={talking}
    />
  );
}

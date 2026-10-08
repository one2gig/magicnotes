import { useCallback, useRef } from "react";
import {
  createGestureState,
  heldNoteIds,
  stepGestures,
  type GestureState,
} from "../services/gestureEngine";
import type { TrackedHand } from "../services/handTracker";

export function useGestureDetection() {
  const stateRef = useRef<GestureState>(createGestureState());

  const step = useCallback((hands: TrackedHand[]) => stepGestures(stateRef.current, hands), []);

  const held = useCallback(() => heldNoteIds(stateRef.current), []);

  const reset = useCallback(() => {
    stateRef.current = createGestureState();
  }, []);

  return { step, held, reset };
}

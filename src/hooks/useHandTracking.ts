import { useCallback, useRef, useState } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { loadHandLandmarker } from "../services/handTracker";

export type TrackerStatus = "idle" | "loading" | "ready" | "error";

export function useHandTracking() {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const [status, setStatus] = useState<TrackerStatus>("idle");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      landmarkerRef.current = await loadHandLandmarker();
      setStatus("ready");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }, []);

  return { landmarkerRef, status, load };
}

import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { HandSide } from "../config/notes";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

export interface Point2 {
  x: number;
  y: number;
}

export interface Point3 extends Point2 {
  z: number;
}

export interface TrackedHand {
  side: HandSide;
  landmarks: Point2[];
  world: Point3[];
}

let pending: Promise<HandLandmarker> | null = null;

export function loadHandLandmarker() {
  if (!pending) {
    pending = createLandmarker().catch((error: unknown) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}

async function createLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  try {
    return await createWithDelegate(vision, "GPU");
  } catch {
    return createWithDelegate(vision, "CPU");
  }
}

function createWithDelegate(vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>, delegate: "GPU" | "CPU") {
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate,
    },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.4,
    minTrackingConfidence: 0.4,
  });
}

export function parseHands(result: HandLandmarkerResult): TrackedHand[] {
  const ranked = new Map<HandSide, { hand: TrackedHand; score: number }>();

  result.landmarks.forEach((landmarks, index) => {
    const category = result.handedness[index]?.[0];
    const name = category?.categoryName?.toLowerCase();
    if (name !== "left" && name !== "right") return;
    const score = category?.score ?? 0;
    const world = result.worldLandmarks[index] ?? [];
    const hand: TrackedHand = {
      side: name,
      landmarks: landmarks.map((point) => ({ x: point.x, y: point.y })),
      world: world.map((point) => ({ x: point.x, y: point.y, z: point.z })),
    };
    const current = ranked.get(name);
    if (!current || score > current.score) ranked.set(name, { hand, score });
  });

  return [...ranked.values()].map((entry) => entry.hand);
}

/** Keep a hand on the same side when its wrist barely moves, even if the label flips for a frame. */
export function stabilizeSides(hands: TrackedHand[], previous: TrackedHand[]) {
  const used = new Set<HandSide>();
  const assigned: TrackedHand[] = [];

  for (const hand of hands) {
    const wrist = hand.landmarks[0];
    let matched: TrackedHand | undefined;
    let best = 0.18;
    if (wrist) {
      for (const prior of previous) {
        if (used.has(prior.side)) continue;
        const priorWrist = prior.landmarks[0];
        if (!priorWrist) continue;
        const gap = Math.hypot(wrist.x - priorWrist.x, wrist.y - priorWrist.y);
        if (gap < best) {
          best = gap;
          matched = prior;
        }
      }
    }

    const side = matched?.side ?? hand.side;
    if (used.has(side)) continue;
    used.add(side);
    assigned.push(side === hand.side ? hand : { ...hand, side });
  }

  return assigned;
}

import { FINGERS, FINGER_TIPS, noteFor, type FingerId, type HandSide } from "../config/notes";
import type { Point2, Point3, TrackedHand } from "./handTracker";

const FINGER_JOINTS: Record<FingerId, { mcp: number; pip: number; dip: number; tip: number }> = {
  thumb: { mcp: 1, pip: 2, dip: 3, tip: 4 },
  index: { mcp: 5, pip: 6, dip: 7, tip: 8 },
  middle: { mcp: 9, pip: 10, dip: 11, tip: 12 },
  ring: { mcp: 13, pip: 14, dip: 15, tip: 16 },
  pinky: { mcp: 17, pip: 18, dip: 19, tip: 20 },
};

/** How far the fingertip must drop from its resting pose. Smaller is more sensitive. */
const PRESS_DROP: Record<FingerId, number> = {
  thumb: 0.05,
  index: 0.045,
  middle: 0.045,
  ring: 0.038,
  pinky: 0.032,
};

/** A clearly curled finger still counts even if the resting pose drifted. */
const PRESS_ABSOLUTE: Record<FingerId, number> = {
  thumb: 0.8,
  index: 0.84,
  middle: 0.85,
  ring: 0.87,
  pinky: 0.89,
};

const ARM_FRAMES = 4;
const ABSENT_GRACE = 6;

export interface NoteTrigger {
  hand: HandSide;
  finger: FingerId;
  noteId: string;
  color: string;
  x: number;
  y: number;
}

interface Slot {
  held: boolean;
  warm: number;
  extension: number;
  rest: number;
  hasExtension: boolean;
  arm: number;
}

type HandSlots = Record<FingerId, Slot>;

export interface GestureState {
  hands: Record<HandSide, HandSlots>;
  absent: Record<HandSide, number>;
}

function emptySlot(): Slot {
  return { held: false, warm: 0, extension: 1, rest: 1, hasExtension: false, arm: 0 };
}

function emptyHand(): HandSlots {
  return {
    thumb: emptySlot(),
    index: emptySlot(),
    middle: emptySlot(),
    ring: emptySlot(),
    pinky: emptySlot(),
  };
}

export function createGestureState(): GestureState {
  return {
    hands: {
      left: emptyHand(),
      right: emptyHand(),
    },
    absent: { left: 0, right: 0 },
  };
}

function distance2(a: Point2, b: Point2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distance3(a: Point3, b: Point3) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function resetHand(slots: HandSlots) {
  for (const finger of FINGERS) {
    const slot = slots[finger];
    slot.held = false;
    slot.warm = 0;
    slot.extension = 1;
    slot.rest = 1;
    slot.hasExtension = false;
    slot.arm = 0;
  }
}

function fingerExtension<T extends Point2>(
  points: T[],
  finger: FingerId,
  distance: (a: T, b: T) => number,
) {
  const joints = FINGER_JOINTS[finger];
  const mcp = points[joints.mcp];
  const pip = points[joints.pip];
  const dip = points[joints.dip];
  const tip = points[joints.tip];
  if (!mcp || !pip || !dip || !tip) return null;

  const length = distance(mcp, pip) + distance(pip, dip) + distance(dip, tip);
  if (length < 0.0001) return null;
  return distance(tip, mcp) / length;
}

/** 1 is a straight finger. Smaller means the fingertip has dropped toward the knuckle. */
function pressExtension(landmarks: Point2[], world: Point3[], finger: FingerId) {
  if (world.length >= 21) {
    const spatial = fingerExtension(world, finger, distance3);
    if (spatial !== null) return spatial;
  }
  return fingerExtension(landmarks, finger, distance2);
}

export function stepGestures(state: GestureState, hands: TrackedHand[]): NoteTrigger[] {
  const present = new Set(hands.map((hand) => hand.side));
  for (const side of ["left", "right"] as const) {
    if (present.has(side)) {
      state.absent[side] = 0;
      continue;
    }
    state.absent[side] += 1;
    if (state.absent[side] > ABSENT_GRACE) resetHand(state.hands[side]);
  }

  const triggers: NoteTrigger[] = [];

  for (const hand of hands) {
    const landmarks = hand.landmarks;
    if (landmarks.length < 21) continue;
    const slots = state.hands[hand.side];

    for (const finger of FINGERS) {
      const raw = pressExtension(landmarks, hand.world, finger);
      const slot = slots[finger];
      if (raw === null) continue;

      const extension = slot.hasExtension ? slot.extension * 0.2 + raw * 0.8 : raw;
      slot.extension = extension;
      slot.hasExtension = true;
      slot.arm += 1;

      if (slot.arm <= ARM_FRAMES) {
        slot.rest = extension;
        continue;
      }

      if (!slot.held) {
        slot.rest = extension > slot.rest ? slot.rest * 0.45 + extension * 0.55 : slot.rest * 0.98 + extension * 0.02;
      }

      const drop = slot.rest - extension;
      const pressed = drop > PRESS_DROP[finger] || extension < PRESS_ABSOLUTE[finger];
      const tip = landmarks[FINGER_TIPS[finger]];

      if (pressed) {
        slot.warm += 1;
        if (!slot.held && slot.warm >= 1) {
          slot.held = true;
          const note = noteFor(hand.side, finger);
          triggers.push({
            hand: hand.side,
            finger,
            noteId: note.id,
            color: note.color,
            x: tip?.x ?? 0,
            y: tip?.y ?? 0,
          });
        }
      } else if (drop < PRESS_DROP[finger] * 0.35) {
        slot.held = false;
        slot.warm = 0;
      }
    }
  }

  return triggers;
}

export function heldNoteIds(state: GestureState) {
  const ids: string[] = [];
  for (const side of ["left", "right"] as const) {
    for (const finger of FINGERS) {
      if (state.hands[side][finger].held) ids.push(noteFor(side, finger).id);
    }
  }
  return ids;
}

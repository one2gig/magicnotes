export const FINGERS = ["thumb", "index", "middle", "ring", "pinky"] as const;

export type FingerId = (typeof FINGERS)[number];
export type HandSide = "left" | "right";

export const FINGER_TIPS: Record<FingerId, number> = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
};

export interface NoteDef {
  id: string;
  finger: FingerId;
  hand: HandSide;
  color: string;
  label: string;
}

export const NOTES: NoteDef[] = [
  { id: "A3", finger: "thumb", hand: "left", color: "#D8B4FE", label: "Thumb" },
  { id: "C4", finger: "index", hand: "left", color: "#F4A4C4", label: "Index" },
  { id: "D4", finger: "middle", hand: "left", color: "#C4B5FD", label: "Middle" },
  { id: "E4", finger: "ring", hand: "left", color: "#7DD3FC", label: "Ring" },
  { id: "G4", finger: "pinky", hand: "left", color: "#6EE7B7", label: "Pinky" },
  { id: "C5", finger: "thumb", hand: "right", color: "#FDA4AF", label: "Thumb" },
  { id: "D5", finger: "index", hand: "right", color: "#FCD34D", label: "Index" },
  { id: "E5", finger: "middle", hand: "right", color: "#FDBA74", label: "Middle" },
  { id: "G5", finger: "ring", hand: "right", color: "#F9A8D4", label: "Ring" },
  { id: "A5", finger: "pinky", hand: "right", color: "#FDBA8C", label: "Pinky" },
];

export function noteFor(hand: HandSide, finger: FingerId) {
  const note = NOTES.find((item) => item.hand === hand && item.finger === finger);
  if (!note) throw new Error(`Missing note for ${hand} ${finger}`);
  return note;
}

export function notesForHand(hand: HandSide) {
  return NOTES.filter((note) => note.hand === hand);
}

export function noteById(id: string) {
  return NOTES.find((note) => note.id === id);
}

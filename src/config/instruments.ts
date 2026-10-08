export const INSTRUMENTS = [
  {
    id: "kalimba",
    label: "Kalimba",
    description: "Soft metallic pluck",
  },
  {
    id: "piano",
    label: "Soft Piano",
    description: "Gentle piano tones",
  },
  {
    id: "musicbox",
    label: "Music Box",
    description: "Delicate bell tones",
  },
  {
    id: "bells",
    label: "Bells",
    description: "Airy chimes",
  },
] as const;

export type InstrumentId = (typeof INSTRUMENTS)[number]["id"];

export function isInstrumentId(value: string): value is InstrumentId {
  return INSTRUMENTS.some((item) => item.id === value);
}

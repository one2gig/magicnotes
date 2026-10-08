export interface Song {
  id: string;
  title: string;
  notes: string[];
}

export const SONGS: Song[] = [
  {
    id: "hot-cross-buns",
    title: "Hot Cross Buns",
    notes: [
      "E4", "E4", "D4", "D4", "C4",
      "E4", "E4", "D4", "D4", "C4",
      "C4", "C4", "C4", "C4", "D4", "D4", "D4", "D4",
      "E4", "E4", "D4", "D4", "C4",
    ],
  },
  {
    id: "mary",
    title: "Mary Had a Little Lamb",
    notes: [
      "E4", "D4", "C4", "D4", "E4", "E4", "E4",
      "D4", "D4", "D4", "E4", "G4", "G4",
      "E4", "D4", "C4", "D4", "E4", "E4", "E4", "E4",
      "D4", "D4", "E4", "D4", "C4",
    ],
  },
  {
    id: "rain",
    title: "Rain, Rain, Go Away",
    notes: [
      "C4", "C4", "D4", "E4", "E4", "D4", "C4",
      "C4", "C4", "D4", "E4", "E4", "D4", "C4",
      "G4", "G4", "E4", "E4", "C4",
    ],
  },
  {
    id: "little-dream",
    title: "Little Dream",
    notes: [
      "C4", "E4", "G4", "E4", "C4",
      "A3", "C4", "E4", "G4",
      "C5", "E5", "G5", "E5", "C5",
      "G4", "E4", "C4", "A3",
      "C4", "E4", "G4", "C5", "E5", "C5", "G4", "E4", "C4",
    ],
  },
];

export function songById(id: string) {
  return SONGS.find((song) => song.id === id);
}

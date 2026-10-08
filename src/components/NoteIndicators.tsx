import { notesForHand, type HandSide } from "../config/notes";
import { cn } from "../lib/utils";

interface NoteIndicatorsProps {
  heldNotes: string[];
  targetNote?: string;
}

export function NoteIndicators({ heldNotes, targetNote }: NoteIndicatorsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap md:justify-center md:gap-3">
      <HandNotes side="left" label="Left Hand" heldNotes={heldNotes} targetNote={targetNote} />
      <HandNotes side="right" label="Right Hand" heldNotes={heldNotes} targetNote={targetNote} />
    </div>
  );
}

function HandNotes({
  side,
  label,
  heldNotes,
  targetNote,
}: {
  side: HandSide;
  label: string;
  heldNotes: string[];
  targetNote?: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
      <span className="text-[10px] tracking-wide text-cream/80 md:hidden">{side === "left" ? "L" : "R"}</span>
      <span className="hidden text-xs tracking-wide text-cream/80 md:inline">{label}</span>
      {notesForHand(side).map((note) => {
        const active = heldNotes.includes(note.id);
        const target = note.id === targetNote;
        return (
          <span
            key={note.id}
            className={cn(
              "grid size-7 place-items-center rounded-full text-[10px] font-semibold text-ink shadow transition md:size-10 md:text-xs",
              (active || target) && "scale-110 ring-2 ring-white",
              target && !active && "animate-pulse",
            )}
            style={{ backgroundColor: note.color }}
          >
            {note.id}
          </span>
        );
      })}
    </div>
  );
}

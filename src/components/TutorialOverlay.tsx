import { X } from "lucide-react";
import { notesForHand } from "../config/notes";
import { PanelDialog } from "./ui/dialog";

interface TutorialOverlayProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  "Show your hands to the camera.",
  "Lower a finger to play its note, then lift it to play again.",
  "Each finger plays a different note.",
  "Use both hands to create melodies.",
  "Experiment with different instruments.",
];

export function TutorialOverlay({ open, onClose }: TutorialOverlayProps) {
  return (
    <PanelDialog open={open} onOpenChange={(next) => { if (!next) onClose(); }} title="How to Play" description="Lower a finger to play its note.">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 grid size-9 place-items-center rounded-full bg-white/30"
        aria-label="Close tutorial"
      >
        <X className="size-4" />
      </button>
      <div className="mt-5 grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
      <HandDiagram />
      <div>
        <ol className="space-y-2 text-sm leading-6">
          {steps.map((step, index) => (
            <li key={step}>
              <span className="mr-2 text-lavender-deep">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
        <ul className="mt-4 flex flex-wrap gap-2">
          {notesForHand("left").map((note) => (
            <li key={note.id} className="flex items-center gap-1 text-xs">
              <span className="size-3 rounded-full" style={{ backgroundColor: note.color }} />
              {note.label} {note.id}
            </li>
          ))}
        </ul>
      </div>
      </div>
      <p className="mt-4 text-xs text-ink/70">
        Your right hand plays the higher notes: {notesForHand("right").map((note) => `${note.label} ${note.id}`).join(", ")}.
      </p>
    </PanelDialog>
  );
}

function HandDiagram() {
  const left = notesForHand("left");
  const byFinger = Object.fromEntries(left.map((note) => [note.finger, note]));
  const dots = [
    { note: byFinger.index, x: 78, y: 46 },
    { note: byFinger.middle, x: 108, y: 28 },
    { note: byFinger.ring, x: 136, y: 40 },
    { note: byFinger.pinky, x: 158, y: 68 },
  ];
  return (
    <svg viewBox="0 0 200 210" className="mx-auto w-40" aria-hidden="true">
      <path
        d="M70 90c-8 8-18 28-18 48 0 28 16 48 42 48h28c24 0 40-16 40-40 0-16-6-28-12-40 8-4 14-16 14-28 0-14-10-22-20-20-2-12-12-22-24-20-4-10-16-16-28-12-8 2-14 10-16 18-10 0-20 8-22 18-2 8 0 16 4 20-4 4-6 8-8 8z"
        fill="rgba(255,244,232,0.7)"
        stroke="#75639B"
        strokeWidth="2"
      />
      {byFinger.thumb ? <circle cx="58" cy="118" r="8" fill={byFinger.thumb.color} /> : null}
      {dots.map((dot) =>
        dot.note ? <circle key={dot.note.id} cx={dot.x} cy={dot.y} r="8" fill={dot.note.color} /> : null,
      )}
    </svg>
  );
}

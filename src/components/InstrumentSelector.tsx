import { INSTRUMENTS, type InstrumentId } from "../config/instruments";
import { cn } from "../lib/utils";

interface InstrumentSelectorProps {
  value: InstrumentId;
  onChange: (id: InstrumentId) => void;
  layout?: "vertical" | "horizontal";
  dense?: boolean;
}

export function InstrumentSelector({ value, onChange, layout = "vertical", dense = false }: InstrumentSelectorProps) {
  return (
    <div
      className={cn(
        layout === "vertical" && "glass rounded-3xl p-2",
        layout === "horizontal" && !dense && "flex flex-wrap gap-2",
        dense && "flex flex-nowrap gap-2 overflow-x-auto",
      )}
    >
      {INSTRUMENTS.map((instrument) => {
        const selected = instrument.id === value;
        return (
          <button
            key={instrument.id}
            type="button"
            onClick={() => onChange(instrument.id)}
            className={cn(
              "flex items-center rounded-2xl text-left transition",
              layout === "vertical" ? "w-40 gap-3 px-3 py-2" : "shrink-0 gap-2 px-2.5 py-1.5",
              selected ? "bg-lavender/70 text-ink shadow" : dense ? "text-cream/90 hover:bg-white/15" : "text-ink/80 hover:bg-white/30",
            )}
            aria-pressed={selected}
          >
            <InstrumentMark id={instrument.id} />
            <span>
              <span className={cn("block text-sm font-medium", dense && "whitespace-nowrap")}>{instrument.label}</span>
              {layout === "vertical" || !dense ? (
                <span className="block text-[11px] opacity-70">{instrument.description}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function InstrumentMark({ id }: { id: InstrumentId }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/50 text-lavender-deep">
      {id === "kalimba" ? <KalimbaIcon /> : null}
      {id === "piano" ? <PianoIcon /> : null}
      {id === "musicbox" ? <BoxIcon /> : null}
      {id === "bells" ? <BellIcon /> : null}
    </span>
  );
}

function KalimbaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="3" width="14" height="18" rx="4" />
      <path d="M9 7v7M12 5v9M15 7v7" />
    </svg>
  );
}

function PianoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v6M12 5v6M17 5v6" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 8l8-4 8 4-8 4-8-4z" />
      <path d="M4 8v8l8 4 8-4V8" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 15a6 6 0 1 1 12 0" />
      <path d="M5 15h14M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

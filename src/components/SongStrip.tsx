import { noteById } from "../config/notes";
import { SONGS } from "../config/songs";
import type { useSongGuide } from "../hooks/useSongGuide";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface SongStripProps {
  guide: ReturnType<typeof useSongGuide>;
  onListen: () => void;
  part?: "full" | "picker" | "sheet";
}

export function SongStrip({ guide, onListen, part = "full" }: SongStripProps) {
  const { song, songId, step, listening, select, restart } = guide;
  const finished = Boolean(song && step >= song.notes.length && !listening);
  const currentId = song && step < song.notes.length ? song.notes[step] : undefined;
  const current = currentId ? noteById(currentId) : undefined;
  const windowStart = song ? Math.max(0, Math.min(step, song.notes.length - 1) - 2) : 0;
  const visible = song?.notes.slice(windowStart, windowStart + 8) ?? [];
  const compact = part === "sheet";
  const pickerId = part === "picker" ? "song-picker-mobile" : "song-picker";

  const actions = (
    <>
      {song ? (
        <Button variant="dark" onClick={onListen} disabled={listening} className={compact ? "h-8 px-3 text-xs" : undefined}>
          {listening ? "Listening..." : "Listen"}
        </Button>
      ) : null}
      {finished ? (
        <Button variant="dark" onClick={restart} className={compact ? "h-8 px-3 text-xs" : undefined}>
          Play again
        </Button>
      ) : null}
    </>
  );

  const picker = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <label className="sr-only" htmlFor={pickerId}>
        Song
      </label>
      <select
        id={pickerId}
        className="min-w-0 flex-1 rounded-full bg-cream px-3 py-1.5 text-sm text-ink"
        value={songId}
        onChange={(event) => select(event.target.value)}
      >
        <option value="free">Free play</option>
        {SONGS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
      {part === "full" ? actions : null}
    </div>
  );

  const sheet = song ? (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={compact ? "shrink-0" : "min-w-28"}>
          <p className="text-xs text-cream/70">{finished ? "Finished" : "Play this note"}</p>
          <p className="text-sm text-cream">
            {current ? `${current.hand === "left" ? "Left" : "Right"} ${current.label.toLowerCase()}` : song.title}
          </p>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto md:gap-2">
          {visible.map((noteId, offset) => {
            const index = windowStart + offset;
            const note = noteById(noteId);
            if (!note) return null;
            const isCurrent = index === step;
            const isDone = index < step;
            return (
              <span
                key={`${noteId}-${index}`}
                className={cn(
                  "grid shrink-0 place-items-center rounded-full font-semibold text-ink transition",
                  isCurrent
                    ? compact
                      ? "size-9 text-xs ring-2 ring-white"
                      : "size-12 text-sm ring-2 ring-white"
                    : compact
                      ? "size-7 text-[10px]"
                      : "size-8 text-[11px]",
                  isDone && "opacity-40",
                )}
                style={{ backgroundColor: note.color }}
              >
                {note.id}
              </span>
            );
          })}
        </div>
        {compact ? actions : null}
      </div>
      {finished ? <p className="text-xs text-cream/80 md:text-sm">Lovely. Play it again whenever you like.</p> : null}
    </div>
  ) : null;

  if (part === "picker") return picker;
  if (part === "sheet") return sheet;

  return (
    <div className="glass-dark rounded-[28px] px-4 py-3">
      {picker}
      {sheet ? <div className="mt-3">{sheet}</div> : null}
    </div>
  );
}

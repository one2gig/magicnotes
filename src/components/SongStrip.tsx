import { noteById } from "../config/notes";
import { SONGS } from "../config/songs";
import type { useSongGuide } from "../hooks/useSongGuide";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface SongStripProps {
  guide: ReturnType<typeof useSongGuide>;
  onListen: () => void;
}

export function SongStrip({ guide, onListen }: SongStripProps) {
  const { song, songId, step, listening, select, restart } = guide;
  const finished = Boolean(song && step >= song.notes.length && !listening);
  const currentId = song && step < song.notes.length ? song.notes[step] : undefined;
  const current = currentId ? noteById(currentId) : undefined;
  const windowStart = song ? Math.max(0, Math.min(step, song.notes.length - 1) - 2) : 0;
  const visible = song?.notes.slice(windowStart, windowStart + 8) ?? [];

  return (
    <div className="glass-dark rounded-[28px] px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs tracking-wide text-cream/70" htmlFor="song-picker">
          Song
        </label>
        <select
          id="song-picker"
          className="rounded-full bg-cream px-3 py-1.5 text-sm text-ink"
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
        {song ? (
          <Button variant="dark" onClick={onListen} disabled={listening}>
            {listening ? "Listening..." : "Listen"}
          </Button>
        ) : null}
        {finished ? (
          <Button variant="dark" onClick={restart}>
            Play again
          </Button>
        ) : null}
      </div>

      {song ? (
        <div className="mt-3 flex items-center gap-3">
          <div className="min-w-28">
            <p className="text-xs text-cream/70">{finished ? "Finished" : "Play this note"}</p>
            <p className="text-sm text-cream">
              {current ? `${current.hand === "left" ? "Left" : "Right"} ${current.label.toLowerCase()}` : song.title}
            </p>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
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
                    isCurrent ? "size-12 text-sm ring-2 ring-white" : "size-8 text-[11px]",
                    isDone && "opacity-40",
                  )}
                  style={{ backgroundColor: note.color }}
                >
                  {note.id}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {finished ? <p className="mt-2 text-sm text-cream/80">Lovely. Play it again whenever you like.</p> : null}
    </div>
  );
}

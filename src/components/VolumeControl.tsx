import { Volume2, VolumeX } from "lucide-react";
import { cn } from "../lib/utils";
import { Slider } from "./ui/slider";

interface VolumeControlProps {
  volume: number;
  muted: boolean;
  onVolume: (volume: number) => void;
  onToggleMute: () => void;
  compact?: boolean;
}

export function VolumeControl({ volume, muted, onVolume, onToggleMute, compact }: VolumeControlProps) {
  const percent = Math.round((muted ? 0 : volume) * 100);
  return (
    <div className={cn("flex items-center gap-1 text-cream", compact ? "shrink-0" : "min-w-40 gap-2")}>
      <button type="button" onClick={onToggleMute} aria-label={muted ? "Unmute" : "Mute"} className="grid size-8 place-items-center">
        {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
      <Slider value={muted ? 0 : volume} onValueChange={onVolume} label="Master volume" className={compact ? "w-14 md:w-28" : "w-28"} />
      <span className={cn("text-xs", compact ? "hidden w-10 sm:inline" : "w-10")}>{percent}%</span>
    </div>
  );
}

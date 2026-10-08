import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "./ui/slider";

interface VolumeControlProps {
  volume: number;
  muted: boolean;
  onVolume: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ volume, muted, onVolume, onToggleMute }: VolumeControlProps) {
  const percent = Math.round((muted ? 0 : volume) * 100);
  return (
    <div className="flex min-w-40 items-center gap-2 text-cream">
      <button type="button" onClick={onToggleMute} aria-label={muted ? "Unmute" : "Mute"} className="grid size-8 place-items-center">
        {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
      <Slider value={muted ? 0 : volume} onValueChange={onVolume} label="Master volume" className="w-28" />
      <span className="w-10 text-xs">{percent}%</span>
    </div>
  );
}

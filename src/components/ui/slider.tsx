import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../lib/utils";

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
  label: string;
}

export function Slider({ value, onValueChange, className, label }: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex h-6 w-full touch-none items-center", className)}
      min={0}
      max={100}
      step={1}
      value={[Math.round(value * 100)]}
      onValueChange={(next) => onValueChange((next[0] ?? 0) / 100)}
      aria-label={label}
    >
      <SliderPrimitive.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-white/40">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-pink via-lavender to-gold" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-4 rounded-full border border-white bg-cream shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-lavender" />
    </SliderPrimitive.Root>
  );
}

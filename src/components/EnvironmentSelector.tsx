import { Cloud, CloudRain, Moon, Trees } from "lucide-react";
import { ENVIRONMENTS, type EnvironmentId } from "../config/themes";
import { cn } from "../lib/utils";

const icons = {
  dream: Cloud,
  rain: CloudRain,
  forest: Trees,
  night: Moon,
} as const;

interface EnvironmentSelectorProps {
  value: EnvironmentId;
  onChange: (id: EnvironmentId) => void;
  layout?: "vertical" | "horizontal";
}

export function EnvironmentSelector({ value, onChange, layout = "vertical" }: EnvironmentSelectorProps) {
  return (
    <div className={cn("glass rounded-full p-2", layout === "horizontal" ? "flex gap-2" : "flex flex-col gap-2")}>
      {ENVIRONMENTS.map((environment) => {
        const Icon = icons[environment.id];
        const selected = environment.id === value;
        return (
          <button
            key={environment.id}
            type="button"
            onClick={() => onChange(environment.id)}
            aria-pressed={selected}
            aria-label={environment.label}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-2 text-sm transition",
              selected ? "bg-white/70 text-ink shadow" : "text-ink/80 hover:bg-white/30",
            )}
          >
            <Icon className="size-4" />
            <span className={layout === "vertical" ? "w-14 text-left" : ""}>{environment.label}</span>
          </button>
        );
      })}
    </div>
  );
}

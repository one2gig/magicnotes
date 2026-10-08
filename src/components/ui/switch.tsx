import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

export function Switch({ checked, onCheckedChange, label }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className={cn(
        "relative flex h-6 w-11 shrink-0 items-center rounded-full transition",
        checked ? "bg-lavender-deep" : "bg-white/25",
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block size-5 rounded-full bg-cream shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface PanelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}

export function PanelDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  dark,
}: PanelDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[#242039]/45 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[28px] p-6",
            dark ? "glass-dark" : "glass",
            className,
          )}
        >
          <Dialog.Title className="font-display text-3xl">{title}</Dialog.Title>
          {description ? <Dialog.Description className="mt-1 text-sm opacity-80">{description}</Dialog.Description> : null}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

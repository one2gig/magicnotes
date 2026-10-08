import { cn } from "../lib/utils";
import type { RefObject } from "react";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  mirror: boolean;
  live: boolean;
}

export function CameraView({ videoRef, mirror, live }: CameraViewProps) {
  return (
    <video
      ref={videoRef}
      playsInline
      muted
      autoPlay
      className={cn(
        "absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-500",
        live ? "opacity-100" : "opacity-0",
      )}
      style={{ transform: mirror ? "scaleX(-1)" : undefined }}
    />
  );
}

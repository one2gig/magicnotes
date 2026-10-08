import type { RefObject } from "react";

interface HandOverlayProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export function HandOverlay({ canvasRef }: HandOverlayProps) {
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden="true" />;
}

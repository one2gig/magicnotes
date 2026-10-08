import { HandLandmarker } from "@mediapipe/tasks-vision";
import { FINGERS, FINGER_TIPS, noteFor, type FingerId } from "../config/notes";
import type { TrackedHand } from "./handTracker";
import type { Particle, TrailDot } from "./particleEngine";

export interface CoverBox {
  offsetX: number;
  offsetY: number;
  renderW: number;
  renderH: number;
}

export function coverBox(videoW: number, videoH: number, boxW: number, boxH: number): CoverBox {
  if (!videoW || !videoH || !boxW || !boxH) {
    return { offsetX: 0, offsetY: 0, renderW: boxW, renderH: boxH };
  }
  const videoAspect = videoW / videoH;
  const boxAspect = boxW / boxH;
  if (videoAspect > boxAspect) {
    const renderH = boxH;
    const renderW = boxH * videoAspect;
    return { offsetX: (boxW - renderW) / 2, offsetY: 0, renderW, renderH };
  }
  const renderW = boxW;
  const renderH = boxW / videoAspect;
  return { offsetX: 0, offsetY: (boxH - renderH) / 2, renderW, renderH };
}

interface DrawOptions {
  mirror: boolean;
  showLandmarks: boolean;
  showParticles: boolean;
  showTrails: boolean;
  flashes: Record<string, number>;
  now: number;
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  videoW: number,
  videoH: number,
  hands: TrackedHand[],
  particles: Particle[],
  trails: TrailDot[],
  options: DrawOptions,
) {
  const width = cssWidth * dpr;
  const height = cssHeight * dpr;
  ctx.clearRect(0, 0, width, height);
  const cover = coverBox(videoW, videoH, cssWidth, cssHeight);

  const toPx = (x: number, y: number) => {
    const nx = options.mirror ? 1 - x : x;
    return {
      x: (cover.offsetX + nx * cover.renderW) * dpr,
      y: (cover.offsetY + y * cover.renderH) * dpr,
    };
  };

  if (options.showTrails) {
    for (const trail of trails) {
      const point = toPx(trail.x, trail.y);
      ctx.globalAlpha = (trail.life / trail.maxLife) * 0.4;
      ctx.fillStyle = trail.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (options.showLandmarks) {
    ctx.lineWidth = 1.5 * dpr;
    ctx.strokeStyle = "rgba(255,244,232,0.45)";
    for (const hand of hands) {
      for (const connection of HandLandmarker.HAND_CONNECTIONS) {
        const start = hand.landmarks[connection.start];
        const end = hand.landmarks[connection.end];
        if (!start || !end) continue;
        const a = toPx(start.x, start.y);
        const b = toPx(end.x, end.y);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  const pulse = 0.85 + Math.sin(options.now / 280) * 0.15;
  for (const hand of hands) {
    for (const finger of FINGERS) {
      drawTip(ctx, hand, finger, toPx, dpr, options, pulse);
    }
  }

  if (!options.showParticles) return;

  for (const particle of particles) {
    const point = toPx(particle.x, particle.y);
    const alpha = Math.max(0, particle.life / particle.maxLife);
    if (particle.kind === "orb") {
      const grow = 1 + (1 - alpha) * 0.8;
      const radius = particle.size * grow * dpr;
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, "transparent");
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (particle.kind === "symbol") {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(point.x, point.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
      ctx.font = `${particle.size * dpr}px "Cormorant Garamond", serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(particle.symbol, 0, 0);
      ctx.restore();
    } else {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, particle.size * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawTip(
  ctx: CanvasRenderingContext2D,
  hand: TrackedHand,
  finger: FingerId,
  toPx: (x: number, y: number) => { x: number; y: number },
  dpr: number,
  options: DrawOptions,
  pulse: number,
) {
  const tip = hand.landmarks[FINGER_TIPS[finger]];
  if (!tip) return;
  const note = noteFor(hand.side, finger);
  const point = toPx(tip.x, tip.y);
  const flashing = (options.flashes[`${hand.side}-${finger}`] ?? 0) > options.now;
  const radius = (flashing ? 16 : 9 * pulse) * dpr;
  ctx.globalAlpha = flashing ? 0.95 : 0.75;
  ctx.fillStyle = note.color;
  ctx.shadowColor = note.color;
  ctx.shadowBlur = (flashing ? 24 : 12) * dpr;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

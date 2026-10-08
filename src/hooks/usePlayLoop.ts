import { useEffect, useRef, useState, type RefObject } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { FINGERS, FINGER_TIPS, noteFor } from "../config/notes";
import type { Preferences } from "../config/preferences";
import type { AudioEngine } from "../services/audioEngine";
import type { NoteTrigger } from "../services/gestureEngine";
import { parseHands, stabilizeSides, type TrackedHand } from "../services/handTracker";
import { drawScene } from "../services/overlay";
import { ParticleEngine } from "../services/particleEngine";

interface PlayLoopArgs {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  landmarkerRef: RefObject<HandLandmarker | null>;
  engine: AudioEngine;
  prefs: Preferences;
  cameraLive: boolean;
  trackerReady: boolean;
  step: (hands: TrackedHand[]) => NoteTrigger[];
  held: () => string[];
  resetGestures: () => void;
  onNote?: (noteId: string) => void;
}

export function usePlayLoop({
  videoRef,
  canvasRef,
  landmarkerRef,
  engine,
  prefs,
  cameraLive,
  trackerReady,
  step,
  held,
  resetGestures,
  onNote,
}: PlayLoopArgs) {
  const particlesRef = useRef(new ParticleEngine());
  const prefsRef = useRef(prefs);
  const engineRef = useRef(engine);
  const flashesRef = useRef<Record<string, number>>({});
  const handsRef = useRef<TrackedHand[]>([]);
  const previousHandsRef = useRef<TrackedHand[]>([]);
  const onNoteRef = useRef(onNote);
  const [handsVisible, setHandsVisible] = useState(false);
  const [heldNotes, setHeldNotes] = useState<string[]>([]);

  useEffect(() => {
    prefsRef.current = prefs;
    engineRef.current = engine;
    onNoteRef.current = onNote;
  }, [prefs, engine, onNote]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [canvasRef]);

  useEffect(() => {
    if (!cameraLive || !trackerReady) {
      handsRef.current = [];
      previousHandsRef.current = [];
      resetGestures();
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    let frame = 0;
    let last = performance.now();
    let lastVideo = -1;
    let lastTimestamp = 0;
    let lastHeld = "";
    let lastVisible = false;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const started = performance.now();
      const currentPrefs = prefsRef.current;
      const particles = particlesRef.current;
      const landmarker = landmarkerRef.current;

      if (video.readyState >= 2 && video.currentTime !== lastVideo && landmarker) {
        lastVideo = video.currentTime;
        let timestamp = now;
        if (timestamp <= lastTimestamp) timestamp = lastTimestamp + 1;
        lastTimestamp = timestamp;
        try {
          const result = landmarker.detectForVideo(video, timestamp);
          const hands = stabilizeSides(parseHands(result), previousHandsRef.current);
          previousHandsRef.current = hands;
          handsRef.current = hands;
          const triggers = step(hands);
          for (const trigger of triggers) {
            engineRef.current?.play(trigger.noteId);
            onNoteRef.current?.(trigger.noteId);
            flashesRef.current[`${trigger.hand}-${trigger.finger}`] = now + 520;
            if (currentPrefs.showParticles) particles.burst(trigger.x, trigger.y, trigger.color);
          }
        } catch {
          // Keep the last good frame if a single inference call fails.
        }
      }

      if (currentPrefs.showTrails && !particles.reduced) {
        for (const hand of handsRef.current) {
          for (const finger of FINGERS) {
            const tip = hand.landmarks[FINGER_TIPS[finger]];
            if (!tip) continue;
            particles.addTrail(tip.x, tip.y, noteFor(hand.side, finger).color);
          }
        }
      }

      particles.tick(dt);
      const context = canvas.getContext("2d");
      if (context && canvas.clientWidth > 0 && canvas.clientHeight > 0) {
        const dpr = canvas.width / Math.max(canvas.clientWidth, 1);
        drawScene(
          context,
          canvas.clientWidth,
          canvas.clientHeight,
          dpr,
          video.videoWidth,
          video.videoHeight,
          handsRef.current,
          currentPrefs.showParticles ? particles.particles : [],
          currentPrefs.showTrails && !particles.reduced ? particles.trails : [],
          {
            mirror: currentPrefs.mirrorCamera,
            showLandmarks: currentPrefs.showLandmarks,
            showParticles: currentPrefs.showParticles,
            showTrails: currentPrefs.showTrails && !particles.reduced,
            flashes: flashesRef.current,
            now,
          },
        );
      }
      particles.noteFrame(performance.now() - started);

      const signature = held().join("|");
      if (signature !== lastHeld) {
        lastHeld = signature;
        setHeldNotes(signature ? signature.split("|") : []);
      }
      const visible = handsRef.current.length > 0;
      if (visible !== lastVisible) {
        lastVisible = visible;
        setHandsVisible(visible);
      }
    };

    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      handsRef.current = [];
      previousHandsRef.current = [];
      resetGestures();
      setHandsVisible(false);
      setHeldNotes([]);
    };
  }, [cameraLive, trackerReady, canvasRef, videoRef, landmarkerRef, step, held, resetGestures]);

  return { handsVisible, heldNotes };
}

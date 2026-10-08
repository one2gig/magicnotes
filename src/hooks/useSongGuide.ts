import { useCallback, useEffect, useRef, useState } from "react";
import { songById } from "../config/songs";
import type { AudioEngine } from "../services/audioEngine";

const LISTEN_GAP_MS = 640;

export function useSongGuide() {
  const [songId, setSongId] = useState("free");
  const [step, setStep] = useState(0);
  const [listening, setListening] = useState(false);
  const tokenRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const song = songId === "free" ? undefined : songById(songId);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  }, []);

  const select = useCallback((id: string) => {
    tokenRef.current += 1;
    clearTimers();
    setListening(false);
    setSongId(id);
    setStep(0);
  }, [clearTimers]);

  const restart = useCallback(() => {
    tokenRef.current += 1;
    clearTimers();
    setListening(false);
    setStep(0);
  }, [clearTimers]);

  const onNote = useCallback((noteId: string) => {
    if (!song || listening) return;
    setStep((current) => {
      if (current >= song.notes.length) return current;
      return song.notes[current] === noteId ? current + 1 : current;
    });
  }, [song, listening]);

  const listen = useCallback(async (engine: AudioEngine) => {
    if (!song) return;
    clearTimers();
    const token = tokenRef.current + 1;
    tokenRef.current = token;
    if (!engine.ready) {
      const started = await engine.unlock();
      if (!started || tokenRef.current !== token) return;
    }
    setListening(true);
    setStep(0);
    song.notes.forEach((noteId, index) => {
      const timer = window.setTimeout(() => {
        if (tokenRef.current !== token) return;
        engine.play(noteId);
        setStep(index + 1);
        if (index === song.notes.length - 1) {
          const done = window.setTimeout(() => {
            if (tokenRef.current !== token) return;
            setListening(false);
            setStep(0);
          }, LISTEN_GAP_MS);
          timersRef.current.push(done);
        }
      }, index * LISTEN_GAP_MS);
      timersRef.current.push(timer);
    });
  }, [song, clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  return { song, songId, step, listening, select, restart, onNote, listen };
}

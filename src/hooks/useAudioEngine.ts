import { useCallback, useEffect, useState } from "react";
import type { InstrumentId } from "../config/instruments";
import { AudioEngine } from "../services/audioEngine";

export type AudioStatus = "pending" | "ready" | "blocked";

export function useAudioEngine() {
  const [engine] = useState(() => new AudioEngine());
  const [status, setStatus] = useState<AudioStatus>("pending");

  const unlock = useCallback(() => {
    void engine.unlock().then((ok) => setStatus(ok ? "ready" : "blocked"));
  }, [engine]);

  const sync = useCallback(
    (instrument: InstrumentId, volume: number, muted: boolean) => {
      engine.setInstrument(instrument);
      engine.setVolume(volume);
      engine.setMuted(muted);
    },
    [engine],
  );

  useEffect(() => () => engine.dispose(), [engine]);

  return { engine, status, unlock, sync };
}

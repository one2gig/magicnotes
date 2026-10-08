import {
  FMSynth,
  MetalSynth,
  PolySynth,
  Volume,
  Limiter,
  getContext,
  start,
} from "tone";
import type { InstrumentId } from "../config/instruments";

type Voice = PolySynth<FMSynth> | PolySynth<MetalSynth>;

function gainToDb(value: number) {
  return 20 * Math.log10(Math.max(value, 0.0001));
}

export class AudioEngine {
  private limiter: Limiter | null = null;
  private volume: Volume | null = null;
  private voices = new Map<InstrumentId, Voice>();
  private current: InstrumentId = "kalimba";
  private level = 0.7;
  private muted = false;
  private built = false;
  ready = false;

  setInstrument(id: InstrumentId) {
    this.current = id;
  }

  setVolume(level: number) {
    this.level = level;
    this.applyVolume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyVolume();
  }

  unlock() {
    const pending = start();
    this.build();
    return pending
      .then(() => {
        const context = getContext();
        context.lookAhead = 0.01;
        this.ready = context.state === "running";
        this.applyVolume();
        return this.ready;
      })
      .catch(() => false);
  }

  play(note: string) {
    if (!this.ready) return;
    this.voices.get(this.current)?.triggerAttackRelease(note, "8n", undefined, 0.82);
  }

  dispose() {
    for (const voice of this.voices.values()) voice.dispose();
    this.voices.clear();
    this.volume?.dispose();
    this.limiter?.dispose();
    this.volume = null;
    this.limiter = null;
    this.built = false;
    this.ready = false;
  }

  private build() {
    if (this.built) return;
    this.limiter = new Limiter(-2).toDestination();
    this.volume = new Volume(gainToDb(this.level)).connect(this.limiter);

    const kalimba = new PolySynth(FMSynth, {
      harmonicity: 3.2,
      modulationIndex: 1.4,
      oscillator: { type: "triangle" },
      modulation: { type: "sine" },
      envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 1.1 },
      modulationEnvelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.2 },
    });
    kalimba.maxPolyphony = 10;
    kalimba.volume.value = -8;

    const piano = new PolySynth(FMSynth, {
      harmonicity: 1.4,
      modulationIndex: 0.45,
      oscillator: { type: "sine" },
      modulation: { type: "triangle" },
      envelope: { attack: 0.01, decay: 1.35, sustain: 0.04, release: 1.15 },
      modulationEnvelope: { attack: 0.01, decay: 0.45, sustain: 0, release: 0.3 },
    });
    piano.maxPolyphony = 10;
    piano.volume.value = -6;

    const musicbox = new PolySynth(MetalSynth, {
      harmonicity: 8,
      modulationIndex: 14,
      resonance: 2800,
      octaves: 1.1,
      envelope: { attack: 0.001, decay: 2.1, sustain: 0, release: 1.5 },
    });
    musicbox.maxPolyphony = 10;
    musicbox.volume.value = -16;

    const bells = new PolySynth(MetalSynth, {
      harmonicity: 12,
      modulationIndex: 22,
      resonance: 4200,
      octaves: 1.4,
      envelope: { attack: 0.001, decay: 2.6, sustain: 0, release: 1.7 },
    });
    bells.maxPolyphony = 10;
    bells.volume.value = -18;

    const output = this.volume;
    kalimba.connect(output);
    piano.connect(output);
    musicbox.connect(output);
    bells.connect(output);

    this.voices.set("kalimba", kalimba);
    this.voices.set("piano", piano);
    this.voices.set("musicbox", musicbox);
    this.voices.set("bells", bells);
    this.built = true;
  }

  private applyVolume() {
    if (!this.volume) return;
    const level = this.muted ? 0 : this.level;
    this.volume.volume.rampTo(gainToDb(level), 0.05);
  }
}

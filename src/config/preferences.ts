import { isInstrumentId, type InstrumentId } from "./instruments";
import { isEnvironmentId, type EnvironmentId } from "./themes";

export interface Preferences {
  instrument: InstrumentId;
  volume: number;
  muted: boolean;
  environment: EnvironmentId;
  showLandmarks: boolean;
  showParticles: boolean;
  showTrails: boolean;
  mirrorCamera: boolean;
  tutorialCompleted: boolean;
  cameraDeviceId: string;
}

export const STORAGE_KEY = "little-melodies-prefs";

export const defaultPreferences: Preferences = {
  instrument: "kalimba",
  volume: 0.7,
  muted: false,
  environment: "dream",
  showLandmarks: true,
  showParticles: true,
  showTrails: true,
  mirrorCamera: true,
  tutorialCompleted: false,
  cameraDeviceId: "",
};

export function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return sanitize(parsed);
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: Preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function sanitize(parsed: Partial<Preferences>): Preferences {
  return {
    instrument:
      typeof parsed.instrument === "string" && isInstrumentId(parsed.instrument)
        ? parsed.instrument
        : defaultPreferences.instrument,
    volume:
      typeof parsed.volume === "number"
        ? Math.min(1, Math.max(0, parsed.volume))
        : defaultPreferences.volume,
    muted: typeof parsed.muted === "boolean" ? parsed.muted : defaultPreferences.muted,
    environment:
      typeof parsed.environment === "string" && isEnvironmentId(parsed.environment)
        ? parsed.environment
        : defaultPreferences.environment,
    showLandmarks:
      typeof parsed.showLandmarks === "boolean"
        ? parsed.showLandmarks
        : defaultPreferences.showLandmarks,
    showParticles:
      typeof parsed.showParticles === "boolean"
        ? parsed.showParticles
        : defaultPreferences.showParticles,
    showTrails:
      typeof parsed.showTrails === "boolean" ? parsed.showTrails : defaultPreferences.showTrails,
    mirrorCamera:
      typeof parsed.mirrorCamera === "boolean"
        ? parsed.mirrorCamera
        : defaultPreferences.mirrorCamera,
    tutorialCompleted:
      typeof parsed.tutorialCompleted === "boolean"
        ? parsed.tutorialCompleted
        : defaultPreferences.tutorialCompleted,
    cameraDeviceId:
      typeof parsed.cameraDeviceId === "string"
        ? parsed.cameraDeviceId
        : defaultPreferences.cameraDeviceId,
  };
}

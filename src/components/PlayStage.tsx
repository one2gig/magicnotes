import { useEffect, useRef, useState, type ReactNode } from "react";
import { BookOpen, Camera, Settings, Sparkles, WandSparkles } from "lucide-react";
import type { useAudioEngine } from "../hooks/useAudioEngine";
import { useCamera } from "../hooks/useCamera";
import { useGestureDetection } from "../hooks/useGestureDetection";
import { useHandTracking } from "../hooks/useHandTracking";
import { usePlayLoop } from "../hooks/usePlayLoop";
import { useSongGuide } from "../hooks/useSongGuide";
import type { usePreferences } from "../hooks/usePreferences";
import { CameraView } from "./CameraView";
import { EnvironmentSelector } from "./EnvironmentSelector";
import { HandOverlay } from "./HandOverlay";
import { InstrumentSelector } from "./InstrumentSelector";
import { NoteIndicators } from "./NoteIndicators";
import { SongStrip } from "./SongStrip";
import { SettingsPanel } from "./SettingsPanel";
import { TutorialOverlay } from "./TutorialOverlay";
import { Button } from "./ui/button";
import { VolumeControl } from "./VolumeControl";
import { environmentById } from "../config/themes";

interface PlayStageProps {
  preferences: ReturnType<typeof usePreferences>;
  audio: ReturnType<typeof useAudioEngine>;
}

export function PlayStage({ preferences, audio }: PlayStageProps) {
  const { prefs, update, reset } = preferences;
  const camera = useCamera();
  const tracker = useHandTracking();
  const gestures = useGestureDetection();
  const songs = useSongGuide();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideRequested, setGuideRequested] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(false);
  const prefsRef = useRef(prefs);

  const guideOpen =
    guideRequested ||
    (!guideDismissed &&
      !prefs.tutorialCompleted &&
      (camera.status === "live" || camera.status === "error" || tracker.status === "error"));

  const { handsVisible, heldNotes } = usePlayLoop({
    videoRef: camera.videoRef,
    canvasRef,
    landmarkerRef: tracker.landmarkerRef,
    engine: audio.engine,
    prefs,
    cameraLive: camera.status === "live",
    trackerReady: tracker.status === "ready",
    step: gestures.step,
    held: gestures.held,
    resetGestures: gestures.reset,
    onNote: songs.onNote,
  });

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  const startCamera = camera.start;
  const stopCamera = camera.stop;
  const loadTracker = tracker.load;

  useEffect(() => {
    void Promise.all([
      startCamera(prefsRef.current.cameraDeviceId || undefined),
      loadTracker(),
    ]);
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera, loadTracker]);

  const applyPrefs = (patch: Parameters<typeof update>[0]) => {
    update(patch);
    if (typeof patch.cameraDeviceId === "string" && camera.status === "live") {
      void camera.start(patch.cameraDeviceId || undefined);
    }
  };

  const environment = environmentById(prefs.environment);
  const loading = camera.status === "loading" || (camera.status === "live" && tracker.status === "loading");

  return (
    <div className="relative z-10 flex h-svh flex-col p-2 md:p-4">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/25 bg-black/10 shadow-[0_30px_80px_rgba(36,32,57,0.28)]">
        <CameraView videoRef={camera.videoRef} mirror={prefs.mirrorCamera} live={camera.status === "live"} />
        <HandOverlay canvasRef={canvasRef} />
        <div className={`pointer-events-none absolute inset-0 z-10 bg-gradient-to-b ${environment.wash}`} />

        <header className="absolute inset-x-2 top-2 z-30 flex items-start justify-between gap-2 md:inset-x-4 md:top-4 md:gap-3">
          <div className="min-w-0">
            <p className="font-display text-xl text-cream drop-shadow md:text-3xl">
              Little Melodies <Sparkles className="mb-1 inline size-3.5 md:size-4" />
            </p>
            <p className="hidden text-sm text-cream/80 md:block">Music at your fingertips</p>
          </div>
          <div className="flex shrink-0 gap-1.5 md:gap-2">
            <IconButton
              label={camera.status === "live" ? "Stop camera" : "Start camera"}
              pressed={camera.status === "live"}
              onClick={() => {
                if (camera.status === "live") camera.stop();
                else void camera.start(prefs.cameraDeviceId || undefined);
              }}
            >
              <Camera className="size-4" />
            </IconButton>
            <IconButton
              label="Toggle effects"
              pressed={prefs.showParticles}
              onClick={() => update({ showParticles: !prefs.showParticles })}
            >
              <WandSparkles className="size-4" />
            </IconButton>
            <IconButton label="Settings" onClick={() => setSettingsOpen(true)}>
              <Settings className="size-4" />
            </IconButton>
          </div>
        </header>

        <div className="absolute top-24 left-4 z-30 hidden md:block">
          <InstrumentSelector value={prefs.instrument} onChange={(instrument) => update({ instrument })} />
        </div>
        <div className="absolute top-24 right-4 z-30 hidden md:block">
          <EnvironmentSelector value={prefs.environment} onChange={(environmentId) => update({ environment: environmentId })} />
        </div>

        <StageMessage
          loading={loading}
          cameraStatus={camera.status}
          cameraError={camera.error}
          trackerStatus={tracker.status}
          audioStatus={audio.status}
          handsVisible={handsVisible}
          onRetry={() => void camera.start(prefs.cameraDeviceId || undefined)}
          onEnableAudio={audio.unlock}
        />

        <footer className="absolute inset-x-2 z-30 space-y-3 bottom-[max(0.5rem,env(safe-area-inset-bottom))] md:inset-x-3 md:bottom-3">
          <div className="hidden md:block">
            <SongStrip guide={songs} onListen={() => void songs.listen(audio.engine)} />
          </div>
          <div className="glass-dark max-h-[46svh] space-y-2 overflow-y-auto rounded-[24px] px-3 py-2 md:max-h-none md:space-y-3 md:rounded-[28px] md:px-4 md:py-3">
            <div className="flex items-center gap-2 md:hidden">
              <SongStrip part="picker" guide={songs} onListen={() => void songs.listen(audio.engine)} />
              <VolumeControl
                compact
                volume={prefs.volume}
                muted={prefs.muted}
                onVolume={(volume) => update({ volume, muted: false })}
                onToggleMute={() => update({ muted: !prefs.muted })}
              />
              <button
                type="button"
                aria-label="Show guide"
                onClick={() => setGuideRequested(true)}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-cream"
              >
                <BookOpen className="size-4" />
              </button>
            </div>
            <div className="md:hidden">
              <SongStrip part="sheet" guide={songs} onListen={() => void songs.listen(audio.engine)} />
            </div>
            <div className="hidden items-center justify-between gap-3 md:flex">
              <VolumeControl
                volume={prefs.volume}
                muted={prefs.muted}
                onVolume={(volume) => update({ volume, muted: false })}
                onToggleMute={() => update({ muted: !prefs.muted })}
              />
              <NoteIndicators
                heldNotes={heldNotes}
                targetNote={songs.song && songs.step < songs.song.notes.length ? songs.song.notes[songs.step] : undefined}
              />
              <Button variant="dark" onClick={() => setGuideRequested(true)}>
                <BookOpen className="size-4" />
                Show Guide
              </Button>
            </div>
            <div className="md:hidden">
              <NoteIndicators
                heldNotes={heldNotes}
                targetNote={songs.song && songs.step < songs.song.notes.length ? songs.song.notes[songs.step] : undefined}
              />
            </div>
            <div className="space-y-2 md:hidden">
              <InstrumentSelector
                value={prefs.instrument}
                onChange={(instrument) => update({ instrument })}
                layout="horizontal"
                dense
              />
              <EnvironmentSelector
                value={prefs.environment}
                onChange={(environmentId) => update({ environment: environmentId })}
                layout="horizontal"
              />
            </div>
          </div>
        </footer>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        prefs={prefs}
        onChange={applyPrefs}
        onReset={() => {
          reset();
          setGuideDismissed(false);
          setGuideRequested(true);
          if (camera.status === "live") void camera.start();
        }}
        onShowTutorial={() => {
          setSettingsOpen(false);
          setGuideRequested(true);
        }}
        devices={camera.devices}
        cameraStatus={camera.status}
        cameraError={camera.error}
        onCameraStart={() => void camera.start(prefs.cameraDeviceId || undefined)}
        onCameraStop={camera.stop}
      />
      <TutorialOverlay
        open={guideOpen}
        onClose={() => {
          update({ tutorialCompleted: true });
          setGuideRequested(false);
          setGuideDismissed(true);
        }}
      />
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  pressed,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`glass grid size-9 place-items-center rounded-full text-ink md:size-11 ${pressed ? "bg-white/70" : ""}`}
    >
      {children}
    </button>
  );
}

function StageMessage({
  loading,
  cameraStatus,
  cameraError,
  trackerStatus,
  audioStatus,
  handsVisible,
  onRetry,
  onEnableAudio,
}: {
  loading: boolean;
  cameraStatus: ReturnType<typeof useCamera>["status"];
  cameraError: ReturnType<typeof useCamera>["error"];
  trackerStatus: ReturnType<typeof useHandTracking>["status"];
  audioStatus: ReturnType<typeof useAudioEngine>["status"];
  handsVisible: boolean;
  onRetry: () => void;
  onEnableAudio: () => void;
}) {
  let content: ReactNode = null;

  if (loading) {
    content = <p>Opening the camera and warming up hand tracking...</p>;
  } else if (cameraStatus === "error") {
    content = (
      <div className="space-y-3">
        <p>{errorCopy(cameraError)}</p>
        <Button onClick={onRetry}>Retry</Button>
      </div>
    );
  } else if (cameraStatus === "stopped") {
    content = <p>The camera is off. Turn it back on to play.</p>;
  } else if (trackerStatus === "error") {
    content = <p>Hand tracking couldn&apos;t start. Please refresh the page or try another supported browser.</p>;
  } else if (audioStatus === "blocked") {
    content = (
      <button type="button" onClick={onEnableAudio} className="underline">
        Sound couldn&apos;t start. Tap to enable audio.
      </button>
    );
  } else if (cameraStatus === "live" && trackerStatus === "ready" && !handsVisible) {
    content = <p>Show your hands to begin making music ✨</p>;
  }

  if (!content) return null;

  return (
    <div className="absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 justify-center px-6">
      <div className="glass max-w-md rounded-3xl px-5 py-4 text-center text-sm leading-6">{content}</div>
    </div>
  );
}

function errorCopy(error: ReturnType<typeof useCamera>["error"]) {
  if (error === "missing") return "We couldn't find a camera on your device.";
  return "Camera access is needed to make music with your hands. Please enable camera permission and try again.";
}

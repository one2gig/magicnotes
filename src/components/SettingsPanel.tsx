import { X } from "lucide-react";
import type { CameraErrorCode, CameraStatus } from "../hooks/useCamera";
import type { Preferences } from "../config/preferences";
import { ENVIRONMENTS } from "../config/themes";
import { InstrumentSelector } from "./InstrumentSelector";
import { PanelDialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Volume2, VolumeX } from "lucide-react";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefs: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  onReset: () => void;
  onShowTutorial: () => void;
  devices: MediaDeviceInfo[];
  cameraStatus: CameraStatus;
  cameraError: CameraErrorCode | null;
  onCameraStart: () => void;
  onCameraStop: () => void;
}

export function SettingsPanel({
  open,
  onOpenChange,
  prefs,
  onChange,
  onReset,
  onShowTutorial,
  devices,
  cameraStatus,
  cameraError,
  onCameraStart,
  onCameraStop,
}: SettingsPanelProps) {
  return (
    <PanelDialog open={open} onOpenChange={onOpenChange} title="Settings" dark className="max-h-[min(720px,calc(100vh-2rem))] overflow-y-auto">
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="absolute top-5 right-5 grid size-9 place-items-center rounded-full bg-white/10"
        aria-label="Close settings"
      >
        <X className="size-4" />
      </button>

      <section className="mt-5">
        <h3 className="mb-2 text-xs tracking-wide text-cream/70 uppercase">Instrument</h3>
        <InstrumentSelector value={prefs.instrument} onChange={(instrument) => onChange({ instrument })} layout="horizontal" />
      </section>

      <section className="mt-5">
        <h3 className="mb-2 text-xs tracking-wide text-cream/70 uppercase">Volume</h3>
        <div className="flex items-center gap-3">
          <button type="button" aria-label={prefs.muted ? "Unmute" : "Mute"} onClick={() => onChange({ muted: !prefs.muted })}>
            {prefs.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <Slider value={prefs.volume} onValueChange={(volume) => onChange({ volume, muted: false })} label="Master volume" />
          <span className="w-10 text-sm">{Math.round(prefs.volume * 100)}%</span>
        </div>
      </section>

      <section className="mt-5 space-y-3">
        <h3 className="text-xs tracking-wide text-cream/70 uppercase">Visuals</h3>
        <SettingRow label="Show hand landmarks" checked={prefs.showLandmarks} onCheckedChange={(showLandmarks) => onChange({ showLandmarks })} />
        <SettingRow label="Show note effects" checked={prefs.showParticles} onCheckedChange={(showParticles) => onChange({ showParticles })} />
        <SettingRow label="Show motion trails" checked={prefs.showTrails} onCheckedChange={(showTrails) => onChange({ showTrails })} />
      </section>

      <section className="mt-5">
        <h3 className="mb-2 text-xs tracking-wide text-cream/70 uppercase">Background</h3>
        <div className="grid grid-cols-4 gap-2">
          {ENVIRONMENTS.map((environment) => (
            <button
              key={environment.id}
              type="button"
              onClick={() => onChange({ environment: environment.id })}
              className={`overflow-hidden rounded-2xl border text-left ${prefs.environment === environment.id ? "border-gold" : "border-white/15"}`}
            >
              <img src={environment.image} alt="" className="h-14 w-full object-cover" />
              <span className="block px-2 py-1 text-xs">{environment.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 space-y-3">
        <h3 className="text-xs tracking-wide text-cream/70 uppercase">Camera</h3>
        <SettingRow label="Mirror camera" checked={prefs.mirrorCamera} onCheckedChange={(mirrorCamera) => onChange({ mirrorCamera })} />
        <label className="block text-sm">
          Camera
          <select
            className="mt-1 w-full rounded-2xl border border-white/15 bg-white/10 px-3 py-2"
            value={prefs.cameraDeviceId}
            onChange={(event) => onChange({ cameraDeviceId: event.target.value })}
          >
            <option value="">Default camera</option>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || "Camera"}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <Button variant="dark" onClick={cameraStatus === "live" ? onCameraStop : onCameraStart}>
            {cameraStatus === "live" ? "Stop camera" : "Start camera"}
          </Button>
        </div>
        {cameraError ? <p className="text-sm text-pink">{messageFor(cameraError)}</p> : null}
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="dark" onClick={onShowTutorial}>
          Show tutorial
        </Button>
        <Button variant="ghost" onClick={onReset}>
          Reset preferences
        </Button>
      </div>
    </PanelDialog>
  );
}

function SettingRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm">
      {label}
      <Switch checked={checked} onCheckedChange={onCheckedChange} label={label} />
    </label>
  );
}

function messageFor(error: CameraErrorCode) {
  if (error === "denied") {
    return "Camera access is needed to make music with your hands. Please enable camera permission and try again.";
  }
  if (error === "missing") return "We couldn't find a camera on your device.";
  return "The camera could not start. Please try again.";
}

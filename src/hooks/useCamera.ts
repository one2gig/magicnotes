import { useCallback, useRef, useState } from "react";

export type CameraStatus = "idle" | "loading" | "live" | "stopped" | "error";
export type CameraErrorCode = "denied" | "missing" | "unknown";

function openStream(deviceId?: string) {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" }),
    },
  });
}

function classify(error: unknown): CameraErrorCode {
  if (!navigator.mediaDevices?.getUserMedia) return "missing";
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") return "denied";
    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") return "missing";
  }
  return "unknown";
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<CameraErrorCode | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const stop = useCallback(() => {
    generation.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("stopped");
  }, []);

  const start = useCallback(async (deviceId?: string) => {
    const ticket = generation.current + 1;
    generation.current = ticket;
    setStatus("loading");
    setError(null);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setError("missing");
      return false;
    }

    try {
      const stream = await openStream(deviceId);
      if (ticket !== generation.current) {
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }
      return await attachStream(stream, ticket);
    } catch (caught) {
      if (ticket !== generation.current) return false;
      if (deviceId) {
        try {
          const stream = await openStream();
          if (ticket !== generation.current) {
            stream.getTracks().forEach((track) => track.stop());
            return false;
          }
          return await attachStream(stream, ticket);
        } catch (fallbackError) {
          if (ticket !== generation.current) return false;
          setStatus("error");
          setError(classify(fallbackError));
          return false;
        }
      }
      setStatus("error");
      setError(classify(caught));
      return false;
    }

    async function attachStream(stream: MediaStream, ticket: number) {
      const video = videoRef.current;
      if (!video || ticket !== generation.current) {
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      if (ticket !== generation.current) {
        stream.getTracks().forEach((track) => track.stop());
        return false;
      }
      const listed = await navigator.mediaDevices.enumerateDevices();
      setDevices(listed.filter((device) => device.kind === "videoinput"));
      setStatus("live");
      return true;
    }
  }, []);

  return { videoRef, status, error, devices, start, stop };
}

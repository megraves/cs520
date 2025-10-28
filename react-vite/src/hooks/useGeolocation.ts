import { useCallback, useEffect, useRef, useState } from "react";

export type Geo = { lat: number; lng: number; accuracy?: number };
type PermState = "granted" | "denied" | "prompt" | "unknown";

function humanizeGeoError(code?: number, msg?: string) {
  switch (code) {
    case 1:
      return 'Permission denied — please allow "Location" in your browser’s site settings.';
    case 2:
      return "Position unavailable — the device cannot obtain a location right now (signal/network).";
    case 3:
      return "Timeout — getting your location took too long. Try again or move closer to a window.";
    default:
      return msg || "Geolocation not available.";
  }
}

export function useGeolocation(enabled = true) {
  const [pos, setPos] = useState<Geo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermState>("unknown");
  const [isSecure, setIsSecure] = useState<boolean>(true);
  const watchId = useRef<number | null>(null);

  // Check secure context (HTTPS or localhost) & observe permission state
  useEffect(() => {
    const secure = window.isSecureContext || location.hostname === "localhost";
    setIsSecure(secure);

    if ("permissions" in navigator && (navigator as any).permissions?.query) {
      (navigator as any).permissions.query({ name: "geolocation" }).then((res: any) => {
        setPermission(res.state as PermState);
        res.onchange = () => setPermission(res.state as PermState);
      }).catch(() => setPermission("unknown"));
    }
  }, []);

  // Single-shot request (useful as a manual retry)
  const requestOnce = useCallback(() => {
    if (!enabled || !("geolocation" in navigator)) {
      setError("Geolocation API not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });
        setError(null);
      },
      (err) => setError(humanizeGeoError(err.code, err.message)),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, [enabled]);

  // Continuous watch for real-time position updates
  useEffect(() => {
    if (!enabled) return;
    if (!("geolocation" in navigator)) {
      setError("Geolocation API not supported.");
      return;
    }
    // Prime with a one-time read to reduce initial wait
    requestOnce();

    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });
        setError(null);
      },
      (err) => setError(humanizeGeoError(err.code, err.message)),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [enabled, requestOnce]);

  return { pos, error, permission, isSecure, requestOnce };
}
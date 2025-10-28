// src/components/cards/CheckinMapCard.tsx
// A reusable card that renders:
// - an OpenStreetMap view (via MapView) with event & user markers and a radius circle,
// - live distance readout,
// - a proximity-gated "Check in" button,
// - optional geolocation diagnostics and a retry control.

import MapView from "../atoms/MapView";

type LatLng = { lat: number; lng: number };
type PermState = "granted" | "denied" | "prompt" | "unknown";

type Props = {
    // Event coordinates (null until resolved from DB or geocoding)
    eventPos: LatLng | null;

    // User’s current coordinates (null until available)
    userPos: LatLng | null;

    // Allowed proximity radius in meters for check-in
    radiusM: number;

    // Current straight-line distance user↔event (meters), or null if unknown
    distanceM: number | null;

    // Whether the user is within the allowed radius and can check in
    canCheckIn: boolean;

    // Handler invoked when the "Check in" button is clicked
    onCheckIn: () => void;

    // Optional: geolocation diagnostics / UX helpers
    geoError?: string | null;                 // human-readable geolocation error
    permission?: PermState;                   // browser permission state
    isSecure?: boolean;                       // HTTPS or localhost
    onRetryGeolocation?: () => void;          // manual retry trigger

    // Optional: map height (default 360px)
    height?: string;
};

export default function CheckinMapCard({
    eventPos,
    userPos,
    radiusM,
    distanceM,
    canCheckIn,
    onCheckIn,
    geoError,
    permission,
    isSecure = true,
    onRetryGeolocation,
    height = "360px",
}: Props) {
    // Initial map center preference:
    // 1) event position, 2) user position, 3) UMass fallback
    const initialCenter: [number, number] =
        (eventPos && [eventPos.lat, eventPos.lng]) ||
        (userPos && [userPos.lat, userPos.lng]) ||
        [42.391, -72.526];

    return (
        <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-md">
            <h3 className="text-lg font-semibold">Check-in</h3>

            <MapView
                center={initialCenter}
                userPos={userPos ? [userPos.lat, userPos.lng] : undefined}
                eventPos={eventPos ? [eventPos.lat, eventPos.lng] : undefined}
                eventRadius={radiusM}
                height={height}
            />

            <div className="text-sm text-gray-700 space-y-1">
                {!isSecure && (
                    <div className="text-red-600">
                        Current page is not HTTPS or localhost,location might be forbidden.
                    </div>
                )}
                {permission && <div>Permission Status:<b>{permission}</b></div>}
                {geoError && <div className="text-red-600">{geoError}</div>}
                {!userPos && !geoError && <div>Getting your location…</div>}
                {!eventPos && <div>Locating event on map…</div>}
                {distanceM != null && (
                    <div>
                        Distance to event:{" "}
                        <span className="font-semibold">{distanceM} m</span>{" "}
                        {canCheckIn ? "(within range)" : "(out of range)"}
                    </div>
                )}
                {onRetryGeolocation && (
                    <button
                        onClick={onRetryGeolocation}
                        className="mt-1 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        type="button"
                    >
                        Retry geolocation
                    </button>
                )}
            </div>

            <div className="pt-2">
                <button
                    disabled={!canCheckIn}
                    onClick={onCheckIn}
                    className={`w-full px-4 py-2 rounded ${canCheckIn
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    {canCheckIn ? "Check in" : `Move within ${radiusM}m to check in`}
                </button>
            </div>
        </div>
    );
}
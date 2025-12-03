// src/components/cards/InteractiveEventMapCard.tsx

import MapView from "../atoms/MapView";

type LatLng = { lat: number; lng: number };

/**
 * Normalized event shape for the interactive map.
 * - id/title: basic identification and label
 * - position: geographic coordinates (lat/lng) already resolved
 * - status: semantic state used for coloring markers and labels
 * - timeText: human-readable date/time range (e.g., "Thu, Oct 23 9 pm to 10 pm EDT")
 */
export type EventWithCoords = {
    id: string;
    title: string;
    position: LatLng;
    status?: "upcoming" | "live" | "past" | "holy_grail";
    timeText?: string;
    checkinCount?: number | null;
};

/**
 * Props for the InteractiveEventMapCard.
 * This card is responsible for:
 *  - rendering an interactive map centered on UMass Amherst
 *  - displaying markers for all events that have valid coordinates
 *  - optionally highlighting the user’s current position (if provided)
 */
type Props = {
    /** Events that already have valid coordinates and metadata for display. */
    events: EventWithCoords[];

    /**
     * Optional: user’s current position.
     * Currently unused for centering, but can be leveraged later
     * to highlight “nearby” events or dynamic recentering.
     */
    userPos?: LatLng | null;

    /** Optional: explicit height for the map viewport (CSS value). */
    height?: string;
};

/**
 * InteractiveEventMapCard
 *
 * High-level “card” component that wraps the MapView atom and
 * adapts it to the Campus Quest use case:
 *
 *  - Fixes the map center on the UMass Amherst campus
 *  - Forwards a list of event markers with titles, status, and time text
 *  - Shows a small textual summary under the map indicating how many
 *    events are currently being visualized
 */
export default function InteractiveEventMapCard({
    events,
    userPos,
    height = "550px",
}: Props) {
    const hasEvents = events && events.length > 0;

    // Logical center point for UMass Amherst campus
    const UMASS_AMHERST_CENTER: [number, number] = [42.391, -72.526];

    // Initial map center: always focus on the UMass campus area
    const initialCenter: [number, number] = UMASS_AMHERST_CENTER;

    return (
        <div className="bg-white rounded-xl p-5 flex flex-col gap-3 shadow-md h-full">
            <h3 className="text-lg font-semibold">Interactive Event Map</h3>

            <MapView
                center={initialCenter}
                userPos={userPos ? [userPos.lat, userPos.lng] : undefined}
                /**
                 * Adapt the higher-level EventWithCoords shape into
                 * the lean marker objects expected by MapView.
                 * MapView is responsible for:
                 *   - rendering the markers
                 *   - applying status-based marker colors
                 *   - showing tooltips for title/time/status
                 */
                eventMarkers={events.map((e) => ({
                    id: e.id,
                    title: e.title,
                    lat: e.position.lat,
                    lng: e.position.lng,
                    status: e.status,
                    timeText: e.timeText,
                    checkinCount: e.checkinCount,
                }))}
                height={height}
            />

            {/* Simple summary text indicating how many events are visible on the map */}
            <div className="text-sm text-gray-700 mt-1">
                {hasEvents
                    ? `Showing ${events.length} event${
                          events.length > 1 ? "s" : ""
                      } with known coordinates.`
                    : "No events with known coordinates to display."}
            </div>
        </div>
    );
}
// src/components/atoms/MapView.tsx
// Lightweight Leaflet map wrapper used by CheckinMapCard.
// Renders:
//  - event marker (custom red SVG) + optional radius circle
//  - user marker (default Leaflet blue pin)
//  - smart viewport fitting (event+user, or whichever exists)
// Notes:
//  - Icons are defined locally to avoid asset path issues in bundlers.
//  - Keep this component “dumb”: all business logic (distance, check-in) lives outside.

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Tooltip, CircleMarker, } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// --- User marker (blue pin, uses Leaflet's default PNGs) --------------------
import userMarker2x from "leaflet/dist/images/marker-icon-2x.png";
import userMarker from "leaflet/dist/images/marker-icon.png";
import userShadow from "leaflet/dist/images/marker-shadow.png";

const userIcon = L.icon({
    iconRetinaUrl: userMarker2x,
    iconUrl: userMarker,
    shadowUrl: userShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

// Add a tiny random offset (±delta degrees) to lat/lng
const jitterLatLng = (lat: number, lng: number, delta = 0.0002) => {
    const randomOffset = () => (Math.random() * 2 - 1) * delta; // ±delta
    return {
        lat: lat + randomOffset(),
        lng: lng + randomOffset(),
    };
};

// --- Event marker (custom red SVG teardrop) ---------------------------------
const eventIcon = L.divIcon({
    className: "",
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"
            fill="#ef4444" stroke="#b91c1c" stroke-width="1"/>
      <circle cx="12.5" cy="12.5" r="4" fill="white"/>
    </svg>
  `,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
});

type EventMarker = {
    id: string;
    title: string;
    lat: number;
    lng: number;
    status?: "upcoming" | "live" | "past" | "holy_grail";
    timeText?: string;
    checkinCount?: number | null;
};

// --- Public props -----------------------------------------------------------
type Props = {
    // Initial map center (used before FitBounds runs)
    center: LatLngExpression;

    // Optional positions for user and event
    userPos?: LatLngExpression;
    eventPos?: LatLngExpression;

    // Radius (meters) to draw around the event
    eventRadius?: number;

    // Map container height (CSS length)
    height?: string;

    // Multiple events
    eventMarkers?: EventMarker[];
    onMarkerClick?: (id: string) => void;
};

// --- Smart viewport fitting helper -----------------------------------------
// If both user and event exist -> fit bounds to both (with padding).
// Else center on whichever exists, with a reasonable zoom.
function FitBounds({ userPos, eventPos }: { userPos?: LatLngExpression; eventPos?: LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        if (userPos && eventPos) {
            const bounds = L.latLngBounds(userPos as any, eventPos as any);
            map.fitBounds(bounds.pad(0.25));
        } else if (eventPos) {
            map.setView(eventPos as any, 16);
        } else if (userPos) {
            map.setView(userPos as any, 16);
        }
    }, [userPos, eventPos, map]);
    return null;
}

// --- Main component ---------------------------------------------------------
export default function MapView({
    center,
    userPos,
    eventPos,
    eventRadius = 100,
    height = "320px",
    eventMarkers,
    onMarkerClick,
}: Props) {
    return (
        <div style={{ height }}>
            <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds userPos={userPos} eventPos={eventPos} />

                {eventPos && (
                    <>
                        <Marker position={eventPos} icon={eventIcon}>
                            <Popup>Event location</Popup>
                        </Marker>
                        <Circle center={eventPos} radius={eventRadius} />
                    </>
                )}

                {userPos && (
                    <Marker position={userPos} icon={userIcon}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}

                {/* New: Mutiple events for interactive event map */}
                {eventMarkers &&
                    eventMarkers.map((e) => {
                        const { lat, lng } = jitterLatLng(e.lat, e.lng);
                        
                        const statusLabel =
                            e.status === "live"
                                ? "Live now"
                                : e.status === "past"
                                    ? "Past event"
                                    : e.status === "holy_grail"
                                        ? "Holy Grail"
                                        : "Upcoming";

                        let statusColorClasses = "bg-blue-100 text-blue-700"; // 默认当作 upcoming

                        let markerColor = "#3b82f6";     // blue-500
                        let markerFillColor = "#bfdbfe"; // blue-200

                        if (e.status === "live") {
                            statusColorClasses = "bg-yellow-100 text-yellow-800";
                            markerColor = "#eab308";       // yellow-500
                            markerFillColor = "#fef9c3";   // yellow-100
                        } else if (e.status === "past") {
                            statusColorClasses = "bg-gray-200 text-gray-700";
                            markerColor = "#6b7280";       // gray-500
                            markerFillColor = "#e5e7eb";   // gray-200
                        } else if (e.status === "holy_grail") {
                            statusColorClasses = "bg-amber-100 text-amber-800";
                            markerColor = "#f5690bff";       // amber-500
                            markerFillColor = "#ffa64dff";   // amber-100
                        }


                        return (
                            <CircleMarker
                                key={e.id}
                                center={[lat, lng]}
                                radius={8}
                                pathOptions={{
                                    color: markerColor,
                                    fillColor: markerFillColor,
                                    fillOpacity: 0.9,
                                    weight: 2,
                                }}
                                eventHandlers={{
                                    click: () => onMarkerClick?.(e.id), // <-- navigate on click
                                }}
                            >
                                <Tooltip
                                    direction="top"
                                    offset={[0, -10]}
                                    opacity={0.95}
                                    sticky
                                >
                                    <div className="text-xs sm:text-sm">
                                        <div className="font-semibold">{e.title}</div>
                                        {e.timeText && (
                                            <div className="text-gray-700">{e.timeText}</div>
                                        )}
                                        {e.status !== "holy_grail" &&(
                                            <div>
                                                {e.checkinCount ?? 0} people checked in
                                            </div>
                                        )}
                                       
                                        <div className="mt-1">
                                            <span
                                                className={
                                                    "inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium " +
                                                    statusColorClasses
                                                }
                                            >
                                                {statusLabel}
                                            </span>
                                        </div>
                                        
                                    </div>
                                </Tooltip>
                            </CircleMarker>
                        );
                    })
                }
            </MapContainer>
        </div>
    );
}
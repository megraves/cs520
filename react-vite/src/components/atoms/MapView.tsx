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
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
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
            </MapContainer>
        </div>
    );
}
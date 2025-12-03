// src/components/cards/LocationPicker.tsx
// A searchable map picker for event location.
// Features:
//  - Text search via Nominatim (OSM) with optional UMass-bound search window
//  - Result dropdown overlaying the map
//  - Draggable marker to fine-tune coordinates
//  - One-way externalQuery prop to mirror parent text into the search box
//  - Emits {lat, lng, label} via onChange whenever a valid selection exists

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@heroui/react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Red teardrop SVG marker for the selected point
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

type LatLng = { lat: number; lng: number };
type Result = { display_name: string; lat: string; lon: string };

type Props = {
    // Optional initial value (for edit mode / echo)
    value?: { lat: number; lng: number; label?: string } | null;

    // Called when we have both coordinates and a label
    onChange: (v: { lat: number; lng: number; label: string }) => void;

    // Map height (CSS length)
    height?: string;

    // If true, constrain the search to a UMass/Amherst viewbox
    restrictToUMass?: boolean;

    // One-way text mirror from parent (does not overwrite parent on local edits)
    externalQuery?: string;
};

// Helper: center the map whenever the selected position changes
function FitTo({ position }: { position?: LatLng | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.setView([position.lat, position.lng], 16);
    }, [position, map]);
    return null;
}

export default function LocationPicker({
    value = null,
    onChange,
    height = "280px",
    restrictToUMass = true,
    externalQuery,
}: Props) {
    // Search box text
    const [query, setQuery] = useState(value?.label ?? "");

    // Selected coordinates (from a result or drag)
    const [selected, setSelected] = useState<LatLng | null>(value ? { lat: value.lat, lng: value.lng } : null);

    // Human-readable label (display_name or a lat/lng fallback)
    const [label, setLabel] = useState<string>(value?.label ?? "");

    // Search results and loading state
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<number | null>(null);

    // UMass Amherst fallback center
    const defaultCenter: LatLngExpression = [42.391, -72.526];

    // One-way mirror: when parent changes externalQuery, reflect it into the input box
    useEffect(() => {
        if (selected && label) onChange({ ...selected, label });
    }, [selected, label, onChange]);

    useEffect(() => {
        if (externalQuery !== undefined && externalQuery !== query) {
            setQuery(externalQuery);
        }
    }, [externalQuery]);

    // Debounced Nominatim search
    useEffect(() => {
        if (!query || query.trim().length < 2) {
            setResults([]);
            return;
        }
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    format: "json",
                    limit: "5",
                    addressdetails: "0",
                    "accept-language": "en",
                    q: query.trim(),
                });
                if (restrictToUMass) {
                    params.set("viewbox", "-72.56,42.42,-72.50,42.36"); // lon_min,lat_max,lon_max,lat_min
                    params.set("bounded", "1");
                    params.set("countrycodes", "us");
                }
                const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
                const res = await fetch(url, { headers: { "Accept-Language": "en" } });
                const data = (await res.json()) as Result[];
                setResults(Array.isArray(data) ? data : []);
            } catch (e) {
                console.warn("Nominatim search failed", e);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);
        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
    }, [query, restrictToUMass]);

    // Keep internal selection in sync when parent updates value (edit mode)
    useEffect(() => {
        if (!value) return;
        const needSync =
            value.lat !== selected?.lat ||
            value.lng !== selected?.lng ||
            (value.label ?? "") !== label;

        if (needSync) {
            setSelected({ lat: value.lat, lng: value.lng });
            setLabel(value.label ?? "");
            // Intentionally not forcing query here to avoid fighting externalQuery
        }
    }, [value]);

    // Choose one of the search results
    const choose = (r: Result) => {
        const p = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
        setSelected(p);
        setLabel(r.display_name);
        setQuery(r.display_name);
        setResults([]);
    };

    // Allow fine-tuning by dragging the marker
    const onDragEnd = (e: L.LeafletEvent) => {
        const m = e.target as L.Marker;
        const p = m.getLatLng();
        setSelected({ lat: p.lat, lng: p.lng });
        if (!label) setLabel(`${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`);
    };

    // Decide map center
    const mapCenter = useMemo<LatLngExpression>(() => {
        if (selected) return [selected.lat, selected.lng];
        return defaultCenter;
    }, [selected]);

    return (
        <div className="bg-white rounded-xl p-4 shadow-md w-full">
            <h3 className="text-base font-semibold mb-2">Select Location</h3>

            {/* Search box + results dropdown */}
            <div className="relative">
                <Input
                    placeholder="e.g., Campus Center, UMass Amherst"
                    value={query}
                    onValueChange={setQuery}
                    isClearable
                />
                {/* Results list overlays the map (high z-index to avoid being hidden by Leaflet layers) */}
                {results.length > 0 && (
                    <ul className="z-20 mt-1 w-full max-h-56 overflow-auto bg-white border rounded-lg shadow">
                        {results.map((r, i) => (
                            <li
                                key={i}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => choose(r)}
                            >
                                {r.display_name}
                            </li>
                        ))}
                        {loading && <li className="px-3 py-2 text-gray-500 text-sm">Searching…</li>}
                    </ul>
                )}
            </div>

            {/* Map */}
            <div className="mt-3 w-full" style={{ height }}>
                <MapContainer center={mapCenter} zoom={selected ? 16 : 14} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FitTo position={selected} />
                    {selected && (
                        <Marker
                            position={[selected.lat, selected.lng]}
                            draggable
                            eventHandlers={{ dragend: onDragEnd as any }}
                            icon={eventIcon}
                        >
                            <Popup>{label || "Drag to fine-tune"}</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {/* Selection echo */}
            <div className="mt-3 text-sm text-gray-700">
                <div>
                    <span className="font-medium">Chosen: </span>
                    {label ? label : "—"}
                </div>
                <div className="text-xs text-gray-500">
                    {selected ? `${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}` : "Pick a point on map"}
                </div>
            </div>
        </div>
    );
}
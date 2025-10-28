
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Background from "../atoms/Background";
import GoHeader from "../atoms/GoHeader";
import LoadingSpinner from "../Loading";
import CheckinMapCard from "../cards/CheckinMapCard"
import { useGeolocation } from "../../hooks/useGeolocation";

// Toggle: persist geocoding results back to DB when coordinates are missing
const ENABLE_GEOCODE_BACKFILL = false;

type Event = {
  event_id: string;
  title: string;
  location: string;
  date_time_text: string;
  url?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  image_url?: string;
  // Location fields persisted in DB (new)
  event_lat?: number | null;
  event_lng?: number | null;
};

// --- Location feature: check-in radius (meters). Within this, "Check in" is enabled.
const CHECKIN_RADIUS_M = 100;

// Haversine helper to compute straight-line distance in meters between two lat/lng points
function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371e3;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

// --- Location feature: forward geocoding fallback (address -> lat/lng via Nominatim/OSM)
// Note: for production, move this to a backend/Edge Function with rate-limiting & caching.
async function geocodeByText(q: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}&addressdetails=0`;
  try {
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
      },
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  return null;
}


const GoMode = () => {
  const { questId } = useParams<{ questId: string }>();
  const [quest, setQuest] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- Location feature: event coordinates resolved for the map (from DB or geocoding)
  const [eventPos, setEventPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoErr, setGeoErr] = useState<string | null>(null);

  // --- Location feature: real-time user geolocation (watchPosition)
  const { pos: userPos, error: geoError, permission, isSecure, requestOnce } = useGeolocation(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuest = async () => {
      if (!questId) return;

      const { data, error } = await supabase
        .from("daily_event_calendar")
        .select("*")
        .eq("event_id", questId)
        .single();

      if (error) {
        console.error("Error fetching quest:", error);
      } else {
        setQuest(data);
      }
      setLoading(false);
    };

    fetchQuest();
  }, [questId]);

  // --- Location feature: prefer DB lat/lng; otherwise geocode the textual address once.
  // Optionally backfill the DB with the geocoded coordinates (controlled by flag).
  useEffect(() => {
    (async () => {
      if (!quest) return;

      // 1) Use persisted coordinates when available
      if (quest.event_lat != null && quest.event_lng != null) {
        setEventPos({ lat: quest.event_lat, lng: quest.event_lng });
        return;
      }

      // 2) Fallback: geocode the address string
      if (quest.location) {
        const p = await geocodeByText(quest.location);
        setEventPos(p);

        // 3) Optional DB backfill (only if columns are still NULL)
        if (p && ENABLE_GEOCODE_BACKFILL) {
          const { error: upErr } = await supabase
            .from("daily_event_calendar")
            .update({ event_lat: p.lat, event_lng: p.lng })
            .eq("event_id", quest.event_id)
            .is("event_lat", null)
            .is("event_lng", null);
          if (upErr) console.warn("Backfill geocode skipped:", upErr.message);
        }
      }
    })();
  }, [quest]);

  // Surface geolocation errors (human readable) for the card
  useEffect(() => {
    setGeoErr(geoError ?? null);
  }, [geoError]);

  // --- Location feature: live distance between user and event
  const distanceM = useMemo(() => {
    if (!userPos || !eventPos) return null;
    return Math.round(haversineMeters(userPos, eventPos));
  }, [userPos, eventPos]);

  const canCheckIn = !!distanceM && distanceM <= CHECKIN_RADIUS_M;

  // --- Location feature: where check-in will eventually persist to Supabase (demo for now)
  const handleCheckIn = async () => {
    alert("✅ Checked in! (demo)\nWe will persist this in Supabase in the next step.");
  };


  if (loading) return <LoadingSpinner></LoadingSpinner>;
  if (!quest) return <div>Quest not found!</div>;

  return (
    <Background>
        <GoHeader></GoHeader>
        <div className="flex justify-center mt-10">
            <div className="bg-white rounded-xl w-2/3 p-8 flex flex-col gap-6 shadow-md">
            
            
            <h1 className="text-2xl font-bold">{quest.title}</h1>
            <p className="text-gray-600">{quest.location}</p>
            <p className="text-gray-500">{quest.date_time_text}</p>

            <CheckinMapCard
              eventPos={eventPos}
              userPos={userPos ?? null}
              radiusM={CHECKIN_RADIUS_M}
              distanceM={distanceM}
              canCheckIn={canCheckIn}
              onCheckIn={handleCheckIn}
              geoError={geoErr}
              permission={permission}
              isSecure={isSecure}
              onRetryGeolocation={requestOnce}
              height="360px"
            />

            {quest.image_url && (
                <img src={quest.image_url} alt={quest.title} className="my-4 rounded" />
            )}
            {quest.url && (
                <a
                href={quest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline mt-3 inline-block"
                >
                Go to Event Website
                </a>
            )}

            <button
                onClick={() => navigate(-1)}
                className="mt-5 px-4 py-2 bg-gray-200 rounded"
            >
                Back
            </button>
        </div>
    </div>
    </Background>
  );
};

export default GoMode;

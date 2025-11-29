import HomeHeader from "../atoms/HomeHeader";
import Background from "../atoms/Background";
import QuestCard from "../cards/QuestCard";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "../Loading";
//import CreateEventCard from "../cards/CreateEventCard";
import { useNavigate } from "react-router-dom";
import InteractiveEventMapCard, { type EventWithCoords } from "../cards/InteractiveEventMapCard";
import { getEventStatus } from "../../utils/eventTime";

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
  creator?: string | null;

  event_lat?: number | null;
  event_lng?: number | null;
};

export default function HomePage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    //const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from("daily_event_calendar")
                .select("*")
                .order("date_time_text", { ascending: true });

            if (error) {
                console.error("Error fetching events:", error);
            } else {
                setEvents(data || []);
            }
            setLoading(false);
        };

        fetchEvents();
    }, []);

    if (loading) return <LoadingSpinner></LoadingSpinner>;
    // 只取有经纬度的事件，映射成 EventWithCoords
    const eventsWithCoords: EventWithCoords[] = events
        .filter((e) => e.event_lat != null && e.event_lng != null)
        .map((e) => {
        const now = new Date();
        const status = getEventStatus(e.date, e.start_time, e.end_time, now);

        return {
        id: e.event_id,
        title: e.title,
        position: {
            lat: e.event_lat as number,
            lng: e.event_lng as number,
        },
        timeText: e.date_time_text, 
        status,                     
        };
        }
    );
    return (
        <Background>
            <HomeHeader></HomeHeader>

            <div className="flex justify-center gap-4 mt-6">

                {/* Enter My Events Page */}
                <button
                onClick={() => navigate("/my-events")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                >
                My Events
                </button>
            </div>

            {/* events + interactive map */}
            <div className="flex flex-row w-full px-20 mt-6 gap-6 h-[70vh]">
            {/* left: events */}
            <div className="bg-white rounded-xl basis-2/5 p-5 flex flex-col gap-5 overflow-y-auto shadow">
                {events.length === 0 ? (
                <p>No events found.</p>
                ) : (
                events.map((event) => (
                    <QuestCard
                    key={event.event_id}
                    questId={event.event_id}
                    title={event.title}
                    location={event.location}
                    creator={event.creator ?? null}
                    />
                ))
                )}
            </div>

            {/* right: map */}
            <div className="basis-3/5 h-full">
                <InteractiveEventMapCard events={eventsWithCoords} />
            </div>
            </div>
        </Background>
    );
};


import HomeHeader from "../atoms/HomeHeader";
import Background from "../atoms/Background";
import LabeledButton from "../buttons/LabeledButton";
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
  event_date?: string;
  image_url?: string;
  creator?: string | null;

  event_lat?: number | null;
  event_lng?: number | null;

  checkin_count?: number | null; 
};

const parseTimeToMinutes = (timeStr?: string | null) => {
  if (!timeStr) return null;

  const cleaned = timeStr.replace(/\s+/g, '').toLowerCase();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/);

  if (!match) return null;

  const hoursStr = match[1];       // string from regex
  const minutesStr = match[2];     // string or undefined
  const period = match[3];         // "am" or "pm"

  let hours = parseInt(hoursStr, 10);      // now hours is a number
  const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes; // total minutes
};



export default function HomePage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    //const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    const today = new Date()
    const localToday = today.toLocaleDateString('sv-SE'); // YYYY-MM-DD format

    useEffect(() => {
    const fetchEvents = async () => {
        const { data, error } = await supabase
        .from("daily_event_calendar_with_stats")
        .select("*")
        .eq('event_date', localToday);

        if (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
        } else {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const upcomingEvents = (data || [])
            .filter(e => {
            const endMinutes = parseTimeToMinutes(e.end_time);
            // Include events that haven't ended yet or with no end_time
            return endMinutes === null || endMinutes > currentMinutes;
            })
            .sort((a, b) => {
            const aTime = parseTimeToMinutes(a.end_time);
            const bTime = parseTimeToMinutes(b.end_time);

            if (aTime === null) return 1;
            if (bTime === null) return -1;

            return aTime - bTime;
            });

        setEvents(upcomingEvents);
        }
        setLoading(false);
    };

    fetchEvents();
    }, []);


    if (loading) return <LoadingSpinner></LoadingSpinner>;
    // Get events that have event_lat&event_lng EventWithCoords
    const eventsWithCoords: EventWithCoords[] = events
        .filter((e) => e.event_lat != null && e.event_lng != null)
        .map((e) => {
        const now = new Date();
        const status = getEventStatus(e.event_date, e.start_time, e.end_time, now);

        return {
        id: e.event_id,
        title: e.title,
        position: {
            lat: e.event_lat as number,
            lng: e.event_lng as number,
        },
        timeText: e.date_time_text, 
        status,  
        checkinCount: e.checkin_count ?? 0,                   
        };
        }
    );
    return (
        <Background>
            <HomeHeader>
                <LabeledButton
                    onClick={() => navigate("/my-events")}
                    ariaLabel="My Events"
                />
            </HomeHeader>

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
                    time={event.start_time ?? null}
                    isVirtual={!event.location}
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


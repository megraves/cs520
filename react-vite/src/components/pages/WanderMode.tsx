import HomeHeader from "../atoms/HomeHeader";
import Background from "../atoms/Background";
import QuestCard from "../cards/QuestCard";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "../Loading";
//import CreateEventCard from "../cards/CreateEventCard";
import { useNavigate } from "react-router-dom";

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

            <div className="flex flex-row w-1/2"> 
                <div className="bg-white rounded-xl w-2/3 h-screen m-20 p-5 flex flex-col gap-5 overflow-y-auto">
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
            </div>     
        </Background>
    );
};


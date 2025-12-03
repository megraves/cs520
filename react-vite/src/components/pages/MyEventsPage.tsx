import { useEffect, useState, useCallback } from "react";
import Background from "../atoms/Background";
import HomeHeader from "../atoms/HomeHeader";
import LoadingSpinner from "../Loading";
import EventFormCard from "../cards/ModifyEventCard";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import LabeledButton from "../buttons/LabeledButton";

type Event = {
  event_id: string;
  title: string;
  location: string;
  date_time_text: string;
  url?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  image_url?: string | null;
  description?: string | null;
  creator?: string | null;
};

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState<"create" | "edit" | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setLoading(false);
        return;
      }
      setUserId(user?.id ?? null);
    })();
  }, []);

  const fetchMyEvents = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_event_calendar")
      .select("*")
      .eq("creator", userId)
      .order("date_time_text", { ascending: true });

    if (!error) {
        setEvents(data || []);
    } else {
        console.error("Error fetching my events:", error);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchMyEvents();
  }, [userId, fetchMyEvents]);

  const onSuccess = useCallback(() => {
    setShowForm(null);
    setSelectedEvent(null);
    fetchMyEvents();
  }, [fetchMyEvents]);

  const handleDelete = useCallback(async (eventId: string) => {
    if (!confirm("Delete this event?")) return;
    setBusyIds(p => ({ ...p, [eventId]: true }));
    try {
      const { error } = await supabase
        .from("daily_event_calendar")
        .delete()
        .eq("event_id", eventId)
        .eq("creator", userId);
      if (error) throw error;
      setEvents(prev => prev.filter(e => e.event_id !== eventId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusyIds(p => {
        const { [eventId]: _, ...rest } = p;
        return rest;
      });
    }
  }, [userId]);

  if (loading) return <LoadingSpinner />;

  return (
    <Background>
      <HomeHeader>
        {/* Return to Home Page */}
        <LabeledButton
          onClick={() => navigate("/home")}
          ariaLabel="Home"
        />
      </HomeHeader>

      <div className="w-full mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-20 p-20 items-start">
        {/* Left: Create/Edit */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {showForm === "edit" ? "Edit Event" : "My Events"}
            </h2>
            <LabeledButton
                onClick={() => {
                    // Stop current create/edit
                    if (showForm === "create" || showForm === "edit") {
                    setShowForm(null);
                    setSelectedEvent(null);
                    } else {
                    // enter create mode
                    setShowForm("create");
                    }
                }}
                ariaLabel={showForm === "create"
                    ? "Cancel"
                    : showForm === "edit"
                    ? "Cancel"
                    : "Create New"}
                  className="sm:text-md md:text-md px-3 py-2"
                >
            </LabeledButton>
          </div>

          {showForm === "create" && <EventFormCard mode="create" onSuccess={onSuccess} />}
          {showForm === "edit" && selectedEvent && (
            <EventFormCard
              mode="edit"
              existingEvent={selectedEvent}
              onSuccess={onSuccess}
            />
          )}
        </div>

        {/* Right: List of My Events */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Created by Me</h2>
          {events.length === 0 ? (
            <p className="text-gray-600">You haven't created any events yet.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((ev) => (
                <li
                  key={ev.event_id}
                  className="shadow-md rounded-xl p-4 flex items-start justify-between"
                >
                  <div className="pr-4">
                    <div className="font-medium text-base">{ev.title}</div>
                    <div className="text-sm text-gray-700 mt-1">{ev.location}</div>
                    <div className="text-sm text-gray-500">{ev.date_time_text}</div>
                  </div>
                  <div className="flex gap-2">
                    <LabeledButton
                      onClick={() => {
                        setSelectedEvent(ev);
                        setShowForm("edit");
                      }}
                      ariaLabel="Edit"
                      className="sm:text-md md:text-md px-3 py-1 border"
                    >
                    </LabeledButton>
                    <LabeledButton
                      onClick={() => handleDelete(ev.event_id)}
                      disabled={!!busyIds[ev.event_id]}
                      className="sm:text-md md:text-md px-3 py-1 bg-red-600 text-white hover:bg-red-400 disabled:opacity-50"
                      ariaLabel= {busyIds[ev.event_id] ? "Deleting..." : "Delete"}
                    >
                    </LabeledButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Background>
  );
}
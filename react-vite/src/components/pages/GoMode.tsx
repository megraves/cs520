
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Background from "../atoms/Background";
import GoHeader from "../atoms/GoHeader";
import LoadingSpinner from "../Loading";

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
};

const GoMode = () => {
  const { questId } = useParams<{ questId: string }>();
  const [quest, setQuest] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

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

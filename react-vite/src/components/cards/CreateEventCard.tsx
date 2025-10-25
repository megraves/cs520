import LabeledButton from "../buttons/LabeledButton";
import { Form, Input, Textarea } from "@heroui/react";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Props = {
  onCreated?: () => void;
};

const CreateEventCard = ({ onCreated }: Props) => {
  // Necessary
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Optional
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!title || !location || !date || !startTime || !endTime) {
        throw new Error("Please fill in all required fields.");
      }

      //Generate date_time_text
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const dateTimeText = `${formattedDate} ${startTime} to ${endTime}`;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const newEvent = {
        event_id: crypto.randomUUID(),
        title,
        location,
        date_time_text: dateTimeText,
        date,
        start_time: startTime,
        end_time: endTime,
        image_url: imageUrl || null,
        description: description || null,
        creator: user?.id ?? null,
      };

      const { error } = await supabase
        .from("daily_event_calendar")
        .insert([newEvent]);

      if (error) throw error;

      // All requirentments met, create event
      setTitle("");
      setLocation("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setImageUrl("");
      setDescription("");

      alert("Event created successfully!");
      if (onCreated) onCreated();
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto rounded-2xl overflow-hidden p-6 sm:max-w-md md:max-w-lg lg:max-w-xl bg-white shadow-md">
      <Form className="w-full justify-center items-center space-y-7" onSubmit={handleSubmit}>
        <div className="flex w-full flex-col flex-wrap gap-7">
          <h1 className="text-xl font-semibold">Create Event</h1>

          {/* Necessary */}
          <Input
            isRequired
            label="Title"
            placeholder="Event title"
            value={title}
            onValueChange={setTitle}
          />

          <Input
            isRequired
            label="Location"
            placeholder="Where is the event?"
            value={location}
            onValueChange={setLocation}
          />

          {/* Date */}
          <Input
            isRequired
            type="date"
            label="Date"
            value={date}
            onValueChange={setDate}
          />

          {/* Time */}
          <div className="flex flex-row gap-4">
            <Input
              isRequired
              type="time"
              label="Start Time"
              value={startTime}
              onValueChange={setStartTime}
              className="flex-1"
            />
            <Input
              isRequired
              type="time"
              label="End Time"
              value={endTime}
              onValueChange={setEndTime}
              className="flex-1"
            />
          </div>

          {/* Optional */}
          <Input
            label="Image URL (optional)"
            placeholder="https://example.com/photo.jpg"
            value={imageUrl}
            onValueChange={setImageUrl}
          />

          {/* Optional */}
          <Textarea
            label="Description (optional)"
            placeholder="Enter a short description of the event"
            value={description}
            onValueChange={setDescription}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <LabeledButton
            type="submit"
            ariaLabel="Submit new event"
            label={loading ? "Creating..." : "Create Event"}
            loading={loading}
          />
        </div>
      </Form>
    </div>
  );
};

export default CreateEventCard;
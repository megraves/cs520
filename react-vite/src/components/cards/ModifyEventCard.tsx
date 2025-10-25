import LabeledButton from "../buttons/LabeledButton";
import { Form, Input, Textarea } from "@heroui/react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

type Props = {
  mode?: "create" | "edit";
  existingEvent?: any;
  onSuccess?: () => void;
};
//  24h to am/pm
const toAmPm = (hour: number, minute: number): string => {
  const suffix = hour >= 12 ? "pm" : "am";
  const displayHour = ((hour + 11) % 12 + 1);
  const hh = displayHour.toString().padStart(2, "0");
  if (minute === 0) {
    // "On the hour like 9 pm"
    return `${displayHour} ${suffix}`;
  }
  const mm = minute.toString().padStart(2, "0");
  return `${hh}:${mm}${suffix}`;
};

const fromAmPm = (timeStr: string): [string, string] => {
  if (!timeStr) return ["", ""];
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2})(?::(\d{2}))?\s?(AM|PM)$/);
  if (!match) return ["", ""];

  let [, h, m, suffix] = match;
  let hour = parseInt(h, 10);
  const minute = m ? parseInt(m, 10) : 0;

  if (suffix === "PM" && hour < 12) hour += 12;
  if (suffix === "AM" && hour === 12) hour = 0;

  return [hour.toString().padStart(2, "0"), minute.toString().padStart(2, "0")];
};

const formatDateTimeText = (date: string, startTime: string, endTime: string): string => {
  if (!date || !startTime || !endTime) return "";

  // Parse the date we get from input
  const d = new Date(date + "T00:00:00"); // Time zone

  // Format date，如 "Thu, Oct 23"
  const formattedDate = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Get current timezone（like "EDT", "PST"）
  const tz = Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName")?.value || "";

  // Assemble
  return `${formattedDate} ${startTime} to ${endTime} ${tz}`;
};

const ModifyEventCard = ({ mode = "create", existingEvent, onSuccess }: Props) => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");

  // Auto fill
  useEffect(() => {
    if (mode === "edit" && existingEvent) {
      setTitle(existingEvent.title || "");
      setLocation(existingEvent.location || "");
      setDate(existingEvent.date || "");
      setImageUrl(existingEvent.image_url || "");
      setDescription(existingEvent.description || "");
      // Split time
      const [sh, sm] = fromAmPm(existingEvent.start_time || "");
      const [eh, em] = fromAmPm(existingEvent.end_time || "");

      setStartHour(sh ?? "");
      setStartMinute(sm ?? "");
      setEndHour(eh ?? "");
      setEndMinute(em ?? "");
    }
  }, [mode, existingEvent]);

  const validateField = {
  title: (v: string) => (!v ? "Title is required." : null),
  location: (v: string) => (!v ? "Location is required." : null),
  date: (v: string) => (!v ? "Please choose a date." : null),

  // Validate time（4input: startHour, startMinute, endHour, endMinute）
  time: (sh: string, sm: string, eh: string, em: string) => {
        if (!sh || !sm || !eh || !em) {
        return "Please fill in all time fields.";
        }

        // string to int
        const h1 = parseInt(sh, 10), m1 = parseInt(sm, 10);
        const h2 = parseInt(eh, 10), m2 = parseInt(em, 10);

        // not int
        if ([h1, m1, h2, m2].some(isNaN)) {
        return "Time must contain only numbers.";
        }

        // range valid
        if (h1 < 0 || h1 > 23 || h2 < 0 || h2 > 23 || m1 < 0 || m1 > 59 || m2 < 0 || m2 > 59) {
        return "Enter valid 24-hour time (00–23 for hours, 00–59 for minutes).";
        }

        // order valid
        if (h1 > h2 || (h1 === h2 && m1 >= m2)) {
        return "End time must be later than start time.";
        }

        return null;
    },
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const timeError = validateField.time(startHour, startMinute, endHour, endMinute);
    const titleError = validateField.title(title);
    const locationError = validateField.location(location);
    const dateError = validateField.date(date);

    if (timeError || titleError || locationError || dateError) {
      setError(timeError || titleError || locationError || dateError);
      setLoading(false);
      return;
    }

    try {
      const startTime = toAmPm(parseInt(startHour, 10), parseInt(startMinute, 10));
      const endTime   = toAmPm(parseInt(endHour, 10), parseInt(endMinute, 10));
      const dateTimeText = formatDateTimeText(date, startTime, endTime);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      if (mode === "create") {
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
          creator: user.id,
        };
        const { error } = await supabase.from("daily_event_calendar").insert([newEvent]);
        if (error) throw error;
        alert("Event created successfully!");
      } else {
        const { error } = await supabase
          .from("daily_event_calendar")
          .update({
            title,
            location,
            date,
            start_time: startTime,
            end_time: endTime,
            image_url: imageUrl || null,
            description: description || null,
            date_time_text: dateTimeText,
          })
          .eq("event_id", existingEvent.event_id)
          .eq("creator", user.id);
        if (error) throw error;
        alert("Event updated successfully!");
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto rounded-2xl overflow-hidden p-6 sm:max-w-md md:max-w-lg lg:max-w-xl bg-white shadow-md">
      <Form className="w-full space-y-6" onSubmit={handleSubmit}>
        <h1 className="text-xl font-semibold">
          {mode === "edit" ? "Edit Event" : "Create Event"}
        </h1>

        <Input
          isRequired
          label="Title"
          value={title}
          onValueChange={setTitle}
          isInvalid={!!validateField.title(title)}
          errorMessage={validateField.title(title)}
          classNames={{
              errorMessage: "text-xs mt-0.5 text-red-500", 
              inputWrapper: "border-red-500",             
          }}
        />

        <Input
          isRequired
          label="Location"
          value={location}
          onValueChange={setLocation}
          isInvalid={!!validateField.location(location)}
          errorMessage={validateField.location(location)}
          classNames={{
              errorMessage: "text-xs mt-0.5 text-red-500", 
              inputWrapper: "border-red-500",             
          }}
        />

        <Input
          isRequired
          type="date"
          label="Date"
          value={date}
          onValueChange={setDate}
          isInvalid={!!validateField.date(date)}
          errorMessage={validateField.date(date)}
          classNames={{
              errorMessage: "text-xs mt-0.5 text-red-500", 
              inputWrapper: "border-red-500",             
          }}
        />

        {/* === Start & End Time === */}
        <div className="flex flex-col gap-3">
        <label className="text-sm font-medium">Start Time</label>
        <div className="flex items-center gap-2">
            <Input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="HH"
            className="w-16"
            value={startHour}
            onValueChange={(v) => setStartHour(v.replace(/\D/g, ""))}
            />
            <span className="text-lg font-bold">:</span>
            <Input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="MM"
            className="w-16"
            value={startMinute}
            onValueChange={(v) => setStartMinute(v.replace(/\D/g, ""))}
            />
        </div>

        <label className="text-sm font-medium mt-3">End Time</label>
        <div className="flex items-center gap-2">
            <Input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="HH"
            className="w-16"
            value={endHour}
            onValueChange={(v) => setEndHour(v.replace(/\D/g, ""))}
            />
            <span className="text-lg font-bold">:</span>
            <Input
            type="text"
            inputMode="numeric"
            maxLength={2}
            placeholder="MM"
            className="w-16"
            value={endMinute}
            onValueChange={(v) => setEndMinute(v.replace(/\D/g, ""))}
            />
        </div>
        {validateField.time(startHour, startMinute, endHour, endMinute) && (
            <p className="text-red-600 text-sm mt-1">
            {validateField.time(startHour, startMinute, endHour, endMinute)}
            </p>
        )}
        </div>

        <Input label="Image URL" value={imageUrl} onValueChange={setImageUrl} />
        <Textarea label="Description" value={description} onValueChange={setDescription} />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <LabeledButton
          type="submit"
          ariaLabel="Submit"
          label={loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Event"}
          loading={loading}
        />
      </Form>
    </div>
  );
};

export default ModifyEventCard;
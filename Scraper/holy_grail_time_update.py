from datetime import datetime, timedelta
import pytz
import random
from supabase import create_client, Client

SUPABASE_URL = "https://ykkcqgkkmwiaagynteri.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlra2NxZ2trbXdpYWFneW50ZXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjEyNDgsImV4cCI6MjA3Njc5NzI0OH0.HDmC6VT6N_iTzNFVECaNedoVG8CIaAVbmddooqWg7E4"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

tz = pytz.timezone("America/New_York")
now = datetime.now(tz)
today_str = now.strftime("%Y-%m-%d")

start_time = now.replace(minute=0, second=0, microsecond=0)
end_time = start_time + timedelta(hours=1)

start_str = start_time.strftime("%I:%M %p").lower()
end_str = end_time.strftime("%I:%M %p").lower()

resp = supabase.table("grail_locations").select("*").eq("date", today_str).execute()
grails = resp.data

if not grails:
    print("No grails for today.")
    exit()

previous_active = None
for g in grails:
    if g.get("start_time") is not None:
        previous_active = g["id"]
        break

print("Previous active grail:", previous_active)

eligible = [g for g in grails if g["id"] != previous_active]

if not eligible:
    chosen = grails[0]
else:
    chosen = random.choice(eligible)

chosen_id = chosen["id"]
print("New chosen grail:", chosen_id)


# THIS WILL OVERWRITE CHECKINS BUT SINCE WE DON'T USE ANYWAYS ITS FINE
updates = []
for g in grails:
    if g["id"] == chosen_id:
        updates.append({
            "id": g["id"],
            "date":g["date"],
            "lat":g["lat"],
            "long": g["long"],
            "checkin_count": g["checkin_count"],
            "start_time": start_str,
            "end_time": end_str
        })
    else:
        updates.append({
            "id": g["id"],
            "date":g["date"],
            "lat":g["lat"],
            "long": g["long"],
            "checkin_count": g["checkin_count"],
            "start_time": None,
            "end_time": None
        })

supabase.table("grail_locations").upsert(updates, on_conflict="id").execute()

print("Rotated grail successfully.")

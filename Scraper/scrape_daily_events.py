import requests
from bs4 import BeautifulSoup
from datetime import datetime
from supabase import create_client, Client
import hashlib
from utils import parse_date_time_text

URL = "https://events.umass.edu/calendar"
response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")

today_month_day = datetime.now().strftime("%b %d")
events = []

cards = soup.find_all(
    "div", class_=lambda x: x and "em-card" in x and "em-event-" in x
)

import requests
from bs4 import BeautifulSoup
from datetime import datetime

URL = "https://events.umass.edu/calendar"
response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")

today_month_day = datetime.now().strftime("%b %d")
events = []

cards = soup.find_all(
    "div", class_=lambda x: x and "em-card" in x and "em-event-" in x
)

for card in cards:
    img_elem = card.select_one(".em-card_image a img.img_card")
    image_url = img_elem["src"] if img_elem else None

    text_elem = card.select_one(".em-card_text")
    if not text_elem:
        continue

    title_elem = text_elem.find("a", string=True)
    title = title_elem.get_text(strip=True) if title_elem else "No title"
    url = title_elem["href"] if title_elem else None

    datetime_elem = text_elem.select_one("em-local-time")
    if datetime_elem:
        date_time_text = datetime_elem.get_text(strip=True)
        date, start_time, end_time = parse_date_time_text(date_time_text)
    else:
        start_time = end_time = date_time_text = None

    location_elem = text_elem.select(".em-card_event-text a")
    location = location_elem[-1].get_text(strip=True) if location_elem else None

    if date_time_text:
        if today_month_day in date_time_text:
            print(today_month_day)
            events.append({
                "title": title,
                "url": url,
                "start_time": start_time,
                "end_time": end_time,
                "date": date,
                "date_time_text": date_time_text,
                "location": location,
                "image_url": image_url
            })

SUPABASE_URL = "https://ykkcqgkkmwiaagynteri.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlra2NxZ2trbXdpYWFneW50ZXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjEyNDgsImV4cCI6MjA3Njc5NzI0OH0.HDmC6VT6N_iTzNFVECaNedoVG8CIaAVbmddooqWg7E4"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_event_id(event):
    unique_string = (
        (event.get('title') or "") +
        (event.get('date_time_text') or "") +
        (event.get('location') or "") +
        (event.get('url') or "")
    )
    return hashlib.md5(unique_string.encode()).hexdigest()

for event in events:
    event['event_id'] = generate_event_id(event)

if events:
    supabase.table("daily_event_calendar").upsert(events, on_conflict="event_id").execute()
    print(f"Upserted {len(events)} events for {today_month_day}.")
else:
    print("No events for today.")

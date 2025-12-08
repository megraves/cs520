import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from supabase import create_client, Client
import hashlib
from utils import parse_date_time_text, find_best_location_match
import random

umassLocations = {
    "Student Union": {"lat": 42.390874, "lng": -72.527599},
    "Student Union Art Gallery": {"lat": 42.390874, "lng": -72.527599},
    "Middlesex House, Center for Counseling & Psychological Health": {"lat": 42.385680, "lng": -72.528508},
    "Fernald Hall": {"lat": 42.388583, "lng": -72.522418},
    "Worcester Commons": {"lat": 42.393282, "lng": -72.525089},
    "Hampden Gallery": {"lat": 42.382903, "lng": -72.529690},
    "Goodell Hall": {"lat": 42.388708, "lng": -72.529222},
    "Science and Engineering Library": {"lat": 42.394054, "lng": -72.526759},
    "Mullins Center": {"lat": 42.389520, "lng": -72.533450},
    "New Africa House": {"lat": 42.388973, "lng": -72.520689},
    "Campus Center": {"lat": 42.391795, "lng": -72.527019},
    "Old Chapel": {"lat": 42.388981, "lng": -72.527998},
    "Stonewall Center": {"lat": 42.388708, "lng": -72.529222},
    "Curtain Theater": {"lat": 42.388355, "lng": -72.525560},
    "Bromery": {"lat": 42.388355, "lng": -72.525560},
    "Thompson Hall": {"lat": 42.390052, "lng": -72.529950},
    "Herter Hall": {"lat": 42.387238, "lng": -72.527164},
    "Bartlett Hall": {"lat": 42.388000, "lng": -72.528852},
    "Library, W. E. B. Du Bois": {"lat": 42.389736, "lng": -72.528168},
    "Boyden Gymnasium, Joseph R. Rogers, Jr., Pool": {"lat": 42.386394, "lng": -72.530417},
}

URL = "https://events.umass.edu/calendar"
response = requests.get(URL)
soup = BeautifulSoup(response.text, "html.parser")

events = []
today = datetime.now()

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

    matched_location = find_best_location_match(location, umassLocations)

    print(f"Actual Location:{location} and Matched Location: {matched_location}")
    
    # Assuming `date` is a string like "October 23, 2025" or "Oct 23"
    parsed_date = None
    if date:
        try:
            # Try parsing it with month/day/year if available
            parsed_date = datetime.strptime(date, "%b %d, %Y")
        except ValueError:
            # Fallback: if year missing, assume current year
            try: 
                parsed_date = datetime.strptime(date + f", {datetime.now().year}", "%b %d, %Y")
            except:
                parsed_date = None
        eventDate = parsed_date.strftime("%Y-%m-%d")
    else:
        eventDate = None

    if parsed_date and today.date() == parsed_date.date():
        event = {
            "title": title,
            "url": url,
            "start_time": start_time,
            "end_time": end_time,
            "date": date,
            "event_date": eventDate,
            "date_time_text": date_time_text,
            "location": location,
            "image_url": image_url
        }
        if matched_location:
            coords = umassLocations[matched_location]
            event["event_lat"] = coords["lat"]
            event["event_lng"] = coords["lng"]
        else:
            event["event_lat"] = None
            event["event_lng"] = None
        events.append(event)

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
    print(f"Upserted {len(events)} events.")
else:
    print("No events for today.")

# Get two random locations to put grails
grail_locs = random.sample(list(umassLocations.values()), 2)
grails =[]

def generate_grail_id(grail):
    unique_string = (
        (grail.get('lat') or "") +
        (grail.get('long') or "") +
        (grail.get('date') or "")
    )
    return hashlib.md5(unique_string.encode()).hexdigest()

for loc in grail_locs:
    grail = {
        "lat": loc["lat"],
        "long": loc["lng"],
        "date": datetime.now().strftime("%Y-%m-%d"),
        "checkin_count": 0
    }
    grails.append(grail)

for grail in grails:
    grail['id'] = generate_grail_id(grail)

if grails:
    supabase.table("grail_locations").upsert(grails, on_conflict="id").execute()
    print(f"Upserted {len(grails)} grail locs.")

else:
    print("No grail locations generated.")


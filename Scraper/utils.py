from rapidfuzz import process, fuzz

LOCATION_THRESHOLD = 50  # 0–100

def find_best_location_match(loc_text: str, location_dict: dict):
    if not loc_text:
        return None

    match, score, _ = process.extractOne(
        loc_text,
        location_dict.keys(),
        scorer=fuzz.token_sort_ratio
    )

    if score >= LOCATION_THRESHOLD:
        return match
    return None


def parse_date_time_text(date_time_text):
    if "," in date_time_text:
        _, rest = date_time_text.split(",", 1)
    else:
        rest = date_time_text

    rest = rest.strip()

    parts = rest.split()
    if parts and parts[-1] in ["EDT", "EST", "PDT", "PST"]:
        parts = parts[:-1]

    if "to" in parts:
        to_index = parts.index("to")
        start_time = parts[to_index - 1]
        end_time = parts[to_index + 1]
        date = " ".join(parts[:to_index - 1])
    elif len(parts) > 2:
        date = " ".join(parts[:2])
        start_time = parts[2]
        end_time = None
    else:
        date = " ".join(parts)
        start_time = None
        end_time = None

    return date, start_time, end_time

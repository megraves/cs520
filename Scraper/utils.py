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

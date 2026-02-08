import re
import json
import glob
import requests
from bs4 import BeautifulSoup

# ----- Part 1: Parse MUD logs for room data -----

def parse_logs_for_rooms(log_pattern):
    prompt_pattern = re.compile(r"^<(\d+hp) (\d+m) (\d+mv)>\s*$")
    session_header = re.compile(r"^Log session starting at (\d{2}:\d{2}:\d{2}) on (.+)\.")
    exit_pattern = re.compile(r"\[Exits: ?(.+)\]")

    rooms = {}
    for filepath in glob.glob(log_pattern):
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = [l.rstrip('\n') for l in f]
        i = 0
        while i < len(lines):
            if session_header.match(lines[i]):
                i += 1
                continue

            if prompt_pattern.match(lines[i]):
                # consume prompt
                j = i + 1
                # skip blank
                while j < len(lines) and not lines[j].strip(): j += 1
                # command
                if j >= len(lines): break
                cmd = lines[j].strip().lower()
                j += 1
                # only process movement commands
                if cmd in ('n','s','e','w','ne','nw','se','sw','u','d'):
                    # collect response until next prompt/header/blank
                    resp = []
                    while j < len(lines) and lines[j].strip() and not prompt_pattern.match(lines[j]) and not session_header.match(lines[j]):
                        resp.append(lines[j])
                        j += 1
                    if resp:
                        room_name = resp[0].strip()
                        desc_lines = []
                        exits = []
                        for line in resp[1:]:
                            m = exit_pattern.search(line)
                            if m:
                                exits = [e.strip() for e in m.group(1).split()]
                            else:
                                desc_lines.append(line.strip())
                        desc = "\n".join(desc_lines).strip()
                        if room_name not in rooms:
                            rooms[room_name] = {'description': desc, 'exits': exits}
                        else:
                            # merge exits
                            existing = rooms[room_name]
                            existing_exits = set(existing['exits']) | set(exits)
                            existing['exits'] = sorted(existing_exits)
                            if not existing['description'] and desc:
                                existing['description'] = desc
                i = j
                continue
            i += 1
    return rooms

# ----- Part 2: Scrape Avendar Wiki (stub) -----

def fetch_wiki_page(page_name):
    """Fetch a wiki page by title from avendar.wiki."""
    url = f"https://avendar.wiki/{page_name.replace(' ', '_')}"
    r = requests.get(url)
    r.raise_for_status()
    return BeautifulSoup(r.text, 'html.parser')

# Example parser for a skill page:

def parse_skill_wiki(page_name):
    soup = fetch_wiki_page(page_name)
    title = soup.find('h1').get_text(strip=True)
    # Assume skill info in first <table class="infobox">
    info = {}
    info_table = soup.find('table', class_='infobox')
    if info_table:
        for row in info_table.find_all('tr'):
            th = row.find('th')
            td = row.find('td')
            if th and td:
                info[th.get_text(strip=True)] = td.get_text(strip=True)
    return { 'name': title, 'info': info }

# ----- Part 3: Build combined JSON -----

def build_offline_db(log_pattern, skill_pages=None):
    db = {}
    # Rooms from logs
    rooms = parse_logs_for_rooms(log_pattern)
    db['rooms'] = rooms

    # Skills from wiki
    db['skills'] = {}
    if skill_pages:
        for page in skill_pages:
            try:
                sk = parse_skill_wiki(page)
                db['skills'][sk['name']] = sk['info']
            except Exception:
                pass

    # TODO: items, spells, mobs, etc.

    with open('avendar_offline.json', 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2)
    print('Created avendar_offline.json')

# ----- Main -----

if __name__ == '__main__':
    # Adjust the log glob and wiki pages as needed:
    LOG_PATTERN = '/mnt/data/2025-07-*.txt'
    SKILL_PAGES = ['Combat', 'Stealth', 'Lore']  # replace with actual skill page titles
    build_offline_db(LOG_PATTERN, SKILL_PAGES)

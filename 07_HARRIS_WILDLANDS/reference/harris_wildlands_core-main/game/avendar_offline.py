#!/usr/bin/env python3
"""
avendar_offline.py: Generate an offline JSON database and a static HTML site
for Avendar.net content (classes, skills, spells, mobs) + your MUD logs.

Usage:
  python avendar_offline.py --logs "/path/to/logs/*.txt" --output offline_site

Dependencies:
  pip install requests beautifulsoup4

After running, open offline_site/index.html in your browser!
HEY JOE HEADS UP if you need me to prompt you again or redirect while you work.
"""
import argparse
import os
import glob
import re
import json
import requests
from bs4 import BeautifulSoup

# Constants\API_URL = 'https://avendar.net/api.php'
BASE_URL = 'https://avendar.net'
DEFAULT_CATEGORIES = ['Classes', 'Skills', 'Spells', 'Mobs']
PROMPT_RE = re.compile(r"^<(\d+hp) (\d+m) (\d+mv)>$")
MOVE_RE = re.compile(r'^[nsewud]{1,2}$', re.IGNORECASE)

# ---------- MUD Log Parsing ----------

def parse_logs(pattern):
    rooms = {}
    files = glob.glob(pattern)
    for filepath in files:
        with open(filepath, encoding='utf-8') as f:
            lines = [l.rstrip() for l in f]
        i = 0
        while i < len(lines):
            if PROMPT_RE.match(lines[i]):
                # look for movement commands
                j = i + 1
                while j < len(lines) and not lines[j].strip(): j += 1
                if j < len(lines) and MOVE_RE.match(lines[j]):
                    j += 1
                    resp = []
                    while j < len(lines) and lines[j].strip() and not PROMPT_RE.match(lines[j]):
                        resp.append(lines[j])
                        j += 1
                    if resp:
                        name = resp[0].strip()
                        desc = []
                        exits = []
                        for line in resp[1:]:
                            m = re.search(r"\[Exits: ?(.+)\]", line)
                            if m:
                                exits = [e.strip() for e in m.group(1).split()]
                            else:
                                desc.append(line.strip())
                        rooms.setdefault(name, {
                            'description': '\n'.join(desc).strip(),
                            'exits': exits
                        })
                i = j
            else:
                i += 1
    return rooms

# ---------- MediaWiki API Helpers ----------

def get_category_pages(category):
    """Return list of page titles in the given MediaWiki category."""
    titles = []
    session = requests.Session()
    cont = None
    while True:
        params = {'action':'query','list':'categorymembers',
                  'cmtitle':f'Category:{category}','cmlimit':'max','format':'json'}
        if cont: params['cmcontinue'] = cont
        r = session.get(API_URL, params=params); r.raise_for_status()
        data = r.json()
        titles += [m['title'] for m in data['query']['categorymembers']]
        if 'continue' in data:
            cont = data['continue']['cmcontinue']
        else:
            break
    return titles


def fetch_printable(title):
    """Fetch printable HTML for a wiki page title."""
    resp = requests.get(f"{BASE_URL}/index.php", params={'title':title,'printable':'yes'})
    resp.raise_for_status()
    return BeautifulSoup(resp.text, 'html.parser')

# ---------- Parsers ----------

def parse_class(soup):
    name = soup.find('h1').get_text(strip=True)
    desc = []
    # paragraphs until first h2
    for e in soup.find('h1').find_next_siblings():
        if e.name=='h2': break
        if e.name=='p': desc.append(e.get_text(strip=True))
    races, traits, abilities = [], [], {}
    for h2 in soup.find_all('h2'):
        s = h2.get_text(strip=True).lower()
        if 'races' in s:
            races = [li.get_text(strip=True) for li in h2.find_next_sibling('ul').find_all('li')]
        elif 'traits' in s:
            traits = [li.get_text(strip=True) for li in h2.find_next_sibling('ul').find_all('li')]
        elif 'class abilities' in s:
            for li in h2.find_next_sibling('ul').find_all('li'):
                t = li.get_text(strip=True)
                m = re.match(r'Level\s*(\d+):\s*(.*)', t)
                if m:
                    lvl = int(m.group(1)); skills = [x.strip() for x in m.group(2).split('|')]
                    abilities[lvl] = skills
    return {'name':name,'description':'\n\n'.join(desc),'races':races,'traits':traits,'abilities':abilities}


def parse_generic(soup):
    name = soup.find('h1').get_text(strip=True)
    info, desc = {}, []
    for p in soup.find_all('p'):
        t = p.get_text(strip=True)
        if ':' in t and 'type' in t.lower():
            parts = [s.strip() for s in t.split('  ') if ':' in s]
            for pr in parts:
                k,v = pr.split(':',1); info[k.strip()]=v.strip()
        elif t and not t.lower().startswith('see also'):
            desc.append(t)
    info['description'] = '\n\n'.join(desc)
    return {'name':name,'info':info}

# ---------- Site Generator ----------

def generate_site(db, out):
    # write JSON
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out,'avendar_offline.json'),'w',encoding='utf-8') as f:
        json.dump(db,f,indent=2)
    # prepare HTML dirs
    pages = {'rooms':db['rooms'],**{c.lower():db[c.lower()] for c in DEFAULT_CATEGORIES}}
    for sect,content in pages.items():
        d = os.path.join(out,sect); os.makedirs(d,exist_ok=True)
        for name,val in content.items():
            fn = os.path.join(d, f"{quote(name)}.html")
            body = ''
            if sect=='rooms':
                body += f"<p>{val['description'].replace(chr(10),'<br/>')}</p>"
                if val['exits']:
                    body += '<h2>Exits</h2><ul>' + ''.join(f'<li>{e}</li>' for e in val['exits']) + '</ul>'
            else:
                if 'description' in val: body += f"<p>{val['description'].replace(chr(10),'<br/>')}</p>"
                if 'info' in val:
                    items = ''.join(f"<li><strong>{k}:</strong> {v}</li>" for k,v in val['info'].items())
                    body += '<ul>'+items+'</ul>'
                if sect=='classes':
                    # additional class fields
                    if 'races' in val: body += '<h3>Races</h3><ul>'+''.join(f'<li>{r}</li>' for r in val['races'])+'</ul>'
                    if 'traits' in val:body += '<h3>Traits</h3><ul>'+''.join(f'<li>{t}</li>' for t in val['traits'])+'</ul>'
                    if 'abilities' in val:
                        body += '<h3>Abilities</h3>'
                        for lvl,skills in val['abilities'].items():
                            body += f'<p>Level {lvl}: ' + ', '.join(skills) + '</p>'
            html = f"""
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>{name}</title></head><body>
<h1>{name}</h1>
{body}
<p><a href='../index.html'>Back to index</a></p>
</body></html>"""
            with open(fn,'w',encoding='utf-8') as f: f.write(html)
    # index
    idx = ['<h1>Avendar Offline</h1>']
    for sect in pages:
        idx.append(f'<h2>{sect.title()}</h2><ul>')
        for name in sorted(pages[sect]):
            idx.append(f"<li><a href='{sect}/{quote(name)}.html'>{name}</a></li>")
        idx.append('</ul>')
    with open(os.path.join(out,'index.html'),'w',encoding='utf-8') as f:
        f.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Index</title></head><body>' + '\n'.join(idx) + '</body></html>')

# ---------- Main Pipeline ----------

def build(logs, categories, output):
    db = {}
    print('Parsing logs...')
    db['rooms'] = parse_logs(logs)
    for cat in categories:
        print(f'Fetching category: {cat}')
        titles = get_category_pages(cat)
        key = cat.lower()
        db[key] = {}
        for t in titles:
            try:
                soup = fetch_printable(t)
                db[key][t] = parse_class(soup) if cat=='Classes' else parse_generic(soup)
            except Exception as e:
                print(f'Error parsing {t}: {e}')
    print('Generating site...')
    generate_site(db, output)
    print(f'Done. Open {output}/index.html offline!')

if __name__=='__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--logs', required=True, help='glob or dir for MUD logs (e.g. "logs/*.txt")')
    p.add_argument('--output', default='offline_site', help='output folder for JSON+site')
    p.add_argument('--categories', nargs='+', default=DEFAULT_CATEGORIES, help='which wiki categories to include')
    args = p.parse_args()
    build(args.logs, args.categories, args.output)

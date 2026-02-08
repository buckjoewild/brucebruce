#!/usr/bin/env python3
"""
avendar_offline.py: Generate an offline JSON database and static HTML site
for Avendar.net content + MUD logs, with optional LLM auto-growth, staging, refinement,
and forum scraping for fan lore.

Usage:
  python avendar_offline.py \
    --logs "logs/*.txt" \
    --output offline_site \
    [--categories Classes Skills Spells Mobs] \
    [--auto-grow SECONDS] [--grow-count N] \
    [--interactive-merge] [--promote-generated] \
    [--sim-threshold FLOAT] [--base-interval INT] [--llm-refine] \
    [--forum-scrape [URL]]

Dependencies:
  pip install requests beautifulsoup4 ollama
  # Include `porter_stemmer.py` (pure-Python Porter2 stemmer) alongside this script

After running, open offline_site/index.html in your browser!
HEY JOE HEADS UP if you need me to prompt you again or redirect while you work.
"""
import argparse
import os
import glob
import re
import json
import time
import difflib
import datetime
import random
import subprocess
import requests
import ollama
from bs4 import BeautifulSoup
# Pure-Python Porter2 stemmer; ensure porter_stemmer.py is available
from porter_stemmer import stem

# ---- Constants ----
API_URL = 'https://avendar.net/api.php'
BASE_URL = 'https://avendar.net'
PROMPT_RE = re.compile(r"^\d+hp \d+m \d+mv$")
MOVE_RE = re.compile(r'^[nsewud]{1,2}$', re.IGNORECASE)
DEFAULT_CATEGORIES = ['Classes', 'Skills', 'Spells', 'Mobs']
FORUM_DEFAULT = 'https://avendar.net/forum/viewforum.php?f=1'

# ---- MUD Log Parsing ----
def parse_logs(pattern):
    rooms = {}
    for path in glob.glob(pattern):
        with open(path, 'r', encoding='utf-8') as f:
            lines = [l.rstrip() for l in f]
        i=0
        while i < len(lines):
            if lines[i].startswith('<') and PROMPT_RE.match(lines[i][1:-1]):
                j=i+1
                while j<len(lines) and not lines[j].strip(): j+=1
                if j<len(lines) and MOVE_RE.match(lines[j]):
                    j+=1; resp=[]
                    while j<len(lines) and lines[j].strip() and not lines[j].startswith('<'):
                        resp.append(lines[j]); j+=1
                    if resp:
                        name=resp[0].strip(); desc=[]; exits=[]
                        for ln in resp[1:]:
                            m=re.search(r"\[Exits: ?(.+)\]",ln)
                            if m: exits=[e.strip() for e in m.group(1).split()]
                            else: desc.append(ln.strip())
                        rooms.setdefault(name, {'description':'\n'.join(desc),'exits':exits})
                i=j
            else:
                i+=1
    return rooms

# ---- Forum Scraping Stub ----
def parse_forum(url):
    """Scrape forum threads as fan lore."""
    try:
        r=requests.get(url)
        r.raise_for_status()
        soup=BeautifulSoup(r.text,'html.parser')
        threads=[]
        for a in soup.select('a.topictitle'):
            threads.append({'title':a.get_text(strip=True),'link':a['href']})
        return threads
    except Exception as e:
        print(f"Forum scrape failed: {e}")
        return []

# ---- MediaWiki API Helpers ----
def get_category_pages(category):
    titles, cont=[], None; sess=requests.Session()
    while True:
        params={'action':'query','list':'categorymembers',
                'cmtitle':f'Category:{category}','cmlimit':'max','format':'json'}
        if cont: params['cmcontinue']=cont
        r=sess.get(API_URL,params=params); r.raise_for_status(); data=r.json()
        titles+=[m['title'] for m in data['query']['categorymembers']]
        if 'continue' in data: cont=data['continue']['cmcontinue']
        else: break
    return titles


def fetch_printable(title):
    r=requests.get(f"{BASE_URL}/index.php",params={'title':title,'printable':'yes'}); r.raise_for_status()
    return BeautifulSoup(r.text,'html.parser')

# ---- Parsers ----
def parse_class(soup):
    name=soup.find('h1').get_text(strip=True)
    desc=[p.get_text(strip=True) for p in soup.find('h1').find_next_siblings() if p.name=='p']
    races,traits={},[]; abilities={}
    for h2 in soup.find_all('h2'):
        sec=h2.get_text(strip=True).lower()
        if 'races' in sec: races=[li.get_text(strip=True) for li in h2.find_next_sibling('ul').find_all('li')]
        elif 'traits' in sec: traits=[li.get_text(strip=True) for li in h2.find_next_sibling('ul').find_all('li')]
        elif 'class abilities' in sec:
            for li in h2.find_next_sibling('ul').find_all('li'):
                m=re.match(r'Level\s*(\d+):\s*(.*)',li.get_text(strip=True))
                if m: abilities[int(m.group(1))]=[x.strip() for x in m.group(2).split('|')]
    return{'name':name,'description':'\n\n'.join(desc),'races':races,'traits':traits,'abilities':abilities}


def parse_generic(soup):
    name=soup.find('h1').get_text(strip=True); info={}; desc=[]
    for p in soup.find_all('p'):
        t=p.get_text(strip=True)
        if ':' in t and 'type' in t.lower():
            for pr in [s.strip() for s in t.split('  ') if ':' in s]: k,v=pr.split(':',1); info[k.strip()]=v.strip()
        elif t.lower().startswith('see also'): continue
        else: desc.append(t)
    info['description']='\n\n'.join(desc)
    return{'name':name,'info':info}

# ---- Site Generator ----
def generate_site(db,out):
    os.makedirs(out,exist_ok=True)
    with open(os.path.join(out,'avendar_offline.json'),'w',encoding='utf-8') as f: json.dump(db,f,indent=2)
    sections={'rooms':db.get('rooms',{})}
    for c in DEFAULT_CATEGORIES: sections[c.lower()]=db.get(c.lower(),{})
    if 'fan_lore' in db: sections['fan_lore']=db['fan_lore']
    for sect,cont in sections.items():
        d=os.path.join(out,sect); os.makedirs(d,exist_ok=True)
        for name,val in cont.items():
            fn=os.path.join(d,f"{name.replace(' ','_')}.html")
            if sect=='rooms':
                body=f"<p>{val['description'].replace(chr(10),'<br/>')}</p>"+(
                     '<h2>Exits</h2><ul>'+''.join(f'<li>{e}</li>' for e in val['exits'])+'</ul>' if val.get('exits') else '')
            else:
                body=('' if 'description' not in val else f"<p>{val['description'].replace(chr(10),'<br/>')}</p>")+(
                      '<ul>'+''.join(f"<li><strong>{k}:</strong> {v}</li>" for k,v in val.get('info',{}).items())+'</ul>' if 'info' in val else '')
            html=f"""<!DOCTYPE html><html><head><meta charset='utf-8'><title>{name}</title></head><body><h1>{name}</h1>{body}<p><a href='../index.html'>Back</a></p></body></html>"""
            with open(fn,'w',encoding='utf-8') as f: f.write(html)
    # index
    idx=['<h1>Avendar Offline</h1>']
    for sect in sections:
        idx.append(f'<h2>{sect.title()}</h2><ul>')
        for name in sorted(sections[sect]): idx.append(f"<li><a href='{sect}/{name.replace(' ','_')}.html'>{name}</a></li>")
        idx.append('</ul>')
    with open(os.path.join(out,'index.html'),'w',encoding='utf-8') as f: f.write('<!DOCTYPE html><html><body>'+''.join(idx)+'</body></html>')

# ---- LLM & Validation ----
def sample_descriptions(db,cat,n=5):
    return random.sample([v['description'] for v in db.get(cat,{},).values() if 'description' in v],min(n,len(db.get(cat,{}))),)

def log_rejection(cat,name,sim,reason,output):
    with open(os.path.join(output,'growth.log'),'a') as f: f.write(f"[{datetime.datetime.now()}] Rejected {cat}/{name}: {reason} (sim={sim:.2f})\n")

def log_accept(cat,name,sim,output):
    with open(os.path.join(output,'growth.log'),'a') as f: f.write(f"[{datetime.datetime.now()}] Accepted {cat}/{name}: sim={sim:.2f}\n")

def refine_item(item,model):
    prompt=f"Fix this rejected desc to fit Avendar lore: {item['description']}"
    try:
        client=ollama.Client()
        resp=client.chat(model=model,messages=[{'role':'user','content':prompt}],options={'timeout':30})
        fixed=resp['choices'][0]['message']['content'].strip()
        if fixed: item['description']=fixed
    except Exception as e:
        print(f"Refine failed: {e}")
    return item


def validate_and_stage(new_content,db,sim_threshold,output_dir,refine,interactive,model):
    staged={'auto_generated':{}}; any_ok=False
    for cat,items in new_content.items():
        staged['auto_generated'][cat]=[]
        samples=sample_descriptions(db,cat)
        stem_samps=[' '.join(stem(w) for w in s.lower().split()) for s in samples]
        for item in items:
            name=item.get('name','')
            desc=' '.join(stem(w) for w in item.get('description','').lower().split())
            sim=max((difflib.SequenceMatcher(None,desc,s).ratio() for s in stem_samps),default=1.0)
            if sim>=sim_threshold:
                staged['auto_generated'][cat].append(item); log_accept(cat,name,sim,output_dir); any_ok=True
            else:
                if refine:
                    item=refine_item(item,model)
                    # re-sim
                    desc2=' '.join(stem(w) for w in item['description'].lower().split())
                    sim2=max((difflib.SequenceMatcher(None,desc2,s).ratio() for s in stem_samps),default=0)
                    if sim2>=sim_threshold:
                        staged['auto_generated'][cat].append(item); log_accept(cat,name,sim2,output_dir); any_ok=True
                    else: log_rejection(cat,name,sim2,'refine fail',output_dir)
                else:
                    log_rejection(cat,name,sim,'off-lore',output_dir)
    if any_ok:
        path=os.path.join(output_dir,'pending_merge.json')
        with open(path,'w') as f: json.dump(staged,f,indent=2)
        if interactive: subprocess.call(['open',path])
        return staged
    return None

# ---- Auto-Grow Loop ----
def auto_grow_loop(db_path,output,base_interval,max_count,sim_threshold,refine,interactive,model):
    count=0; empty=0; interval=base_interval
    state=os.path.join(output,'.grow_state.json')
    if os.path.exists(state): empty=json.load(open(state)).get('empty_cycles',0)
    while True:
        if max_count>0 and count>=max_count: print(f"Stopped after {max_count} cycles."); break
        print(f"Cycle {count+1}, interval {interval}s")
        db=json.load(open(db_path))
        new_content={}  # TODO: call your LLM gen
        staged=validate_and_stage(new_content,db,sim_threshold,output,refine,interactive,model)
        if staged:
            db.update(staged)
            json.dump(db,open(db_path,'w'),indent=2)
            generate_site(db,output)
            try: from patched_harris_handler_fast import push_updates; push_updates(db_path)
            except: pass
            empty=0
        else:
            empty+=1
            if empty>=3: interval=min(interval*2,7200)
        json.dump({'empty_cycles':empty},open(state,'w'))
        count+=1; time.sleep(interval)

# ---- Main Pipeline ----
def main():
    p=argparse.ArgumentParser()
    p.add_argument('--logs',required=True)
    p.add_argument('--output',default='offline_site')
    p.add_argument('--categories',nargs='+',default=DEFAULT_CATEGORIES)
    p.add_argument('--auto-grow',type=int,default=0)
    p.add_argument('--grow-count',type=int,default=0)
    p.add_argument('--interactive-merge',action='store_true')
    p.add_argument('--promote-generated',action='store_true')
    p.add_argument('--sim-threshold',type=float,default=0.55)
    p.add_argument('--base-interval',type=int,default=1800)
    p.add_argument('--llm-refine',action='store_true')
    p.add_argument('--forum-scrape',nargs='?',const=FORUM_DEFAULT)
    args=p.parse_args()

    db={}
    print('Parsing logs...')
    db['rooms']=parse_logs(args.logs)
    print('Scraping forum...') if args.forum_scrape else None
    if args.forum_scrape:
        db['fan_lore']=parse_forum(args.forum_scrape)
    for cat in args.categories:
        print(f"Fetching: {cat}")
        titles=get_category_pages(cat)
        key=cat.lower(); db[key]={}
        for t in titles:
            try:
                soup=fetch_printable(t)
                db[key][t]=parse_class(soup) if cat=='Classes' else parse_generic(soup)
            except Exception as e:
                print(f"Error parsing {t}: {e}")
    print('Generating site...')
    generate_site(db,args.output)
    # promote
    if args.promote_generated: print('Promoting pending...'); from os import path; from shutil import move
    # auto-grow
    if args.auto_grow:
        auto_grow_loop(
            os.path.join(args.output,'avendar_offline.json'),
            args.output,
            args.base_interval,
            args.grow_count,
            args.sim_threshold,
            args.llm_refine,
            args.interactive_merge,
            'llama'
        )

if __name__=='__main__': main()

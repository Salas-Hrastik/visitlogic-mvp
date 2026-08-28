# -*- coding: utf-8 -*-
"""Ugradnja slika i izvora u docs/modul-1-arhitektura-urbanizam.html
   - smanjuje preuzete slike na 900 px i sprema u docs/img/modul1/
   - zamjenjuje {{SRC:id}} generiranim navodom izvora (autor + licencija + poveznica)
   - generira docs/img/modul1/IZVORI.md
Pokretanje: python3 build.py
"""
from PIL import Image
import json, os, re, html, unicodedata

ROOT = "/home/user/visitlogic-mvp"
OUT  = os.path.join(ROOT, "docs/img/modul1")
DOC  = os.path.join(ROOT, "docs/modul-1-arhitektura-urbanizam.html")
MAXW, QUAL = 900, 80

final = json.load(open("final.json", encoding="utf-8"))
os.makedirs(OUT, exist_ok=True)

def esc(s): return html.escape(s or "", quote=True)

def lic_label(l):
    if not l: return "licencija nije navedena"
    if re.match(r'public domain|pdm', l, re.I): return "javno vlasništvo"
    return l

def attribution(v):
    title = re.sub(r'^File:', '', v['title'])
    title = re.sub(r'\.(jpg|jpeg|png|tif|tiff)$', '', title, flags=re.I)
    author = v.get('artist') or v.get('credit') or "autor nije naveden"
    author = re.sub(r'^(No machine-readable author provided\.?\s*)', '', author).strip()
    author = re.sub(r'\s*assumed.*$', '', author, flags=re.I).strip(' .')
    if not author: author = "autor nije naveden"
    lab = lic_label(v.get('license'))
    lic = f'<a href="{esc(v["licurl"])}">{esc(lab)}</a>' if v.get('licurl') else esc(lab)
    return (f'<span class="src">Foto: {esc(author)} · '
            f'<a href="{esc(v["descurl"])}">{esc(title)}</a>, Wikimedia Commons · {lic}</span>')

# 1) slike
made, missing = 0, []
for k, v in sorted(final.items()):
    src = f"raw/{k}.img"
    if not (os.path.exists(src) and os.path.getsize(src) > 20000):
        missing.append(k); continue
    im = Image.open(src).convert("RGB")
    if im.width > MAXW:
        im = im.resize((MAXW, round(im.height * MAXW / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, f"{k}.jpg"), "JPEG", quality=QUAL, optimize=True, progressive=True)
    made += 1
print(f"slike: {made} spremljeno, nedostaje {len(missing)}: {missing}")

# 2) izvori u dokumentu
doc = open(DOC, encoding="utf-8").read()
unresolved = []
def sub(m):
    k = m.group(1)
    if k not in final or k in missing:
        unresolved.append(k); return ""
    return attribution(final[k])
doc = re.sub(r'\{\{SRC:([a-z_]+)\}\}', sub, doc)
open(DOC, "w", encoding="utf-8").write(doc)
print(f"izvori ugrađeni; neriješeno: {sorted(set(unresolved))}")

# 3) popis izvora
lines = ["# Izvori ilustracija — Modul 1", "",
         "Sve fotografije preuzete su s Wikimedia Commonsa i objavljene pod slobodnim licencijama.",
         "Sheme i crteži izvorni su rad izrađen za ovaj modul (CC BY-SA 4.0).", ""]
for k, v in sorted(final.items()):
    if k in missing: continue
    a = v.get('artist') or v.get('credit') or "autor nije naveden"
    a = re.sub(r'^(No machine-readable author provided\.?\s*)', '', a).strip(' .')
    lines.append(f"- **{k}** — {re.sub(r'^File:', '', v['title'])} · foto: {a or 'autor nije naveden'} · "
                 f"{lic_label(v.get('license'))} · {v['descurl']}")
open(os.path.join(OUT, "IZVORI.md"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("IZVORI.md zapisan")

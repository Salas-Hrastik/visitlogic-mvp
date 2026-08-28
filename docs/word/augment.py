# -*- coding: utf-8 -*-
"""Dopuni model.json putanjama i ujednači omjere slika u redovima."""
import json, os
from PIL import Image

HERE=os.path.dirname(os.path.abspath(__file__))
IMG=os.path.abspath(os.path.join(HERE,'..'))
PNG=os.path.abspath('svgpng'); ROW=os.path.abspath('rowimg')
os.makedirs(ROW, exist_ok=True)
AR=2/3.0                       # 3:2 pejzaž
BG=(247,247,245)

def base(f, i=[0]):
    if f['svg']:
        i[0]+=1; f['type']='png'; return os.path.join(PNG, f'shema{i[0]:02d}.png')
    f['type']='jpg'; return os.path.join(IMG, f['img'])

def uniform(src, key, target_w):
    """Središnje izreži pejzaž na 3:2; uspravnu sliku uklopi u 3:2 na svijetloj podlozi."""
    im = Image.open(src).convert('RGB')
    w, h = im.size
    tw, th = target_w, round(target_w*AR)
    if h/w <= 1.05:                                   # pejzaž -> izrezivanje
        want_h = w*AR
        if h > want_h:
            top = round((h-want_h)/2); im = im.crop((0, top, w, top+round(want_h)))
        else:
            want_w = h/AR; left = round((w-want_w)/2); im = im.crop((left, 0, left+round(want_w), h))
        im = im.resize((tw, th), Image.LANCZOS)
    else:                                             # uspravna -> uklapanje
        sc = min(tw/w, th/h); nw, nh = max(1,round(w*sc)), max(1,round(h*sc))
        canvas = Image.new('RGB', (tw, th), BG)
        canvas.paste(im.resize((nw, nh), Image.LANCZOS), ((tw-nw)//2, (th-nh)//2))
        im = canvas
    out = os.path.join(ROW, key+'.jpg')
    im.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    return out

m = json.load(open('model.json'))
n_row = 0
for b in m:
    if b['t'] == 'figure':
        p = base(b); b['path'] = p
        w, h = Image.open(p).size; b['ar'] = round(h/w, 4)
    elif b['t'] == 'figrow':
        cols = len(b['figs'])
        for j, f in enumerate(b['figs']):
            p = base(f)
            key = os.path.splitext(os.path.basename(p))[0]
            f['path'] = uniform(p, key, 700 if cols == 2 else 560)
            f['type'] = 'jpg'; f['ar'] = AR; n_row += 1
json.dump(m, open('model.json','w'), ensure_ascii=False, indent=1)
print('ujednačeno slika u redovima:', n_row)

# -*- coding: utf-8 -*-
"""Zamjenjuje MODUL 1 u kanonskom dokumentu ilustriranom verzijom,
poštujući postojeće stilove, numeriranje i bookmarkove."""
import json, os, re, shutil, unicodedata
from lxml import etree

NS = {
 'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
 'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
 'wp':'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
 'a':'http://schemas.openxmlformats.org/drawingml/2006/main',
 'pic':'http://schemas.openxmlformats.org/drawingml/2006/picture',
}
W='{%s}'%NS['w']; R='{%s}'%NS['r']; WP='{%s}'%NS['wp']; A='{%s}'%NS['a']; PIC='{%s}'%NS['pic']
PKG='{http://schemas.openxmlformats.org/package/2006/relationships}'
CT='{http://schemas.openxmlformats.org/package/2006/content-types}'

UNP='unpacked'
TEXTW=9212                      # DXA širina teksta u domaćinu
EMU=9525                        # 1 px @96dpi
START, END = 108, 496           # raspon koji se zamjenjuje (kids[START:END])

model = json.load(open('model.json', encoding='utf-8'))
host  = json.load(open('hostmap.json', encoding='utf-8'))
HLEVEL = host['hlevel']
BOOK = {}
for b in host['bookmarks']:
    BOOK.setdefault(re.sub(r'\s+',' ',b['heading']).strip().lower(), b)

def norm(s): return re.sub(r'\s+',' ',s or '').strip().lower()

doc = etree.parse(os.path.join(UNP,'word/document.xml'))
body = doc.getroot().find(W+'body')
kids = list(body)

# ---------- veze (rels) ----------
relsdoc = etree.parse(os.path.join(UNP,'word/_rels/document.xml.rels'))
relsroot = relsdoc.getroot()
_next = [5000]
def new_rid():
    _next[0]+=1; return 'rId%d'%_next[0]

link_cache={}
def hyperlink_rid(url):
    if url in link_cache: return link_cache[url]
    rid=new_rid()
    etree.SubElement(relsroot, PKG+'Relationship', Id=rid,
        Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
        Target=url, TargetMode='External')
    link_cache[url]=rid; return rid

img_cache={}
os.makedirs(os.path.join(UNP,'word/media'), exist_ok=True)
def image_rid(path):
    if path in img_cache: return img_cache[path]
    ext=os.path.splitext(path)[1].lower().lstrip('.')
    name='m1_%02d.%s'%(len(img_cache)+1, ext)
    shutil.copy(path, os.path.join(UNP,'word/media',name))
    rid=new_rid()
    etree.SubElement(relsroot, PKG+'Relationship', Id=rid,
        Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
        Target='media/'+name)
    img_cache[path]=rid; return rid

# ---------- numeriranje ----------
numdoc = etree.parse(os.path.join(UNP,'word/numbering.xml')); numroot=numdoc.getroot()
BULLET_NUMID='1004'; DEC_ABSTRACT='99411'
_nid=[3000]
def new_ordered_numid():
    _nid[0]+=1
    n=etree.SubElement(numroot, W+'num'); n.set(W+'numId', str(_nid[0]))
    a=etree.SubElement(n, W+'abstractNumId'); a.set(W+'val', DEC_ABSTRACT)
    for lv in range(9):                      # kao i postojeći popisi: svaki počinje od 1
        ov=etree.SubElement(n, W+'lvlOverride'); ov.set(W+'ilvl', str(lv))
        etree.SubElement(ov, W+'startOverride').set(W+'val','1')
    return str(_nid[0])

# ---------- gradnja elemenata ----------
def el(tag, **kw):
    e=etree.Element(tag, nsmap=None)
    for k,v in kw.items(): e.set(k,v)
    return e

def run(text, bold=False, ital=False, sz=None, color=None, font=None):
    r=etree.Element(W+'r')
    if bold or ital or sz or color or font:
        rpr=etree.SubElement(r, W+'rPr')
        if font:
            f=etree.SubElement(rpr, W+'rFonts')
            for at in ('ascii','hAnsi','cs'): f.set(W+at, font)
        if bold:
            etree.SubElement(rpr, W+'b'); etree.SubElement(rpr, W+'bCs')
        if ital:
            etree.SubElement(rpr, W+'i'); etree.SubElement(rpr, W+'iCs')
        else:
            etree.SubElement(rpr, W+'i').set(W+'val','false')
        if color: etree.SubElement(rpr, W+'color').set(W+'val', color)
        if sz:
            etree.SubElement(rpr, W+'sz').set(W+'val', str(sz))
            etree.SubElement(rpr, W+'szCs').set(W+'val', str(sz))
    t=etree.SubElement(r, W+'t'); t.set('{http://www.w3.org/XML/1998/namespace}space','preserve')
    t.text=text
    return r

def hyperlink(url, text, **kw):
    h=etree.Element(W+'hyperlink'); h.set(R+'id', hyperlink_rid(url))
    r=run(text, **kw)
    rpr=r.find(W+'rPr')
    if rpr is None:
        rpr=etree.SubElement(r, W+'rPr'); r.insert(0,rpr)
    st=etree.Element(W+'rStyle'); st.set(W+'val','Hyperlink'); rpr.insert(0,st)
    h.append(r); return h

def para(style=None, jc=None, numid=None, ilvl='0'):
    p=etree.Element(W+'p')
    ppr=etree.SubElement(p, W+'pPr')
    if style: etree.SubElement(ppr, W+'pStyle').set(W+'val', style)
    if numid:
        npr=etree.SubElement(ppr, W+'numPr')
        etree.SubElement(npr, W+'ilvl').set(W+'val', ilvl)
        etree.SubElement(npr, W+'numId').set(W+'val', numid)
    if jc: etree.SubElement(ppr, W+'jc').set(W+'val', jc)
    return p

def add_runs(p, runs, sz=None, color=None, ital=False):
    prev_space=True
    for rr in runs or []:
        t=re.sub(r'\s+',' ', rr['text'])
        if prev_space: t=t.lstrip()
        if not t: continue
        prev_space=t.endswith(' ')
        if rr.get('href'):
            p.append(hyperlink(rr['href'], t, bold=rr.get('b'), ital=rr.get('i') or ital, sz=sz))
        else:
            p.append(run(t, bold=rr.get('b'), ital=rr.get('i') or ital, sz=sz, color=color))
    return p

def runs_text(runs): return ''.join(r['text'] for r in runs or [])

# ---------- slike ----------
_pic=[0]
def drawing(path, px_w, ar, alt=''):
    _pic[0]+=1
    h_px=round(px_w*ar)
    cx, cy = int(px_w*EMU), int(h_px*EMU)
    rid=image_rid(path)
    r=etree.Element(W+'r')
    d=etree.SubElement(r, W+'drawing')
    inl=etree.SubElement(d, WP+'inline')
    for k in ('distT','distB','distL','distR'): inl.set(k,'0')
    etree.SubElement(inl, WP+'extent', cx=str(cx), cy=str(cy))
    etree.SubElement(inl, WP+'effectExtent', l='0', t='0', r='0', b='0')
    dp=etree.SubElement(inl, WP+'docPr', id=str(1000+_pic[0]), name='Slika %d'%_pic[0])
    if alt: dp.set('descr', alt[:400])
    fp=etree.SubElement(inl, WP+'cNvGraphicFramePr')
    etree.SubElement(fp, A+'graphicFrameLocks', noChangeAspect='1')
    g=etree.SubElement(inl, A+'graphic')
    gd=etree.SubElement(g, A+'graphicData', uri='http://schemas.openxmlformats.org/drawingml/2006/picture')
    pic=etree.SubElement(gd, PIC+'pic')
    nv=etree.SubElement(pic, PIC+'nvPicPr')
    etree.SubElement(nv, PIC+'cNvPr', id=str(_pic[0]), name=os.path.basename(path))
    etree.SubElement(nv, PIC+'cNvPicPr')
    bf=etree.SubElement(pic, PIC+'blipFill')
    etree.SubElement(bf, A+'blip').set(R+'embed', rid)
    etree.SubElement(etree.SubElement(bf, A+'stretch'), A+'fillRect')
    sp=etree.SubElement(pic, PIC+'spPr')
    xf=etree.SubElement(sp, A+'xfrm')
    etree.SubElement(xf, A+'off', x='0', y='0')
    etree.SubElement(xf, A+'ext', cx=str(cx), cy=str(cy))
    etree.SubElement(etree.SubElement(sp, A+'prstGeom', prst='rect'), A+'avLst')
    return r

def figure_paras(f, px_w, cap_sz=17, src_sz=15):
    out=[]
    maxh = 430 if px_w > 400 else (235 if px_w > 220 else 180)
    w=px_w
    if f.get('natw'): w=min(w, f['natw'])
    if round(w*f['ar']) > maxh: w=round(maxh/f['ar'])
    p=para('Figure', jc='center'); p.append(drawing(f['path'], w, f['ar'], runs_text(f.get('caption'))))
    out.append(p)
    if f.get('caption'):
        out.append(add_runs(para('ImageCaption'), f['caption'], sz=cap_sz))
    if f.get('src'):
        out.append(add_runs(para('ImageCaption'), f['src'], sz=src_sz, color='595959'))
    return out

# ---------- tablice ----------
def col_widths(b, n):
    ln=[0]*n; cn=[0]*n
    for r in ([b['head']] if b['head'] else [])+b['rows']:
        for i,c in enumerate(r[:n]):
            ln[i]+=sum(len(x['text']) for x in (c or [])); cn[i]+=1
    wt=[max(4, ln[i]/max(1,cn[i]))**0.75 for i in range(n)]
    s=sum(wt); pct=[x/s for x in wt]
    for _ in range(4):
        pct=[min(.52,max(.13,x)) for x in pct]; s=sum(pct); pct=[x/s for x in pct]
    w=[round(TEXTW*x) for x in pct]; w[-1]+=TEXTW-sum(w)
    return w

def no_borders(tblpr):
    tb=etree.SubElement(tblpr, W+'tblBorders')
    for side in ('top','start','bottom','end','insideH','insideV'):
        e=etree.SubElement(tb, W+side); e.set(W+'val','none'); e.set(W+'sz','0'); e.set(W+'space','0')

def make_table(b):
    n=max(len(b['head']), max((len(r) for r in b['rows']), default=1), 1)
    cw=col_widths(b,n)
    tbl=etree.Element(W+'tbl')
    tp=etree.SubElement(tbl, W+'tblPr')
    etree.SubElement(tp, W+'tblStyle').set(W+'val','Table')
    tw=etree.SubElement(tp, W+'tblW'); tw.set(W+'type','pct'); tw.set(W+'w','5000')
    etree.SubElement(tp, W+'jc').set(W+'val','start')
    look=etree.SubElement(tp, W+'tblLook')
    for k,v in (('firstRow','1'),('lastRow','0'),('firstColumn','0'),('lastColumn','0'),
                ('noHBand','0'),('noVBand','0'),('val','0020')): look.set(W+k,v)
    grid=etree.SubElement(tbl, W+'tblGrid')
    for x in cw: etree.SubElement(grid, W+'gridCol').set(W+'w', str(x))
    def row(cells, header=False):
        tr=etree.Element(W+'tr')
        if header:
            trpr=etree.SubElement(tr, W+'trPr')
            etree.SubElement(trpr, W+'tblHeader').set(W+'val','true')
        for i in range(n):
            tc=etree.SubElement(tr, W+'tc')
            tcpr=etree.SubElement(tc, W+'tcPr')
            tcw=etree.SubElement(tcpr, W+'tcW'); tcw.set(W+'type','dxa'); tcw.set(W+'w',str(cw[i]))
            p=para('Compact', jc='left')
            rs=cells[i] if i < len(cells) else []
            if header: rs=[dict(x, b=True) for x in (rs or [])]
            add_runs(p, rs)
            tc.append(p)
        return tr
    if b['head']: tbl.append(row(b['head'], header=True))
    for r in b['rows']: tbl.append(row(r))
    return tbl

def figure_row_table(figs):
    n=len(figs); cw=[TEXTW//n]*n; cw[-1]+=TEXTW-sum(cw)
    px = 275 if n==2 else 180
    tbl=etree.Element(W+'tbl')
    tp=etree.SubElement(tbl, W+'tblPr')
    tw=etree.SubElement(tp, W+'tblW'); tw.set(W+'type','pct'); tw.set(W+'w','5000')
    etree.SubElement(tp, W+'jc').set(W+'val','start')
    no_borders(tp)
    grid=etree.SubElement(tbl, W+'tblGrid')
    for x in cw: etree.SubElement(grid, W+'gridCol').set(W+'w', str(x))
    tr=etree.SubElement(tbl, W+'tr')
    for i,f in enumerate(figs):
        tc=etree.SubElement(tr, W+'tc')
        tcpr=etree.SubElement(tc, W+'tcPr')
        t=etree.SubElement(tcpr, W+'tcW'); t.set(W+'type','dxa'); t.set(W+'w',str(cw[i]))
        for p in figure_paras(f, px, cap_sz=15, src_sz=14): tc.append(p)
    return tbl

# ---------- pretvorba modela ----------
out=[]
used_bm=set()
prev_heading=False

def emit_heading(text, level_fallback):
    global prev_heading
    key=norm(text)
    style=HLEVEL.get(key, level_fallback)
    bm=BOOK.get(key)
    if key=='vizualni prilozi i izvori ilustracija' and 'vizualni prilozi za ovaj modul' not in used_bm:
        bm=BOOK.get('vizualni prilozi za ovaj modul'); style='Heading2'
    if bm and bm['id'] not in used_bm:
        used_bm.add(bm['id'])
        bs=etree.Element(W+'bookmarkStart'); bs.set(W+'id',bm['id']); bs.set(W+'name',bm['name'])
        out.append(bs)
        p=para(style); add_runs(p, [{'text':text,'b':False,'i':False}]); out.append(p)
        be=etree.Element(W+'bookmarkEnd'); be.set(W+'id',bm['id']); out.append(be)
    else:
        p=para(style); add_runs(p, [{'text':text,'b':False,'i':False}]); out.append(p)
    prev_heading=True

# naslov modula + podnaslovna crta, kako stoji u kanonskom dokumentu
p=para('Heading1'); add_runs(p, [{'text':'MODUL 1 — Arhitektura i urbanizam','b':False,'i':False}])
out.append(p)
p=para('FirstParagraph')
add_runs(p, [{'text':'Nastavna cjelina 1. | 4 sata predavanja | Metoda: predavanje, vizualna analiza','b':False,'i':False}])
out.append(p); prev_heading=False

for b in model:
    t=b['t']
    if t in ('eyebrow','title','standfirst','facts'):
        continue
    if t=='h2':
        txt=(b['num']+' '+b['text']).strip() if b.get('num') and b['num']!='V' else b['text']
        emit_heading(txt, 'Heading2'); continue
    if t in ('h3','h4'):
        emit_heading(runs_text(b['runs']).strip(), 'Heading3' if t=='h3' else 'Heading4'); continue
    if t=='p':
        out.append(add_runs(para('FirstParagraph' if prev_heading else 'BodyText'), b['runs']))
        prev_heading=False; continue
    if t=='terms':
        out.append(add_runs(para('FirstParagraph' if prev_heading else 'BodyText'), b['runs']))
        prev_heading=False; continue
    if t=='list':
        nid = new_ordered_numid() if b['ordered'] else BULLET_NUMID
        for it in b['items']:
            out.append(add_runs(para('Compact', numid=nid), it))
        prev_heading=False; continue
    if t=='table':
        out.append(make_table(b))
        out.append(para('BodyText'))          # razmak iza tablice
        prev_heading=False; continue
    if t=='note':
        for i,sub in enumerate(b['blocks']):
            p=para('BlockText')
            if i==0 and b.get('label'):
                p.append(run(b['label']+'. ', bold=True))
            add_runs(p, sub['runs']); out.append(p)
        prev_heading=False; continue
    if t=='triad':
        p=para('BlockText')
        if b.get('label'): p.append(run(b['label']+' ', bold=True))
        for i,(dt,dd) in enumerate(b['pairs']):
            p.append(run(('' if i==0 else ' ')+dt+': ', bold=True)); add_runs(p, dd)
        out.append(p); prev_heading=False; continue
    if t=='figure':
        for e in figure_paras(b, 600): out.append(e)
        prev_heading=False; continue
    if t=='figrow':
        out.append(figure_row_table(b['figs']))
        out.append(para('BodyText'))
        prev_heading=False; continue

# ---------- ugradnja ----------
anchor=kids[START]
for e in out: anchor.addprevious(e)
for k in kids[START:END]: body.remove(k)

doc.write(os.path.join(UNP,'word/document.xml'), xml_declaration=True, encoding='UTF-8', standalone=True)
relsdoc.write(os.path.join(UNP,'word/_rels/document.xml.rels'), xml_declaration=True, encoding='UTF-8', standalone=True)
numdoc.write(os.path.join(UNP,'word/numbering.xml'), xml_declaration=True, encoding='UTF-8', standalone=True)

# jpeg/jpg u [Content_Types]
ctp=etree.parse(os.path.join(UNP,'[Content_Types].xml')); ctr=ctp.getroot()
have={d.get('Extension') for d in ctr if etree.QName(d).localname=='Default'}
for ext,mime in (('jpeg','image/jpeg'),('jpg','image/jpeg')):
    if ext not in have:
        d=etree.Element(CT+'Default'); d.set('Extension',ext); d.set('ContentType',mime); ctr.insert(0,d)
ctp.write(os.path.join(UNP,'[Content_Types].xml'), xml_declaration=True, encoding='UTF-8', standalone=True)

print('ugrađeno elemenata:', len(out))
print('slika:', len(img_cache), '| poveznica:', len(link_cache), '| novih numId:', _nid[0]-3000)
print('iskorišteno bookmarkova:', len(used_bm), 'od', len(BOOK))

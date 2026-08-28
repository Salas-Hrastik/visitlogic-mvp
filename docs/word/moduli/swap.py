# -*- coding: utf-8 -*-
"""M1: zamjena triju shema parovima fotografija.
   M2: popunjavanje predviđenih mjesta Foto 2.x (Prilog A.2)."""
import json, os, re, shutil
from lxml import etree
from PIL import Image

NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'wp':'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a':'http://schemas.openxmlformats.org/drawingml/2006/main',
    'pic':'http://schemas.openxmlformats.org/drawingml/2006/picture'}
W='{%s}'%NS['w']; R='{%s}'%NS['r']; WP='{%s}'%NS['wp']; A='{%s}'%NS['a']; PIC='{%s}'%NS['pic']
PKG='{http://schemas.openxmlformats.org/package/2006/relationships}'
UNP='un'; EMU=9525; TEXTW=9212
F=json.load(open('fswap.json'))

doc=etree.parse(os.path.join(UNP,'word/document.xml'))
body=doc.getroot().find(W+'body'); kids=list(body)
relsdoc=etree.parse(os.path.join(UNP,'word/_rels/document.xml.rels')); relsroot=relsdoc.getroot()
_n=[9500]
def new_rid():
    _n[0]+=1; return 'rId%d'%_n[0]
links={}; imgs={}
def link_rid(u):
    if u in links: return links[u]
    rid=new_rid(); etree.SubElement(relsroot, PKG+'Relationship', Id=rid,
      Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
      Target=u, TargetMode='External'); links[u]=rid; return rid
def img_rid(p):
    if p in imgs: return imgs[p]
    name='sw_%02d.jpg'%(len(imgs)+1)
    _store(p, os.path.join(UNP,'word/media',name))
    rid=new_rid(); etree.SubElement(relsroot, PKG+'Relationship', Id=rid,
      Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
      Target='media/'+name); imgs[p]=rid; return rid


def _store(src, dst, maxw=1100, q=82):
    """Sprema sliku u media/, smanjenu na razumnu razlučivost za tisak."""
    try:
        im=Image.open(src).convert('RGB')
        if im.width>maxw:
            im=im.resize((maxw, round(im.height*maxw/im.width)), Image.LANCZOS)
        im.save(dst,'JPEG',quality=q,optimize=True,progressive=True)
    except Exception:
        shutil.copy(src,dst)
def run(txt,b=False,i=False,sz=None):
    r=etree.Element(W+'r')
    if b or i or sz:
        rpr=etree.SubElement(r,W+'rPr')
        if b: etree.SubElement(rpr,W+'b'); etree.SubElement(rpr,W+'bCs')
        if i: etree.SubElement(rpr,W+'i'); etree.SubElement(rpr,W+'iCs')
        if sz: etree.SubElement(rpr,W+'sz').set(W+'val',str(sz)); etree.SubElement(rpr,W+'szCs').set(W+'val',str(sz))
    t=etree.SubElement(r,W+'t'); t.set('{http://www.w3.org/XML/1998/namespace}space','preserve'); t.text=txt
    return r
def link(u,txt,sz=None):
    h=etree.Element(W+'hyperlink'); h.set(R+'id',link_rid(u))
    r=run(txt,sz=sz); rpr=r.find(W+'rPr')
    if rpr is None: rpr=etree.SubElement(r,W+'rPr'); r.insert(0,rpr)
    st=etree.Element(W+'rStyle'); st.set(W+'val','Hyperlink'); rpr.insert(0,st)
    h.append(r); return h
def para(style='BodyText', jc=None):
    p=etree.Element(W+'p'); ppr=etree.SubElement(p,W+'pPr')
    etree.SubElement(ppr,W+'pStyle').set(W+'val',style)
    if jc: etree.SubElement(ppr,W+'jc').set(W+'val',jc)
    return p
_pic=[0]
def drawing_run(path,pw,ph,alt=''):
    _pic[0]+=1; cx,cy=int(pw*EMU),int(ph*EMU)
    r=etree.Element(W+'r'); d=etree.SubElement(r,W+'drawing')
    inl=etree.SubElement(d,WP+'inline')
    for k in ('distT','distB','distL','distR'): inl.set(k,'0')
    etree.SubElement(inl,WP+'extent',cx=str(cx),cy=str(cy))
    etree.SubElement(inl,WP+'effectExtent',l='0',t='0',r='0',b='0')
    dp=etree.SubElement(inl,WP+'docPr',id=str(7000+_pic[0]),name='Foto %d'%_pic[0])
    if alt: dp.set('descr',alt[:400])
    fp=etree.SubElement(inl,WP+'cNvGraphicFramePr'); etree.SubElement(fp,A+'graphicFrameLocks',noChangeAspect='1')
    g=etree.SubElement(inl,A+'graphic')
    gd=etree.SubElement(g,A+'graphicData',uri='http://schemas.openxmlformats.org/drawingml/2006/picture')
    pic=etree.SubElement(gd,PIC+'pic'); nv=etree.SubElement(pic,PIC+'nvPicPr')
    etree.SubElement(nv,PIC+'cNvPr',id=str(_pic[0]),name=os.path.basename(path))
    etree.SubElement(nv,PIC+'cNvPicPr')
    bf=etree.SubElement(pic,PIC+'blipFill'); etree.SubElement(bf,A+'blip').set(R+'embed',img_rid(path))
    etree.SubElement(etree.SubElement(bf,A+'stretch'),A+'fillRect')
    sp=etree.SubElement(pic,PIC+'spPr'); xf=etree.SubElement(sp,A+'xfrm')
    etree.SubElement(xf,A+'off',x='0',y='0'); etree.SubElement(xf,A+'ext',cx=str(cx),cy=str(cy))
    etree.SubElement(etree.SubElement(sp,A+'prstGeom',prst='rect'),A+'avLst')
    return r
AR32=2/3.0
def uniform(key, target_w=700):
    """Ujednači parove na omjer 3:2 (pejzaž izrez, uspravna uklapanje)."""
    src=f'rawswap/{key}.img'; out=f'pairimg/{key}.jpg'
    if os.path.exists(out): return out
    im=Image.open(src).convert('RGB'); w,h=im.size
    tw,th=target_w, round(target_w*AR32)
    if h/w <= 1.05:
        want_h=w*AR32
        if h>want_h:
            top=round((h-want_h)/2); im=im.crop((0,top,w,top+round(want_h)))
        else:
            want_w=h/AR32; left=round((w-want_w)/2); im=im.crop((left,0,left+round(want_w),h))
        im=im.resize((tw,th), Image.LANCZOS)
    else:
        sc=min(tw/w, th/h); nw,nh=max(1,round(w*sc)),max(1,round(h*sc))
        canvas=Image.new('RGB',(tw,th),(247,247,245))
        canvas.paste(im.resize((nw,nh), Image.LANCZOS), ((tw-nw)//2,(th-nh)//2))
        im=canvas
    im.save(out,'JPEG',quality=84,optimize=True,progressive=True)
    return out

def fit(path,maxw,maxh):
    w,h=Image.open(path).size; ar=h/w
    pw=min(maxw,w); ph=round(pw*ar)
    if ph>maxh: ph=maxh; pw=round(maxh/ar)
    return pw,ph
def credit_runs(key, sz=None, prefix='Snimio/la: '):
    v=F[key]
    t=re.sub(r'^File:','',v['title']); t=re.sub(r'\.(jpg|jpeg|png|JPG|JPEG|PNG)$','',t)
    a=(v.get('artist') or v.get('credit') or 'autor nije naveden')
    a=re.sub(r'^(No machine-readable author provided\.?\s*)','',a)
    a=re.sub(r'\s*assumed.*$','',a,flags=re.I).strip(' .') or 'autor nije naveden'
    lic=v.get('license') or ''
    lab='javno vlasništvo' if re.match(r'public domain|pdm',lic,re.I) else lic
    out=[run(f'{prefix}{a} · ',sz=sz), link(v['descurl'],t,sz=sz), run(', Wikimedia Commons · ',sz=sz)]
    out.append(link(v['licurl'],lab,sz=sz) if v.get('licurl') else run(lab,sz=sz))
    return out

def ptext(p): return re.sub(r'\s+',' ',''.join(n.text or '' for n in p.iter(W+'t'))).strip()

# ---------- A) MODUL 1: shema -> par fotografija ----------
PAIRS=[
 (287, ('kula_kvadratna','Motovun — gradska kula, 14. st.'),
       ('kula_bastion','Bokar, Dubrovnik — 15./16. st.'),
   'Kula datira utvrdu.', ' Visoka kvadratična prizma građena je za obranu hladnim oružjem; kad je stiglo vatreno, gradi se nisko, okruglo i masivno, s terasama za topove. Michelozzo je upravo tako u Dubrovniku opasao postojeće gotičke kule.'),
 (297, ('int_bazilika','Katedrala sv. Stošije, Zadar — bazilika'),
       ('int_dvorana','Crkva sv. Marka, Zagreb — dvoranska crkva'),
   'Razlika koju gost vidi čim uđe.', ' U bazilici je srednji brod viši od bočnih i sam se osvjetljava gornjim prozorima. U dvoranskoj crkvi visine su izjednačene, svjetlo ulazi samo s bokova, a prostor djeluje kao jedinstvena dvorana.'),
 (320, ('sibenik_zapad','Šibenik — pročelje je obris svodova'),
       ('osor_procelje','Osor — trolist kao kulisa'),
   'Zašto je šibensko pročelje jedinstveno.', ' U Šibeniku obris pročelja doslovno ponavlja tri svoda iza sebe — jedino funkcionalno trolisno pročelje u Europi. Drugdje, kao u Osoru, isti trolisni obris stoji kao kulisa pred običnom bazilikom s kosim krovovima.'),
]
zamijenjeno=0
for idx,(k1,c1),(k2,c2),lead,rest in PAIRS:
    imgp=kids[idx]; capp=kids[idx+1]; srcp=kids[idx+2]
    cw=[TEXTW//2, TEXTW-TEXTW//2]
    tbl=etree.Element(W+'tbl'); tp=etree.SubElement(tbl,W+'tblPr')
    tw=etree.SubElement(tp,W+'tblW'); tw.set(W+'type','pct'); tw.set(W+'w','5000')
    etree.SubElement(tp,W+'jc').set(W+'val','start')
    tb=etree.SubElement(tp,W+'tblBorders')
    for side in ('top','start','bottom','end','insideH','insideV'):
        e=etree.SubElement(tb,W+side); e.set(W+'val','none'); e.set(W+'sz','0'); e.set(W+'space','0')
    grid=etree.SubElement(tbl,W+'tblGrid')
    for x in cw: etree.SubElement(grid,W+'gridCol').set(W+'w',str(x))
    tr=etree.SubElement(tbl,W+'tr')
    for i,(key,sub) in enumerate(((k1,c1),(k2,c2))):
        tc=etree.SubElement(tr,W+'tc'); tcpr=etree.SubElement(tc,W+'tcPr')
        t=etree.SubElement(tcpr,W+'tcW'); t.set(W+'type','dxa'); t.set(W+'w',str(cw[i]))
        up=uniform(key)
        pw,ph=fit(up,285,235)
        p=para('BodyText',jc='center'); p.append(drawing_run(up,pw,ph,sub)); tc.append(p)
        cp=para('BodyText'); cp.append(run(sub,b=True,sz=17)); tc.append(cp)
        sp=para('BodyText')
        for r in credit_runs(key,sz=15,prefix='Foto: '): sp.append(r)
        tc.append(sp)
    imgp.addprevious(tbl); body.remove(imgp)
    for ch in list(capp):
        if ch.tag!=W+'pPr': capp.remove(ch)
    capp.append(run(lead,b=True)); capp.append(run(rest))
    body.remove(srcp)
    zamijenjeno+=1

# ---------- B) MODUL 2: popunjavanje mjesta Foto 2.x ----------
def after_scheme(i):
    return kids[i+2]
def end_of_section(title):
    hi=None
    for i,k in enumerate(kids):
        if etree.QName(k).localname=='p' and ptext(k)==title:
            ppr=k.find(W+'pPr'); ps=ppr.find(W+'pStyle') if ppr is not None else None
            if ps is not None and ps.get(W+'val','').startswith('Heading'): hi=i; break
    if hi is None: return None
    last=kids[hi]
    for j in range(hi+1,len(kids)):
        k=kids[j]
        if etree.QName(k).localname=='p':
            ppr=k.find(W+'pPr'); ps=ppr.find(W+'pStyle') if ppr is not None else None
            if ps is not None and ps.get(W+'val','').startswith('Heading'): break
        last=k
    return last

PHOTOS=[
 (after_scheme(709), 'plutej', 'Foto 2.2 — Reljef s oltarne pregrade crkve sv. Nedjeljice, Zadar, 11. st. Muzej hrvatskih arheoloških spomenika, Split.'),
 (after_scheme(718), 'ploca_vladara', 'Foto 2.3 — Ploča s likom vladara, 11. st. Krstionica splitske katedrale, Split.'),
 (after_scheme(725), 'buvina', 'Foto 2.4 — Andrija Buvina, vratnice splitske katedrale, 1214. Katedrala sv. Duje, Split.'),
 (after_scheme(738), 'radovan_portal', 'Foto 2.5 — Majstor Radovan, portal katedrale sv. Lovre, 1240. — detalj arhivolte. Trogir.'),
 (end_of_section('Hrvojev misal (1403./1404.)'), 'hrvojev_misal', 'Foto 2.8 — Hrvojev misal, 1403./1404. — stranica s inicijalom i minijaturom.'),
 (end_of_section('Slikarstvo XIX. stoljeća'), 'karas', 'Foto 2.11 — Vjekoslav Karas, Rimljanka s lutnjom, oko 1845.–1847.'),
 (end_of_section('Münchenski krug (oko 1905.–1914.)'), 'racic', 'Foto 2.14 — Josip Račić, Autoportret, 1908. Moderna galerija, Zagreb.'),
]
umetnuto=0
for anchor,key,cap in PHOTOS:
    if anchor is None: print('!! nema sidra za', key); continue
    pw,ph=fit(f'rawswap/{key}.img',420,340)
    p=para('BodyText',jc='center'); p.append(drawing_run(f'rawswap/{key}.img',pw,ph,cap))
    cp=para('BodyText'); cp.append(run(cap,b=True))
    sp=para('BodyText')
    for r in credit_runs(key): sp.append(r)
    prev=anchor
    for e in (p,cp,sp): prev.addnext(e); prev=e
    umetnuto+=1

doc.write(os.path.join(UNP,'word/document.xml'), xml_declaration=True, encoding='UTF-8', standalone=True)
relsdoc.write(os.path.join(UNP,'word/_rels/document.xml.rels'), xml_declaration=True, encoding='UTF-8', standalone=True)
print('M1 shema zamijenjeno:', zamijenjeno, '| M2 fotografija umetnuto:', umetnuto, '| slika:', len(imgs))

# -*- coding: utf-8 -*-
"""Umeće ilustracije u MODUL 5 kanonskoga udžbenika, po konvenciji Modula 2."""
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
UNP='un'; EMU=9525; IMGW=600; MAXH=470

CCBYSA4='https://creativecommons.org/licenses/by-sa/4.0/'
f5=json.load(open('f5.json'))

# ---- specifikacija slika: (nakon kojeg elementa, vrsta, podaci) ----
SCHEME='scheme'; PHOTO='photo'
FIGS=[
 (1297, SCHEME, dict(file='sheme/m5_1.png', no='5.1',
    cap='Tko zapravo štiti upisano dobro')),
 (1307, PHOTO, dict(key='plitvice', lead='Nacionalni park Plitvička jezera',
    desc=' — upisan 1979., proširenje granica 2000. Sedrene barijere koje i danas rastu razlog su zbog kojega je dobro upisano i po geološkom (viii) i po ekološkom kriteriju (ix), uz kriterij iznimnoga prirodnog fenomena (vii).')),
 (1309, PHOTO, dict(key='trogir_grad', lead='Povijesni grad Trogir',
    desc=' — upisan 1997. Gradska jezgra na otočiću između kopna i Čiova zadržala je srednjovjekovno tkivo gotovo neizmijenjeno.')),
 (1309, PHOTO, dict(key='stecci', lead='Stećci',
    desc=' — srednjovjekovni nadgrobni spomenici; serijski i transnacionalni upis iz 2016., zajedno s Bosnom i Hercegovinom, Srbijom i Crnom Gorom.')),
 (1309, PHOTO, dict(key='bukova_prasuma', lead='Bukova šuma na Velebitu',
    desc=' — hrvatske sastavnice serijskoga upisa „Drevne i pradavne bukove šume Karpata i drugih regija Europe” nalaze se u NP Sjeverni Velebit i NP Paklenica.')),
 (1314, PHOTO, dict(w=420, mh=320, key='pag_cipka', lead='Čipkarstvo u Hrvatskoj',
    desc=' — upis 2009. obuhvaća tri različite tehnike: pašku čipku iglom, lepoglavsku čipku batićima i hvarsku čipku od niti agave.')),
 (1314, PHOTO, dict(w=420, mh=320, key='sinjska_alka', lead='Sinjska alka',
    desc=' — viteški turnir u Sinju, upisan 2010. Održava se u spomen na obranu grada 1715.')),
 (1314, PHOTO, dict(w=420, mh=320, key='zvoncari', lead='Zvončari s područja Kastavštine',
    desc=' — godišnji pokladni ophod, upisan 2009. Zvonima i maskama tjeraju zimu; ophod ide od sela do sela po utvrđenom redu.')),
 (1314, PHOTO, dict(w=420, mh=320, key='festa_vlaha', lead='Festa sv. Vlaha',
    desc=' — svečanost zaštitnika Dubrovnika, upisana 2009. Održava se 3. veljače, uz sudjelovanje bratovština i barjaktara dubrovačkih župa.')),
 (1314, PHOTO, dict(w=420, mh=320, key='ljelje', lead='Ljelje ili kraljice iz Gorjana',
    desc=' — godišnji proljetni ophod, upisan 2009. Djevojke podijeljene na „kraljeve” sa sabljama i „kraljice” s vijencima obilaze selo.')),
 (1314, PHOTO, dict(w=420, mh=320, key='licitari', lead='Medičarski obrt',
    desc=' — umijeće izrade licitara na području sjeverne Hrvatske, upisano 2010.')),
 (1314, PHOTO, dict(w=420, mh=320, key='klapa', lead='Klapsko pjevanje',
    desc=' — višeglasno pjevanje bez pratnje, upisano 2012.')),
 (1318, PHOTO, dict(w=420, mh=320, key='batana', lead='Ekomuzej „Kuća o batani” u Rovinju',
    desc=' — upisan 2016. u Registar dobrih praksi očuvanja. Postav objašnjava gradnju i uporabu batane, tradicijske rovinjske barke.')),
 (1334, SCHEME, dict(file='sheme/m5_2.png', no='5.2',
    cap='Upisano dobro, zaštitna zona i što u kojoj vrijedi')),
 (1335, SCHEME, dict(file='sheme/m5_3.png', no='5.3',
    cap='Put do upisa i obveze koje slijede')),
]

doc=etree.parse(os.path.join(UNP,'word/document.xml'))
body=doc.getroot().find(W+'body'); kids=list(body)
relsdoc=etree.parse(os.path.join(UNP,'word/_rels/document.xml.rels')); relsroot=relsdoc.getroot()
_n=[9000]
def new_rid():
    _n[0]+=1; return 'rId%d'%_n[0]
links={}
def link_rid(url):
    if url in links: return links[url]
    rid=new_rid()
    etree.SubElement(relsroot, PKG+'Relationship', Id=rid,
      Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
      Target=url, TargetMode='External')
    links[url]=rid; return rid
imgs={}
def img_rid(path):
    if path in imgs: return imgs[path]
    name='m5_%02d.jpg'%(len(imgs)+1)     # _store uvijek sprema JPEG
    _store(path, os.path.join(UNP,'word/media',name))
    rid=new_rid()
    etree.SubElement(relsroot, PKG+'Relationship', Id=rid,
      Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
      Target='media/'+name)
    imgs[path]=rid; return rid


def _store(src, dst, maxw=1100, q=82):
    """Sprema sliku u media/, smanjenu na razumnu razlučivost za tisak."""
    try:
        im=Image.open(src).convert('RGB')
        if im.width>maxw:
            im=im.resize((maxw, round(im.height*maxw/im.width)), Image.LANCZOS)
        im.save(dst,'JPEG',quality=q,optimize=True,progressive=True)
    except Exception:
        shutil.copy(src,dst)
def run(text, bold=False, ital=False):
    r=etree.Element(W+'r')
    if bold or ital:
        rpr=etree.SubElement(r, W+'rPr')
        if bold: etree.SubElement(rpr, W+'b'); etree.SubElement(rpr, W+'bCs')
        if ital: etree.SubElement(rpr, W+'i'); etree.SubElement(rpr, W+'iCs')
    t=etree.SubElement(r, W+'t'); t.set('{http://www.w3.org/XML/1998/namespace}space','preserve'); t.text=text
    return r
def link(url, text):
    h=etree.Element(W+'hyperlink'); h.set(R+'id', link_rid(url))
    r=run(text); rpr=etree.SubElement(r, W+'rPr'); r.insert(0,rpr)
    st=etree.Element(W+'rStyle'); st.set(W+'val','Hyperlink'); rpr.insert(0,st)
    h.append(r); return h
def para(style='BodyText', jc=None):
    p=etree.Element(W+'p'); ppr=etree.SubElement(p, W+'pPr')
    etree.SubElement(ppr, W+'pStyle').set(W+'val', style)
    if jc: etree.SubElement(ppr, W+'jc').set(W+'val', jc)
    return p

_pic=[0]
def image_para(path, alt='', width=None, maxh=None):
    _pic[0]+=1
    w,h=Image.open(path).size; ar=h/w
    pw=width or IMGW; ph=round(pw*ar)
    cap=maxh or MAXH
    if ph>cap: ph=cap; pw=round(cap/ar)
    cx,cy=int(pw*EMU), int(ph*EMU)
    p=para('BodyText', jc='center')
    r=etree.SubElement(p, W+'r'); d=etree.SubElement(r, W+'drawing')
    inl=etree.SubElement(d, WP+'inline')
    for k in ('distT','distB','distL','distR'): inl.set(k,'0')
    etree.SubElement(inl, WP+'extent', cx=str(cx), cy=str(cy))
    etree.SubElement(inl, WP+'effectExtent', l='0', t='0', r='0', b='0')
    dp=etree.SubElement(inl, WP+'docPr', id=str(5000+_pic[0]), name='Slika M5-%d'%_pic[0])
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
    etree.SubElement(bf, A+'blip').set(R+'embed', img_rid(path))
    etree.SubElement(etree.SubElement(bf, A+'stretch'), A+'fillRect')
    sp=etree.SubElement(pic, PIC+'spPr')
    xf=etree.SubElement(sp, A+'xfrm')
    etree.SubElement(xf, A+'off', x='0', y='0'); etree.SubElement(xf, A+'ext', cx=str(cx), cy=str(cy))
    etree.SubElement(etree.SubElement(sp, A+'prstGeom', prst='rect'), A+'avLst')
    return p

def build(kind, d):
    out=[]
    if kind==SCHEME:
        out.append(image_para(d['file'], d['cap']))
        cap=para(); cap.append(run(f"Sl. {d['no']} — {d['cap']}", bold=True)); out.append(cap)
        src=para(); src.append(run('Shema: vlastita izrada za Modul 5 · '))
        src.append(link(CCBYSA4,'CC BY-SA 4.0')); out.append(src)
    else:
        v=f5[d['key']]
        out.append(image_para(f"raw5/{d['key']}.img", d['lead'], d.get('w'), d.get('mh')))
        cap=para(); cap.append(run(d['lead'], bold=True)); cap.append(run(d['desc'])); out.append(cap)
        title=re.sub(r'^File:','',v['title']); title=re.sub(r'\.(jpg|jpeg|png|JPG|JPEG|PNG)$','',title)
        author=(v.get('artist') or v.get('credit') or 'autor nije naveden')
        author=re.sub(r'^(No machine-readable author provided\.?\s*)','',author)
        author=re.sub(r'\s*assumed.*$','',author, flags=re.I).strip(' .') or 'autor nije naveden'
        src=para(); src.append(run(f'Foto: {author} · '))
        src.append(link(v['descurl'], title))
        lic=v.get('license') or ''
        lab='javno vlasništvo' if re.match(r'public domain|pdm', lic, re.I) else lic
        src.append(run(', Wikimedia Commons · '))
        src.append(link(v['licurl'], lab) if v.get('licurl') else run(lab))
        out.append(src)
    return out

# umetanje: po sidru, redom
from collections import defaultdict
byanchor=defaultdict(list)
for a,kind,d in FIGS: byanchor[a].append((kind,d))
for a, items in byanchor.items():
    anchor=kids[a]
    prev=anchor
    for kind,d in items:
        for e in build(kind,d):
            prev.addnext(e); prev=e

doc.write(os.path.join(UNP,'word/document.xml'), xml_declaration=True, encoding='UTF-8', standalone=True)
relsdoc.write(os.path.join(UNP,'word/_rels/document.xml.rels'), xml_declaration=True, encoding='UTF-8', standalone=True)
print('umetnuto figura:', len(FIGS), '| slika:', len(imgs), '| poveznica:', len(links))

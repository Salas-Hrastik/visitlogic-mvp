# -*- coding: utf-8 -*-
"""Umeće fotografije u module 3, 4, 6 i 7, po konvenciji Modula 2 (Foto X.Y)."""
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
UNP='un'; EMU=9525
F=json.load(open('f3467.json'))

doc=etree.parse(os.path.join(UNP,'word/document.xml'))
body=doc.getroot().find(W+'body')
relsdoc=etree.parse(os.path.join(UNP,'word/_rels/document.xml.rels')); relsroot=relsdoc.getroot()
_n=[9700]
def new_rid():
    _n[0]+=1; return 'rId%d'%_n[0]
links={}; imgs={}
def link_rid(u):
    if u in links: return links[u]
    rid=new_rid(); etree.SubElement(relsroot,PKG+'Relationship',Id=rid,
      Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
      Target=u,TargetMode='External'); links[u]=rid; return rid
def img_rid(p):
    if p in imgs: return imgs[p]
    name='mx_%02d.jpg'%(len(imgs)+1)
    _store(p, os.path.join(UNP,'word/media',name))
    rid=new_rid(); etree.SubElement(relsroot,PKG+'Relationship',Id=rid,
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
def run(t,b=False,i=False):
    r=etree.Element(W+'r')
    if b or i:
        rpr=etree.SubElement(r,W+'rPr')
        if b: etree.SubElement(rpr,W+'b'); etree.SubElement(rpr,W+'bCs')
        if i: etree.SubElement(rpr,W+'i'); etree.SubElement(rpr,W+'iCs')
    e=etree.SubElement(r,W+'t'); e.set('{http://www.w3.org/XML/1998/namespace}space','preserve'); e.text=t
    return r
def link(u,t):
    h=etree.Element(W+'hyperlink'); h.set(R+'id',link_rid(u))
    r=run(t); rpr=etree.SubElement(r,W+'rPr'); r.insert(0,rpr)
    st=etree.Element(W+'rStyle'); st.set(W+'val','Hyperlink'); rpr.insert(0,st)
    h.append(r); return h
def para(style='BodyText',jc=None):
    p=etree.Element(W+'p'); ppr=etree.SubElement(p,W+'pPr')
    etree.SubElement(ppr,W+'pStyle').set(W+'val',style)
    if jc: etree.SubElement(ppr,W+'jc').set(W+'val',jc)
    return p
_pic=[0]
def image_para(path,alt='',maxw=430,maxh=340):
    _pic[0]+=1
    w,h=Image.open(path).size; ar=h/w
    pw=min(maxw,w); ph=round(pw*ar)
    if ph>maxh: ph=maxh; pw=round(maxh/ar)
    cx,cy=int(pw*EMU),int(ph*EMU)
    p=para('BodyText',jc='center')
    r=etree.SubElement(p,W+'r'); d=etree.SubElement(r,W+'drawing')
    inl=etree.SubElement(d,WP+'inline')
    for k in ('distT','distB','distL','distR'): inl.set(k,'0')
    etree.SubElement(inl,WP+'extent',cx=str(cx),cy=str(cy))
    etree.SubElement(inl,WP+'effectExtent',l='0',t='0',r='0',b='0')
    dp=etree.SubElement(inl,WP+'docPr',id=str(8000+_pic[0]),name='Foto %d'%_pic[0])
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
    return p
def credit(key):
    v=F[key]
    t=re.sub(r'^File:','',v['title']); t=re.sub(r'\.(jpg|jpeg|png|JPG|JPEG|PNG)$','',t)
    a=(v.get('artist') or v.get('credit') or 'autor nije naveden')
    a=re.sub(r'^(No machine-readable author provided\.?\s*)','',a)
    a=re.sub(r'\s*assumed.*$','',a,flags=re.I).strip(' .') or 'autor nije naveden'
    lic=v.get('license') or ''
    lab='javno vlasništvo' if re.match(r'public domain|pdm',lic,re.I) else lic
    p=para(); p.append(run(f'Snimio/la: {a} · ')); p.append(link(v['descurl'],t))
    p.append(run(', Wikimedia Commons · '))
    p.append(link(v['licurl'],lab) if v.get('licurl') else run(lab))
    return p

def ptext(p): return re.sub(r'\s+',' ',''.join(n.text or '' for n in p.iter(W+'t'))).strip()
def find_after(snippet, start=0):
    """Vrati element (p ili tbl) koji sadrži zadani tekst."""
    for k in list(body)[start:]:
        if snippet in ptext(k): return k
    return None

# (sidro-tekst, ključ slike, naslov, opis)
PLAN=[
 # ---- MODUL 3 ----
 ('Bašćanska ploča','m3_bascanska','Bašćanska ploča, oko 1100.','Crkva sv. Lucije, Jurandvor na Krku (izvornik u HAZU, Zagreb). Najpoznatiji glagoljični spomenik i prvi domaći spomen hrvatskoga vladara na narodnom jeziku.'),
 ('Bašćanska ploča','m3_glagoljica','Glagoljični zapis','Uglata glagoljica hrvatske redakcije, pismo kojim su pisani liturgijski i pravni tekstovi od 9. do 19. stoljeća.'),
 ('Bašćanska ploča','m3_vinodolski','Novi Vinodolski','Frankopanski kaštel u gradu u kojem je 1288. sastavljen Vinodolski zakonik, jedan od najstarijih zakonika na narodnom jeziku u Europi.'),
 ('Tri rečenice za goste — glagoljica','m3_misal1483','Misal po zakonu rimskoga dvora, 1483.','Prva hrvatska tiskana knjiga i prvi europski misal tiskan nelatiničnim slovima, samo 28 godina nakon Gutenbergove Biblije.'),
 ('Marulićevi dani','m3_marulic','Spomenik Marku Maruliću','Marulić (1450.–1524.) piše na hrvatskom, latinskom i talijanskom; Judita (1501., tiskana 1521.) prvi je ep na hrvatskom jeziku.'),
 ('Ribanje i ribarsko prigovaranje','m3_tvrdalj','Tvrdalj, Stari Grad na Hvaru','Utvrđeni ljetnikovac Petra Hektorovića, pisca Ribanja i ribarskoga prigovaranja (1568.), s ribnjakom i natpisima na trima jezicima.'),
 ('Ribanje i ribarsko prigovaranje','m3_gundulic','Spomenik Ivanu Gunduliću, Dubrovnik','Reljefi na postamentu prikazuju prizore iz Osmana; Gundulić je središnja figura dubrovačkoga baroknog kruga.'),
 ('Ljudevit Gaj','m3_gaj','Ljudevit Gaj (1809.–1872.)','Vođa narodnoga preporoda; njegova pravopisna reforma temelj je današnje hrvatske latinice.'),
 ('Smail','m3_mazuranic','Ivan Mažuranić (1814.–1890.)','Pisac Smrti Smail-age Čengića i prvi hrvatski ban pučanin.'),
 ('August Šenoa','m3_senoa','August Šenoa (1838.–1881.)','Utemeljitelj hrvatskoga romana i tvorac čitateljske publike; Zlatarovo zlato i Seljačka buna.'),
 ('Antun Gustav Matoš','m3_matos','Spomenik A. G. Matošu, Zagreb','Djelo Ivana Kožarića na Strossmayerovu šetalištu, jedno od najprepoznatljivijih mjesta susreta književnosti i grada.'),
 # ---- MODUL 4 ----
 ('sopile','m4_tamburica','Tambura','Tambura je nositelj slavonske glazbene tradicije; javlja se u nizu veličina, od samice do berde.'),
 ('sopile','m4_gusle','Gusle','Jednožično gudačko glazbalo dinarskoga područja, pratnja epskomu pjevanju i ojkanju.'),
 ('sopile','m4_lijerica','Lijerica','Troglasno gudačko glazbalo dubrovačkoga zaleđa i Konavala, pratnja linđu i poskočici.'),
 ('Nikola Šubić Zrinski','m4_zajc','Ivan pl. Zajc (1832.–1914.)','Skladatelj opere Nikola Šubić Zrinski (1876.) i dugogodišnji ravnatelj Hrvatskoga glazbenog zavoda.'),
 ('Nikola Šubić Zrinski','m4_lisinski','Koncertna dvorana Vatroslava Lisinskog, Zagreb','Nazvana po skladatelju prve hrvatske opere Ljubav i zloba (1846.); središnja koncertna pozornica u zemlji.'),
 ('Dora Pejačević','m4_pejacevic','Dora Pejačević (1885.–1923.)','Autorica prve hrvatske simfonije modernoga tipa i niza djela komorne i solističke glazbe.'),
 # ---- MODUL 6 ----
 ('Posavska drvena kuća','m6_posavska','Posavska drvena kuća, Krapje','Hrastove planke, trijem i visoko podnožje zbog poplava; Krapje je selo graditeljske baštine u Lonjskom polju.'),
 ('Posavska drvena kuća','m6_kumrovec','Staro selo, Kumrovec','Muzej na otvorenom sa zagorskim hižama od drva i pletera oblijepljena blatom.'),
 ('Tri rečenice za goste — suhozidi','m6_suhozid','Suhozid','Umijeće suhozidne gradnje upisano je 2018. na Reprezentativni popis UNESCO-a kao višenacionalna nominacija.'),
 ('Placevi (tržnice)','m6_trznica','Dolac, Zagreb','Gradska tržnica kao svakodnevno mjesto susreta; „trbuh Zagreba” od 1930.'),
 ('Placevi (tržnice)','m6_korzo','Korzo, Rijeka','Riječki korzo — glavna gradska šetnica i najpoznatiji hrvatski primjer korza kao društvene ustanove.'),
 # ---- MODUL 7 ----
 ('slavonska kobasica','m7_kulen','Kulen','Slavonski suhomesnati proizvod od mljevene svinjetine i mljevene paprike; slavonski kulen nosi oznaku ZOZP.'),
 ('zagorski štrukli','m7_strukli','Zagorski štrukli','Tijesto s nadjevom od svježega sira, kuhani ili pečeni; zaštićeni kao ZOZP.'),
 ('istarski pršut','m7_prsut','Pršut','Sušena svinjska butina; istarski, dalmatinski, drniški i krčki pršut nose zaštićene oznake.'),
 ('istarski pršut','m7_tartuf','Istarski tartuf','Bijeli i crni tartuf iz Motovunske šume; sastojak koji je istarskoj kuhinji donio međunarodnu prepoznatljivost.'),
 ('istarski pršut','m7_boskarin','Boškarin','Istarsko govedo (istarski podolac), nekoć radna životinja, danas zaštićena pasmina i gastronomski proizvod.'),
 ('paška janjetina','m7_paski_sir','Paški sir','Ovčji tvrdi sir s Paga; okus se pripisuje paši prošaranoj solju i aromatičnim biljem.'),
 ('paška janjetina','m7_solana','Solana u Stonu','Jedna od najstarijih solana na Sredozemlju; sol je stoljećima bila glavni izvor prihoda Dubrovačke Republike.'),
]
COUNT={}
LAST={}                      # zadnji umetnuti element po sidru (očuva redoslijed)
umetnuto=0; preskoceno=[]
for snippet,key,lead,desc in PLAN:
    if key not in F or not os.path.exists(f'raw3467/{key}.img'):
        preskoceno.append(key); continue
    anchor=LAST.get(snippet)
    if anchor is None: anchor=find_after(snippet)
    if anchor is None:
        preskoceno.append(key+' (nema sidra)'); continue
    mod=key.split('_')[0][1]              # '3','4','6','7'
    COUNT[mod]=COUNT.get(mod,0)+1
    no=f'Foto {mod}.{COUNT[mod]}'
    cap=para(); cap.append(run(f'{no} — {lead.rstrip(".")}.',b=True)); cap.append(run(' '+desc))
    p=image_para(f'raw3467/{key}.img', f'{lead}. {desc}')
    prev=anchor
    for e in (p,cap,credit(key)): prev.addnext(e); prev=e
    LAST[snippet]=prev
    umetnuto+=1

doc.write(os.path.join(UNP,'word/document.xml'),xml_declaration=True,encoding='UTF-8',standalone=True)
relsdoc.write(os.path.join(UNP,'word/_rels/document.xml.rels'),xml_declaration=True,encoding='UTF-8',standalone=True)
print('umetnuto:',umetnuto,'| po modulima:',COUNT,'| preskočeno:',preskoceno)

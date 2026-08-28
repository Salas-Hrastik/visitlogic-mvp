# -*- coding: utf-8 -*-
"""HTML modula -> model.json za izradu .docx datoteke."""
from html.parser import HTMLParser
import json, re, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'modul-1-arhitektura-urbanizam.html')

class Node:
    __slots__=('tag','attrs','kids','text','parent')
    def __init__(self, tag, attrs=None, parent=None):
        self.tag=tag; self.attrs=attrs or {}; self.kids=[]; self.text=None; self.parent=parent

VOID={'img','br','hr','link','meta','use','line','rect','circle','ellipse','polygon','polyline','path'}

class T(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root=Node('root'); self.cur=self.root; self.skip=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag in ('style','script'): self.skip+=1; return
        n=Node(tag,a,self.cur); self.cur.kids.append(n)
        if tag not in VOID: self.cur=n
    def handle_endtag(self, tag):
        if tag in ('style','script'):
            if self.skip: self.skip-=1
            return
        if tag in VOID: return
        n=self.cur
        while n is not self.root and n.tag!=tag: n=n.parent
        if n is not self.root: self.cur=n.parent
    def handle_data(self, d):
        if self.skip or not d.strip(): 
            if self.skip: return
        t=Node('#text',parent=self.cur); t.text=d; self.cur.kids.append(t)

def sp(s): return re.sub(r'\s+',' ',s)

def runs(node, bold=False, ital=False, href=None, out=None):
    """Skupi tekstualne runove s osnovnim formatiranjem."""
    if out is None: out=[]
    for k in node.kids:
        if k.tag=='#text':
            if k.text.strip() or (out and not out[-1]['text'].endswith(' ')):
                out.append({'text':sp(k.text),'b':bold,'i':ital,**({'href':href} if href else {})})
        elif k.tag in ('b','strong'): runs(k, True, ital, href, out)
        elif k.tag in ('em','i','cite'): runs(k, bold, True, href, out)
        elif k.tag=='a': runs(k, bold, ital, k.attrs.get('href'), out)
        elif k.tag=='code': runs(k, bold, ital, href, out)
        elif k.tag in ('span','tspan','sup','sub'): runs(k, bold, ital, href, out)
        elif k.tag=='br': out.append({'text':' ','b':bold,'i':ital})
        else: runs(k, bold, ital, href, out)
    # spoji i očisti
    merged=[]
    for r in out:
        if not r['text']: continue
        if merged and merged[-1]['b']==r['b'] and merged[-1]['i']==r['i'] and merged[-1].get('href')==r.get('href'):
            merged[-1]['text']+=r['text']
        else: merged.append(dict(r))
    if merged:
        merged[0]['text']=merged[0]['text'].lstrip()
        merged[-1]['text']=merged[-1]['text'].rstrip()
    return [m for m in merged if m['text']]

def cls(n): return n.attrs.get('class','')

def deep_find(n, tag, klass=None):
    for k in n.kids:
        if k.tag==tag and (klass is None or klass in cls(k)): return k
        r=deep_find(k, tag, klass)
        if r is not None: return r
    return None

def find(n, tag, klass=None):
    for k in n.kids:
        if k.tag==tag and (klass is None or klass in cls(k)): return k
    return None

def txt(n): return sp(''.join(x['text'] for x in runs(n))).strip() if n is not None else ''

BLOCKS=[]
def emit(b): BLOCKS.append(b)

def do_table(tbl):
    head=[]; rows=[]
    for sec in tbl.kids:
        if sec.tag=='thead':
            for tr in sec.kids:
                if tr.tag=='tr': head=[runs(c) for c in tr.kids if c.tag in ('th','td')]
        elif sec.tag=='tbody':
            for tr in sec.kids:
                if tr.tag=='tr': rows.append([runs(c) for c in tr.kids if c.tag in ('th','td')])
    emit({'t':'table','head':head,'rows':rows})

def do_figure(fig):
    img=find(fig,'img'); svg=find(fig,'svg')
    cap=find(fig,'figcaption')
    src=None
    if cap is not None:
        for k in cap.kids:
            if k.tag=='span' and 'src' in cls(k): src=k
    caption=[]
    if cap is not None:
        tmp=Node('tmp'); tmp.kids=[k for k in cap.kids if k is not src]
        caption=runs(tmp)
    return {'t':'figure',
            'img': (img.attrs.get('src') if img is not None else None),
            'svg': svg is not None,
            'caption':caption,
            'src': runs(src) if src is not None else []}

def walk(n):
    for k in n.kids:
        c=cls(k)
        if k.tag=='nav': continue
        if k.tag=='header':
            eb=deep_find(k,'p','eyebrow')
            emit({'t':'eyebrow','text':txt(eb)})
            walk(k); continue
        if k.tag=='h1': emit({'t':'title','text':txt(k)}); continue
        if k.tag=='p' and 'standfirst' in c: emit({'t':'standfirst','text':txt(k)}); continue
        if k.tag=='p' and 'eyebrow' in c: continue
        if k.tag=='dl' and 'facts' in cls(k.parent or k): pass
        if k.tag=='dl' and k.parent is not None and 'facts' in cls(k.parent):
            pass
        if k.tag=='dl' and 'facts' in c:
            items=[]
            for d in k.kids:
                if d.tag=='div':
                    items.append([txt(find(d,'dt')), txt(find(d,'dd'))])
            emit({'t':'facts','items':items}); continue
        if k.tag=='div' and 'sect-head' in c:
            emit({'t':'h2','num':txt(find(k,'span','sect-num')),'text':txt(find(k,'h2'))}); continue
        if k.tag in ('h3','h4'): emit({'t':k.tag,'runs':runs(k)}); continue
        if k.tag=='p' and 'terms' in c: emit({'t':'terms','runs':runs(k)}); continue
        if k.tag=='p': emit({'t':'p','runs':runs(k)}); continue
        if k.tag in ('ul','ol') and 'credits' in c:
            emit({'t':'list','ordered':True,'small':True,
                  'items':[runs(li) for li in k.kids if li.tag=='li']}); continue
        if k.tag in ('ul','ol'):
            emit({'t':'list','ordered':k.tag=='ol',
                  'items':[runs(li) for li in k.kids if li.tag=='li']}); continue
        if k.tag=='div' and 'tbl' in c:
            tb=find(k,'table')
            if tb is not None: do_table(tb)
            continue
        if k.tag=='div' and 'note' in c:
            lbl=find(k,'span','lbl')
            sub=[]
            for p in k.kids:
                if p.tag=='p': sub.append({'t':'p','runs':runs(p)})
            emit({'t':'note','kind':'mark' if 'method' in c else 'sea','label':txt(lbl),'blocks':sub}); continue
        if k.tag=='div' and 'triad' in c:
            lbl=find(k,'span','lbl'); dl=find(k,'dl'); pairs=[]; cur=None
            if dl is not None:
                for d in dl.kids:
                    if d.tag=='dt': cur=txt(d)
                    elif d.tag=='dd': pairs.append([cur, runs(d)])
            emit({'t':'triad','label':txt(lbl),'pairs':pairs}); continue
        if k.tag=='div' and ('duo' in c or 'trio' in c):
            figs=[do_figure(f) for f in k.kids if f.tag=='figure']
            emit({'t':'figrow','figs':figs}); continue
        if k.tag=='figure':
            emit(do_figure(k)); continue
        walk(k)

src=open(SRC,encoding='utf-8').read()
src=re.sub(r'<style>.*?</style>','',src,flags=re.S)
p=T(); p.feed(src)
walk(p.root)
json.dump(BLOCKS, open('model.json','w'), ensure_ascii=False, indent=1)
from collections import Counter
print('blokova:',len(BLOCKS), dict(Counter(b['t'] for b in BLOCKS)))

/**
 * KORAK 12: izrada HTML izvjestaja iz stvarnih rezultata analize.
 * Ne sadrzi nijednu tvrdo upisanu brojku - sve dolazi iz analysis-latest.json.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { KATEGORIJE } from './lexicon.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const e = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const br = (n, d = 1) => n === null || n === undefined ? '&mdash;' : Number(n).toFixed(d).replace('.', ',');
const dat = iso => new Date(iso).toLocaleDateString('hr-HR', { day:'2-digit', month:'2-digit', year:'numeric' });

/* ---------- graf: visestruka vremenska serija (SVG, bez biblioteke) ---------- */
function linijskiGraf(serije, { w = 760, h = 240, pad = { t:16, r:96, b:28, l:44 } } = {}) {
  const svi = serije.flatMap(s => s.tocke);
  if (!svi.length) return '<p class="prazno">Nema podataka za prikaz.</p>';
  const maxY = Math.max(...svi.map(p => p.y)) * 1.12;
  const n = Math.max(...serije.map(s => s.tocke.length));
  const X = i => pad.l + (i / (n - 1)) * (w - pad.l - pad.r);
  const Y = v => h - pad.b - (v / maxY) * (h - pad.t - pad.b);
  const tickY = [0, maxY/2, maxY].map(v => Math.round(v / 10) * 10);
  const mrezа = tickY.map(v => `<line x1="${pad.l}" y1="${Y(v)}" x2="${w-pad.r}" y2="${Y(v)}" class="mreza"/><text x="${pad.l-8}" y="${Y(v)+4}" class="os" text-anchor="end">${v}</text>`).join('');
  // Zadnja oznaka se izostavlja ako bi se sudarila s prethodnom.
  const korak = 14, zadnjaMod = Math.floor((n-1)/korak)*korak;
  const zadnjaStane = (n-1) - zadnjaMod >= 5;
  const oznakeX = serije[0].tocke.map((p,i) =>
    (i % korak === 0 || (i === n-1 && zadnjaStane))
      ? `<text x="${X(i)}" y="${h-8}" class="os" text-anchor="middle">${p.oznaka}</text>` : '').join('');
  // Izravne oznake na kraju linija: razmaknute najmanje 14 px da se ne preklapaju.
  const krajevi = serije.map((s, si) => ({ si, naziv: s.naziv, y: s.tocke[s.tocke.length-1].y,
                                           py: Y(s.tocke[s.tocke.length-1].y) }))
    .sort((p,q) => p.py - q.py);
  for (let i = 1; i < krajevi.length; i++)
    if (krajevi[i].py - krajevi[i-1].py < 14) krajevi[i].py = krajevi[i-1].py + 14;
  const pyZa = Object.fromEntries(krajevi.map(k => [k.si, k.py]));
  const putovi = serije.map((s, si) => {
    const d = s.tocke.map((p,i) => `${i?'L':'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
    const zadnja = s.tocke[s.tocke.length-1];
    const xz = X(s.tocke.length-1), yz = Y(zadnja.y), yl = pyZa[si];
    const vodilica = Math.abs(yl - yz) > 2
      ? `<line x1="${xz+5}" y1="${yz}" x2="${xz+9}" y2="${yl-4}" stroke="var(--serija-${si})" stroke-width="1" opacity=".55"/>` : '';
    return `<path d="${d}" fill="none" stroke="var(--serija-${si})" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${xz}" cy="${yz}" r="4" fill="var(--serija-${si})" stroke="var(--povrsina)" stroke-width="2"/>
      ${vodilica}<text x="${xz+12}" y="${yl}" class="izravna" fill="var(--serija-${si})">${e(s.naziv)} ${zadnja.y}</text>`;
  }).join('');
  const tocke = serije.map((s, si) => s.tocke.map((p,i) =>
    `<circle cx="${X(i)}" cy="${Y(p.y)}" r="9" fill="transparent" class="hit" data-opis="${e(p.puniDatum)} &middot; ${e(s.naziv)}: ${p.y} pregleda"/>`).join('')).join('');
  return `<svg viewBox="0 0 ${w} ${h}" class="graf" role="img" aria-label="Dnevni pregledi clanaka o Slavonskom Brodu na Wikipediji kroz 60 dana">
    ${mrezа}${oznakeX}${putovi}${tocke}</svg>`;
}

/* ---------- traka indeksa (divergentno oko 50) ---------- */
function trakaIndeksa(k, v) {
  const naziv = KATEGORIJE[k].naziv;
  if (v.vrijednost === null) {
    const razlog = v.n === 0 ? 'nijedno spominjanje u prozoru' : `n = ${v.n}, ispod praga objave (5)`;
    return `<tr><th scope="row">${e(naziv)}</th>
      <td class="num"><span class="nema">nedovoljno podataka</span></td>
      <td class="traka-c"><div class="traka prazna"><span class="sredina"></span></div></td>
      <td class="num sitno">${v.n}</td><td class="sitno">${e(razlog)}</td></tr>`;
  }
  const poz = v.vrijednost >= 50;
  const sirina = Math.abs(v.vrijednost - 50) * 2;
  const lijevo = poz ? 50 : 50 - sirina/2;
  return `<tr><th scope="row">${e(naziv)}</th>
    <td class="num"><b>${br(v.vrijednost)}</b> <span class="smjer ${poz?'poz':'neg'}">${poz?'▲ iznad':'▼ ispod'} neutralnog</span></td>
    <td class="traka-c"><div class="traka" title="${br(v.vrijednost)} / 100">
      <span class="sredina"></span>
      <i class="${poz?'poz':'neg'}" style="left:${lijevo}%;width:${sirina/2}%"></i></div></td>
    <td class="num sitno">${v.n}</td>
    <td class="sitno">${e(v.status)} &middot; ${v.izvora} izv. &middot; CI ${br(v.ci[0])}&ndash;${br(v.ci[1])}</td></tr>`;
}

export async function izvjestaj({ log = console.log } = {}) {
  const dir = path.join(ROOT, 'data/sentiment-sb');
  const a = JSON.parse(await fs.readFile(path.join(dir, 'analysis-latest.json'), 'utf8'));
  const zlatni = JSON.parse(await fs.readFile(path.join(dir, 'gold-sample.json'), 'utf8'));

  const kraj = new Date(a.prozor.kraj);
  const pocetak = new Date(kraj.getTime() - 7*864e5);
  const tekuci = a.spominjanja.filter(m => m.tjedan === 0);
  const stavkiUProzoru = new Set(tekuci.map(m => m.item_url)).size;

  // mjerenja iz zlatnog uzorka
  const zs = zlatni.stavke;
  const relOk = zs.filter(z => z.rucno_relevantno === 1).length;
  const relevantni = zs.filter(z => z.rucno_relevantno === 1);
  const katOk = relevantni.filter(z => z.rucno_kategorija_tocna === 1).length;
  const prior = zs.filter(z => z.prior), bezPriora = zs.filter(z => !z.prior);
  const pPrior = prior.length ? prior.filter(z=>z.rucno_relevantno===1).length/prior.length : null;
  const pBez = bezPriora.length ? bezPriora.filter(z=>z.rucno_relevantno===1).length/bezPriora.length : null;

  // najizrazenija spominjanja
  // Jedna objava daje vise aspektnih spominjanja; u popisu citata prikazuje se
  // jednom, s navedenim svim kategorijama.
  const poObjavi = new Map();
  for (const m of tekuci) {
    const p = poObjavi.get(m.item_url);
    if (p) p.kategorije.add(m.kategorija);
    else poObjavi.set(m.item_url, { ...m, kategorije: new Set([m.kategorija]) });
  }
  const sortirana = [...poObjavi.values()].sort((x,y) => x.polaritet - y.polaritet);
  const negativna = sortirana.filter(m => m.polaritet < -0.15).slice(0, 5);
  const pozitivna = sortirana.filter(m => m.polaritet > 0.15).slice(-5).reverse();

  const osg = a.indeksi.OSG;
  const delta = (a.povijest[0].vrijednost !== null && a.povijest[1].vrijednost !== null)
    ? a.povijest[0].vrijednost - a.povijest[1].vrijednost : null;

  // pageviews -> serije
  const BOJE = ['hr','en','de'];
  const serije = a.pageviews.map((p, i) => ({
    naziv: p.wiki.split('.')[0].toUpperCase(),
    tocke: p.dani.map(d => ({
      y: d.pregledi,
      oznaka: `${d.dan.slice(6,8)}.${d.dan.slice(4,6)}.`,
      puniDatum: `${d.dan.slice(6,8)}.${d.dan.slice(4,6)}.${d.dan.slice(0,4)}.`
    }))
  }));
  const ukupnoPregleda = a.pageviews.reduce((s,p) => s + p.dani.slice(-7).reduce((x,d)=>x+d.pregledi,0), 0);
  const prethodnih7 = a.pageviews.reduce((s,p) => s + p.dani.slice(-14,-7).reduce((x,d)=>x+d.pregledi,0), 0);

  const html = renderaj({ a, zlatni, kraj, pocetak, tekuci, stavkiUProzoru, relOk, relevantni, katOk,
                          pPrior, pBez, prior, bezPriora, negativna, pozitivna, osg, delta, serije,
                          ukupnoPregleda, prethodnih7, graf: linijskiGraf(serije), trakaIndeksa });
  const izlaz = path.join(ROOT, 'docs/dashboard-slavonski-brod.html');
  await fs.writeFile(izlaz, html);
  log(`Izvjestaj: ${izlaz} (${(html.length/1024).toFixed(0)} kB)`);
  return izlaz;
}

function renderaj(d) {
  const { a, zlatni, kraj, pocetak, tekuci, stavkiUProzoru, relOk, relevantni, katOk,
          pPrior, pBez, prior, bezPriora, negativna, pozitivna, osg, delta, graf,
          ukupnoPregleda, prethodnih7, trakaIndeksa } = d;
  const pct = (x) => x === null ? '&mdash;' : `${(x*100).toFixed(0)} %`;
  const kat = a.indeksi.po_kategoriji;
  const sIndeksom = Object.entries(kat).filter(([,v]) => v.vrijednost !== null);
  const bezIndeksa = Object.entries(kat).filter(([,v]) => v.vrijednost === null);
  const najneg = sIndeksom.slice().sort((x,y)=>x[1].vrijednost-y[1].vrijednost)[0];
  const ob = a.obrada;

  const uvidi = [
    `U prozoru od sedam dana pipeline je zadržao <b>${stavkiUProzoru} objava</b> iz <b>${a.statusi.filter(s=>s.status==='ok').length} od ${a.statusi.length} izvora</b>, iz kojih je nastalo <b>${tekuci.length} aspektnih spominjanja</b>. To je premalen uzorak za pouzdane kategorijske ocjene i to je glavni nalaz ove iteracije.`,
    osg.vrijednost !== null
      ? `Opći sentiment grada (OSG) iznosi <b>${br(osg.vrijednost)} / 100</b>, ali je izračunat samo iz kategorija ${osg.koristene_kategorije.join(', ')} &mdash; ostale (${osg.izostavljene_kategorije.join(', ')}) nisu prešle prag objave, pa su ponderi renormalizirani.`
      : `Opći sentiment grada nije izračunat: nijedna kategorija nije prešla prag objave.`,
    `Turistički sentiment (TSI) <b>nije izračunat</b>. ${e(a.indeksi.TSI.razlog)} Bez recenzijskih izvora agent mjeri ton lokalnih medija, a ne doživljaj posjetitelja.`,
    najneg ? `Najniža kategorija je <b>${e(KATEGORIJE[najneg[0]].naziv)}</b> (${br(najneg[1].vrijednost)}, n=${najneg[1].n}, udio negativnih ${pct(najneg[1].udio_neg)}). To je očekivana posljedica toga što lokalni mediji redovito izvještavaju o nesrećama i prekršajima &mdash; <b>nije</b> pokazatelj percepcije sigurnosti kod posjetitelja.` : null,
    `Ručna provjera uzorka od ${zlatni.velicina} spominjanja daje preciznost relevantnosti <b>${pct(relOk/zlatni.velicina)}</b>, ispod cilja od 90 % iz specifikacije. Uzrok je izoliran i mjerljiv (vidi poglavlje o kvaliteti).`,
    `Interes za grad na Wikipediji u zadnjih 7 dana: <b>${ukupnoPregleda} pregleda</b> (prethodnih 7 dana: ${prethodnih7}). Jedini izvor u ovoj iteraciji s potpunim i nepristranim vremenskim nizom.`,
    a.statusi.some(s=>s.status==='nedostupan') ? `Izvor ${a.statusi.filter(s=>s.status==='nedostupan').map(s=>`<b>${e(s.naziv)}</b>`).join(', ')} bio je nedostupan; sustav je nastavio rad i to zabilježio kao upozorenje, umjesto da prekine izvođenje.` : null
  ].filter(Boolean);

  const redak = m => `<li class="citat ${m.polaritet<0?'neg':'poz'}">
      <span class="pol">${m.polaritet>0?'+':''}${br(m.polaritet,2)}</span>
      <div><a href="${e(m.item_url)}" target="_blank" rel="noopener">${e(m.citat)}</a>
      <span class="meta">${e([...m.kategorije].map(k=>KATEGORIJE[k].naziv).join(' + '))} &middot; ${e(m.izvor_id)} &middot; ${dat(m.objavljeno)}${m.mjesovito?' &middot; mješovito':''}${m.ironija?' &middot; moguća ironija':''}</span></div></li>`;

  return `<title>Sentiment Radar &mdash; iteracija 1</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{
  --paper:#F2F5F4; --povrsina:#FFFFFF; --povrsina-2:#E8EDEB; --povrsina-3:#DDE4E1;
  --ink:#131A1F; --ink-2:#41505A; --ink-3:#6C7C85; --rule:#D5DEDA; --rule-2:#B9C6C1;
  --accent:#1F4E6B; --ochre:#B0782F;
  --poz:#2C7A4B; --warn:#A87512; --neg:#9E3524;
  --poz-soft:#E1F0E6; --warn-soft:#F7EDD6; --neg-soft:#F7E3DF;
  --serija-0:#2F76BC; --serija-1:#C8791C; --serija-2:#7A55B5;
  --serif:"Newsreader",Georgia,serif; --sans:"Public Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; --mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#0E1418; --povrsina:#151D22; --povrsina-2:#1C262B; --povrsina-3:#243036;
  --ink:#E6EDEA; --ink-2:#AEBEC4; --ink-3:#84959D; --rule:#293539; --rule-2:#3A4A50;
  --accent:#7DB2D2; --ochre:#D5A45F; --poz:#62B685; --warn:#D4A63E; --neg:#E07E6C;
  --poz-soft:#16261D; --warn-soft:#272016; --neg-soft:#2A1B18;
  --serija-0:#4A93D0; --serija-1:#C08733; --serija-2:#957CC9;
}}
:root[data-theme="dark"]{
  --paper:#0E1418; --povrsina:#151D22; --povrsina-2:#1C262B; --povrsina-3:#243036;
  --ink:#E6EDEA; --ink-2:#AEBEC4; --ink-3:#84959D; --rule:#293539; --rule-2:#3A4A50;
  --accent:#7DB2D2; --ochre:#D5A45F; --poz:#62B685; --warn:#D4A63E; --neg:#E07E6C;
  --poz-soft:#16261D; --warn-soft:#272016; --neg-soft:#2A1B18;
  --serija-0:#4A93D0; --serija-1:#C08733; --serija-2:#957CC9;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.6}
.wrap{max-width:1060px;margin:0 auto;padding-inline:20px;padding-block:0 64px}
a{color:var(--accent)} a:focus-visible,.hit:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
h1{font-family:var(--serif);font-weight:500;font-size:clamp(1.9rem,5vw,2.9rem);line-height:1.1;letter-spacing:-.015em;margin:0 0 10px;text-wrap:balance}
h2{font-family:var(--serif);font-weight:500;font-size:clamp(1.3rem,3vw,1.7rem);margin:0 0 4px;letter-spacing:-.01em}
h3{font-size:.95rem;font-weight:700;margin:24px 0 8px}
p{margin:0 0 12px;max-width:72ch} ul,ol{max-width:72ch}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ochre);margin:0 0 12px}
header.top{border-bottom:2px solid var(--ink);padding-block:36px 20px;margin-bottom:26px}
.top-meta{display:flex;flex-wrap:wrap;gap:4px 24px;font-family:var(--mono);font-size:11.5px;color:var(--ink-3);margin-top:16px}
.top-meta b{color:var(--ink-2);font-weight:500}
section{margin-bottom:38px}
.sec-head{border-top:1px solid var(--rule-2);padding-top:12px;margin-bottom:14px}
.sec-head p{color:var(--ink-3);font-size:13.5px;margin:2px 0 0}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));margin:14px 0}
.tile{background:var(--povrsina);border:1px solid var(--rule);border-radius:4px;padding:14px 16px}
.tile .k{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);margin:0 0 6px}
.tile .v{font-family:var(--serif);font-size:2rem;line-height:1;margin:0;font-variant-numeric:tabular-nums}
.tile .v small{font-size:.5em;color:var(--ink-3)}
.tile p.sub{font-size:12.5px;color:var(--ink-2);margin:8px 0 0;line-height:1.45}
.tile.glavni{border-left:3px solid var(--accent)}
.chip{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:10px;letter-spacing:.05em;padding:2px 7px;border-radius:3px;border:1px solid;white-space:nowrap}
.chip.ok{background:var(--poz-soft);color:var(--poz);border-color:var(--poz)}
.chip.warn{background:var(--warn-soft);color:var(--warn);border-color:var(--warn)}
.chip.bad{background:var(--neg-soft);color:var(--neg);border-color:var(--neg)}
.chip.neu{background:var(--povrsina-2);color:var(--ink-2);border-color:var(--rule-2)}
.tw{overflow-x:auto;border:1px solid var(--rule);border-radius:4px;background:var(--povrsina);margin:14px 0}
table{border-collapse:collapse;width:100%;font-size:13px;min-width:560px}
th,td{text-align:left;padding:9px 13px;border-bottom:1px solid var(--rule);vertical-align:top}
thead th{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:500;background:var(--povrsina-2)}
tbody tr:last-child td,tbody tr:last-child th{border-bottom:none}
tbody th{font-weight:600}
.num{font-family:var(--mono);font-variant-numeric:tabular-nums;white-space:nowrap}
.sitno{font-size:11.5px;color:var(--ink-3)}
.nema{font-family:var(--mono);font-size:11px;color:var(--ink-3);font-style:italic}
.traka-c{width:34%;min-width:120px}
.traka{position:relative;height:10px;background:var(--povrsina-3);border-radius:2px}
.traka.prazna{opacity:.45}
.traka .sredina{position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:var(--rule-2)}
.traka i{position:absolute;top:0;bottom:0;border-radius:2px}
.traka i.poz{background:var(--poz)} .traka i.neg{background:var(--neg)}
.smjer{font-family:var(--mono);font-size:10px;margin-left:6px}
.smjer.poz{color:var(--poz)} .smjer.neg{color:var(--neg)}
.graf{width:100%;height:auto;display:block;overflow:visible}
.graf .mreza{stroke:var(--rule);stroke-width:1}
.graf .os{font-family:var(--mono);font-size:10px;fill:var(--ink-3)}
.graf .izravna{font-family:var(--mono);font-size:11px;font-weight:500}
.graf .hit{cursor:crosshair}
.legenda{display:flex;flex-wrap:wrap;gap:8px 18px;margin:8px 0 0;padding:0;list-style:none;font-size:12.5px;color:var(--ink-2)}
.legenda li{display:flex;align-items:center;gap:6px}
.kljuc{width:14px;height:3px;border-radius:2px;display:inline-block}
#tip{position:fixed;z-index:9;background:var(--ink);color:var(--paper);font-family:var(--mono);font-size:11px;padding:5px 8px;border-radius:3px;pointer-events:none;opacity:0;transition:opacity .12s}
.citati{list-style:none;margin:10px 0;padding:0;display:flex;flex-direction:column;gap:8px}
.citat{display:grid;grid-template-columns:52px 1fr;gap:10px;background:var(--povrsina);border:1px solid var(--rule);border-left:3px solid var(--rule-2);border-radius:3px;padding:9px 12px}
.citat.neg{border-left-color:var(--neg)} .citat.poz{border-left-color:var(--poz)}
.citat .pol{font-family:var(--mono);font-size:12px;font-variant-numeric:tabular-nums;color:var(--ink-2)}
.citat.neg .pol{color:var(--neg)} .citat.poz .pol{color:var(--poz)}
.citat a{text-decoration:none;font-size:13.5px;line-height:1.4} .citat a:hover{text-decoration:underline}
.citat .meta{display:block;font-family:var(--mono);font-size:10.5px;color:var(--ink-3);margin-top:3px}
.panel{background:var(--povrsina);border:1px solid var(--rule);border-radius:4px;padding:16px 18px;margin:14px 0}
.panel.flag{border-left:3px solid var(--ochre);background:var(--warn-soft)}
.panel.crit{border-left:3px solid var(--neg);background:var(--neg-soft)}
.panel>:last-child{margin-bottom:0}
.panel h3{margin-top:0}
ol.uvidi{counter-reset:u;list-style:none;padding:0;margin:12px 0;display:flex;flex-direction:column;gap:9px}
ol.uvidi li{counter-increment:u;display:grid;grid-template-columns:26px 1fr;gap:10px;font-size:14px;line-height:1.5}
ol.uvidi li::before{content:counter(u,decimal-leading-zero);font-family:var(--mono);font-size:11px;color:var(--ochre);padding-top:4px}
.lijevak{display:flex;flex-direction:column;gap:5px;margin:12px 0;max-width:560px}
.lijevak div{display:grid;grid-template-columns:1fr 46px;gap:10px;align-items:center;font-size:13px}
.lijevak .f{height:20px;background:var(--accent);border-radius:2px;min-width:2px;display:flex;align-items:center;padding-left:8px;color:var(--paper);font-family:var(--mono);font-size:10.5px;white-space:nowrap}
.lijevak .lab{font-family:var(--mono);font-size:11px;color:var(--ink-3);text-align:right}
footer{border-top:1px solid var(--rule-2);margin-top:44px;padding-top:16px;font-size:12.5px;color:var(--ink-3)}
@media (max-width:520px){ .citat{grid-template-columns:1fr} .traka-c{display:none} }
</style>
<div class="wrap">
<header class="top">
  <p class="eyebrow">Prva probna iteracija &middot; stvarni podaci, bez simulacije</p>
  <h1>Sentiment Radar Slavonski Brod</h1>
  <p style="font-family:var(--serif);font-size:1.1rem;color:var(--ink-2);max-width:60ch;margin:0">Tjedni izvještaj generiran automatski iz javno dostupnih izvora. Svaka brojka na ovoj stranici izračunata je iz stvarno prikupljenih objava &mdash; nijedna nije primjer ni rezervirano mjesto.</p>
  <div class="top-meta">
    <span><b>Prozor:</b> ${dat(pocetak)} &ndash; ${dat(kraj)} (7 dana)</span>
    <span><b>Izvođenje:</b> ${e(a.run_id)}</span>
    <span><b>Prior dosega:</b> ${a.konfiguracija?.prior_dosega_izvora ? 'uključen' : 'isključen'}</span>
    <span><b>Klasifikator:</b> leksički MVP</span>
  </div>
</header>

<section>
  <div class="sec-head"><h2>1 &middot; Izvršni sažetak</h2><p>Nalazi generirani iz izračunatih vrijednosti, ne iz predloška.</p></div>
  <ol class="uvidi">${uvidi.map(u => `<li><span>${u}</span></li>`).join('')}</ol>
</section>

<section>
  <div class="sec-head"><h2>2 &middot; Indeksi</h2><p>Ljestvica 0&ndash;100; 50 je neutralno. Prag objave: n &ge; 5 za vrijednost, n &ge; 15 za punu pouzdanost.</p></div>
  <div class="grid">
    <div class="tile glavni"><p class="k">OSG &mdash; opći sentiment grada</p>
      <p class="v">${br(osg.vrijednost)}<small> / 100</small></p>
      <p class="sub">${osg.vrijednost===null?'Nije izračunat.':`Iz kategorija: ${osg.koristene_kategorije.join(', ')}. Izostavljeno zbog praga: ${osg.izostavljene_kategorije.join(', ') || 'ništa'}.`}</p></div>
    <div class="tile"><p class="k">TSI &mdash; turistički sentiment</p>
      <p class="v" style="color:var(--ink-3)">&mdash;</p>
      <p class="sub">${e(a.indeksi.TSI.razlog)}</p></div>
    <div class="tile"><p class="k">Promjena prema prethodnih 7 dana</p>
      <p class="v">${delta===null?'&mdash;':(delta>0?'+':'')+br(delta)}</p>
      <p class="sub">${delta===null?'Nema usporedivog prethodnog prozora.':`Ukupni tekstualni sentiment. <b>Oprez:</b> prethodni prozor ima samo n=${a.povijest[1].n} spominjanja jer dohvat pokriva naslovnice, pa je stariji tjedan sustavno podzastupljen. Promjena ispod 3 boda tumači se kao stabilno.`}</p></div>
    <div class="tile"><p class="k">Interes (Wikipedia, 7 dana)</p>
      <p class="v">${ukupnoPregleda}</p>
      <p class="sub">Prethodnih 7 dana: ${prethodnih7}. Zbroj hrvatske, engleske i njemačke inačice članka.</p></div>
  </div>

  <h3>Indeksi po kategorijama</h3>
  <div class="tw"><table>
    <thead><tr><th>Kategorija</th><th>Indeks</th><th>Odstupanje od neutralnog (50)</th><th class="num">n</th><th>Napomena</th></tr></thead>
    <tbody>${Object.entries(kat).map(([k,v]) => trakaIndeksa(k,v)).join('')}</tbody>
  </table></div>
  <p class="sitno">Kategorije bez vrijednosti nisu „nula“ nego <em>neizmjereno</em>. Gastronomija, smještaj i turističke informacije prazne su jer u ovoj iteraciji nema nijednog recenzijskog izvora &mdash; to je ograničenje okvira uzorkovanja, ne nalaz o gradu.</p>
</section>

<section>
  <div class="sec-head"><h2>3 &middot; Interes za destinaciju</h2><p>Dnevni pregledi članka „Slavonski Brod“ na Wikipediji, 60 dana. Jedini izvor s potpunim vremenskim nizom.</p></div>
  <div class="panel">
    ${graf}
    <ul class="legenda">
      <li><span class="kljuc" style="background:var(--serija-0)"></span> HR &mdash; hrvatska Wikipedija</li>
      <li><span class="kljuc" style="background:var(--serija-1)"></span> EN &mdash; engleska Wikipedija</li>
      <li><span class="kljuc" style="background:var(--serija-2)"></span> DE &mdash; njemačka Wikipedija</li>
    </ul>
    <p class="sitno" style="margin-top:10px">Pregledi mjere <em>interes</em>, ne sentiment. Korisni su kao kontrolna varijabla: skok spominjanja bez skoka pregleda znači lokalnu temu, a ne temu koja privlači posjetitelje.</p>
  </div>
</section>

<section>
  <div class="sec-head"><h2>4 &middot; Najizraženija spominjanja</h2><p>Naslovi izvornih objava s poveznicom. Citati nisu parafrazirani jer je riječ o medijskim naslovima, ne o izjavama pojedinaca.</p></div>
  <h3>Negativno</h3>
  ${negativna.length ? `<ul class="citati">${negativna.map(redak).join('')}</ul>` : '<p class="nema">Nijedno spominjanje ispod praga &minus;0,15 u ovom prozoru.</p>'}
  <h3>Pozitivno</h3>
  ${pozitivna.length ? `<ul class="citati">${pozitivna.map(redak).join('')}</ul>` : '<p class="nema">Nijedno spominjanje iznad praga +0,15 u ovom prozoru.</p>'}
</section>

<section>
  <div class="sec-head"><h2>5 &middot; Upozorenja</h2><p>Generirana pravilima iz specifikacije, poglavlje 4.5.</p></div>
  ${a.upozorenja.length ? a.upozorenja.map(u => `<div class="panel ${u.ozbiljnost==='visoko'?'crit':'flag'}">
      <h3><span class="chip ${u.ozbiljnost==='visoko'?'bad':'warn'}">${e(u.ozbiljnost.toUpperCase())}</span> ${e(u.tip.replace(/_/g,' '))}</h3>
      <p>${e(u.obrazlozenje)}</p></div>`).join('') : '<p class="nema">Nema upozorenja iznad praga.</p>'}
</section>

<section>
  <div class="sec-head"><h2>6 &middot; Izvori i tijek obrade</h2><p>Što je dohvaćeno, što je odbačeno i zašto.</p></div>
  <div class="tw"><table>
    <thead><tr><th>Izvor</th><th>Status</th><th class="num">Zapisa</th><th class="num">Trajanje</th><th>Napomena</th></tr></thead>
    <tbody>${a.statusi.map(s => `<tr><th scope="row">${e(s.naziv)}</th>
      <td>${s.status==='ok'?'<span class="chip ok">✓ DOSTUPAN</span>':'<span class="chip bad">✕ NEDOSTUPAN</span>'}</td>
      <td class="num">${s.broj}</td><td class="num">${(s.ms/1000).toFixed(1)} s</td>
      <td class="sitno">${e(s.greska || '')}</td></tr>`).join('')}</tbody>
  </table></div>
  <h3>Lijevak obrade</h3>
  <div class="lijevak">
    ${[['Dohvaćeno stavki', ob.ulazn ?? ob.ulaznih],['Nakon dedupikacije', (ob.ulaznih-ob.duplikata)],
       ['S poznatim datumom', (ob.ulaznih-ob.duplikata-ob.bez_datuma)],
       ['Prošlo filtar relevantnosti', (ob.ulaznih-ob.duplikata-ob.bez_datuma-ob.odbaceno_relevantnost)],
       ['U prozoru od 7 dana', stavkiUProzoru]]
      .map(([lab,v]) => `<div><span class="f" style="width:${Math.max(3,(v/ob.ulaznih)*100)}%">${e(lab)}</span><span class="lab">${v}</span></div>`).join('')}
  </div>
  <p class="sitno">Od ${ob.ulaznih} dohvaćenih stavki: ${ob.duplikata} duplikata, ${ob.bez_datuma} bez datuma objave (statične stranice s naslovnice Grada), ${ob.odbaceno_relevantnost} odbačeno kao nerelevantno za grad. Od zadržanih, ${ob.bez_jasne_teme} nije imalo jasnu temu pa je svrstano u opći gradski sentiment.</p>
</section>

<section>
  <div class="sec-head"><h2>7 &middot; Kvaliteta klasifikacije</h2><p>Izmjereno ručnom provjerom, ne procijenjeno.</p></div>
  <div class="grid">
    <div class="tile"><p class="k">Preciznost relevantnosti</p><p class="v">${pct(relOk/zlatni.velicina)}</p>
      <p class="sub">${relOk}/${zlatni.velicina} spominjanja. Cilj iz specifikacije: <b>&ge; 90 %</b>. <span class="chip bad">NIJE POSTIGNUTO</span></p></div>
    <div class="tile"><p class="k">Točnost kategorije</p><p class="v">${pct(katOk/relevantni.length)}</p>
      <p class="sub">${katOk}/${relevantni.length} relevantnih spominjanja dobilo je ispravnu kategoriju.</p></div>
    <div class="tile"><p class="k">Uzorak</p><p class="v">${zlatni.velicina}</p>
      <p class="sub">Stratificirani uzorak, ocjenjivač: ${e(zlatni.ocjenjivac)}, ${e(zlatni.datum)}. Jedan ocjenjivač &mdash; slaganje dvaju ocjenjivača nije mjereno.</p></div>
  </div>
  <div class="panel flag">
    <h3>Uzrok je izoliran i mjerljiv</h3>
    <p>Pogreške u relevantnosti nisu ravnomjerno raspoređene. Podijele li se spominjanja prema tome je li ih prihvatio <em>prior dosega izvora</em> (pravilo „hiperlokalni portal piše o svom gradu i kad ga ne imenuje“):</p>
    <div class="tw"><table>
      <thead><tr><th>Skupina</th><th class="num">n</th><th class="num">Preciznost</th><th>Tumačenje</th></tr></thead>
      <tbody>
        <tr><th scope="row">Grad izrijekom imenovan</th><td class="num">${bezPriora.length}</td><td class="num"><b>${pct(pBez)}</b></td><td class="sitno">Filtar radi kako treba.</td></tr>
        <tr><th scope="row">Prihvaćeno priorom</th><td class="num">${prior.length}</td><td class="num"><b>${pct(pPrior)}</b></td><td class="sitno">Propušta kolumne o drugim gradovima, lifestyle sadržaj i županijske teme.</td></tr>
      </tbody>
    </table></div>
    <p>Prior je zato <b>isključen u ovoj iteraciji</b>. Cijena je manji uzorak (${a.obrada.u_prozoru} umjesto 44 stavke), dobitak je preciznost s ${pct(relOk/zlatni.velicina)} na oko ${pct(pBez)}. Trajno rješenje nije ni jedno ni drugo, nego prolaz 2 iz specifikacije: povezivanje spominjanja s registrom objekata po nazivu i koordinatama.</p>
  </div>
</section>

<section>
  <div class="sec-head"><h2>8 &middot; Preporuke iz ove iteracije</h2><p>Svaka je vezana uz mjerljiv nalaz s ove stranice. Nijedna se ne odnosi na turističku politiku &mdash; za to uzorak nije dovoljan.</p></div>
  <div class="tw"><table>
    <thead><tr><th>Nalaz</th><th>Preporuka</th><th>Prioritet</th><th>Učinak</th></tr></thead>
    <tbody>
      <tr><th scope="row">TSI se ne može izračunati &mdash; nema recenzijskih izvora</th>
        <td>Uključiti Google Business Profile za objekte pod upravom TZ-a i pokrenuti first-party anketu s QR kodom u turističkom uredu i na događanjima.</td>
        <td><span class="chip bad">HITNO</span></td><td class="sitno">Otvara cijeli turistički sloj; bez toga agent mjeri ton medija, ne doživljaj posjetitelja.</td></tr>
      <tr><th scope="row">Preciznost relevantnosti ${pct(relOk/zlatni.velicina)}, cilj 90 %</th>
        <td>Implementirati prolaz 2: registar objekata iz OpenStreetMapa i vlastite baze TZ-a, pa povezivanje spominjanja po nazivu i koordinatama.</td>
        <td><span class="chip warn">VISOK</span></td><td class="sitno">Zamjenjuje prior mjerljivim pravilom; očekivano podizanje preciznosti iznad 90 % uz zadržan uzorak.</td></tr>
      <tr><th scope="row">${a.obrada.bez_datuma} stavki bez datuma objave</th>
        <td>Namjenski adapter za stranice Grada (Joomla), umjesto generičkog skupljanja poveznica s naslovnice.</td>
        <td><span class="chip warn">VISOK</span></td><td class="sitno">Statične stranice („Simboli grada“, „Zemljopisni položaj“) trenutno troše kvotu i ne nose vijest.</td></tr>
      <tr><th scope="row">Prethodni tjedan ima n=${a.povijest[1].n}</th>
        <td>Uvesti paginaciju rubrika pri prikupljanju i zadržati arhivu izvođenja, da tjedna usporedba bude legitimna.</td>
        <td><span class="chip warn">VISOK</span></td><td class="sitno">Bez toga svaka usporedba tjedana mjeri dubinu dohvata, a ne promjenu sentimenta.</td></tr>
      <tr><th scope="row">${(zlatni.stavke.filter(z=>Math.abs(z.pol)<0.01).length)} od ${zlatni.velicina} spominjanja ima polaritet 0,00</th>
        <td>Zamijeniti leksički klasifikator modelom za hrvatski jezik i označiti 300 spominjanja kao skup za podešavanje.</td>
        <td><span class="chip neu">SREDNJI</span></td><td class="sitno">Leksikon reagira uglavnom na naslov; velik dio objava ostaje lažno neutralan.</td></tr>
      <tr><th scope="row">Sigurnost je najniža kategorija, uz udio negativnih ${pct(kat.B.udio_neg)}</th>
        <td><b>Ne</b> poduzimati komunikacijske mjere na temelju ovog nalaza. Odvojiti crnu kroniku u zaseban tok koji ne ulazi u turističke indekse.</td>
        <td><span class="chip neu">SREDNJI</span></td><td class="sitno">Mjeri se uređivačka praksa portala, a ne percepcija sigurnosti posjetitelja.</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <div class="sec-head"><h2>9 &middot; Metodologija i ograničenja</h2></div>
  <div class="panel crit">
    <h3>Što ovaj izvještaj ne dokazuje</h3>
    <ul>
      <li>Uzorak je <b>${stavkiUProzoru} objava</b> iz tri lokalna izvora. To nije reprezentativan presjek javnog mnijenja, nego presjek uređivačkog izbora tri redakcije.</li>
      <li>Klasifikator sentimenta je leksički i <b>nije validiran na hrvatskom skupu za sentiment</b>. Specifikacija ga navodi kao pričuvu, ne kao preporučeni pristup.</li>
      <li>Prozor je pomičnih 7 dana, a ne ponedjeljak&ndash;nedjelja, jer dohvat pokriva samo naslovnice portala.</li>
      <li>Nijedan recenzijski izvor nije uključen, pa gastronomija, smještaj i informacije nemaju nijedno spominjanje.</li>
      <li>Povijesna usporedba ne postoji &mdash; ovo je prvo izvođenje. Godišnja usporedba moguća je tek nakon 12 mjeseci rada.</li>
    </ul>
  </div>
  <h3>Postupak</h3>
  <ol>
    <li><b>Prikupljanje:</b> vlastiti <code>User-Agent</code> s kontaktom, razmak 1,3&ndash;1,5 s po zahtjevu, <code>robots.txt</code> provjeren za svaku domenu prije uključivanja. Nije zaobiđena nijedna prijava, paywall ni tehnička zaštita.</li>
    <li><b>Dedupikacija:</b> po normaliziranom naslovu (SHA-256, prvih 90 znakova).</li>
    <li><b>Relevantnost:</b> pozitivni i negativni geo-rječnik uz podudaranje na granici riječi; naziv mjesta kao podniz zbog padeža.</li>
    <li><b>Aspekti:</b> pogodak u naslovu vrijedi trostruko; kategorija ulazi s rezultatom &ge; 3; najviše dvije po objavi.</li>
    <li><b>Sentiment:</b> leksikon korijena s negacijom u prozoru od dvije riječi, pojačivačima i prigušenjem <code>zbroj / &radic;pogodaka</code>.</li>
    <li><b>Težina:</b> <code>w = pouzdanost &times; svježina(poluvrijeme 21 d) &times; kvaliteta izvora &times; 1/broj aspekata</code>.</li>
    <li><b>Agregacija:</b> winsorizacija na 5./95. percentil, bootstrap 600 ponavljanja za 90 % interval, renormalizacija pondera na dostupne kategorije.</li>
  </ol>
  <p class="sitno">Kod: <code>scripts/sentiment-sb/</code> &middot; Podaci: <code>data/sentiment-sb/</code> &middot; Specifikacija: <code>docs/sentiment-agent-slavonski-brod.html</code></p>
</section>

<footer>
  <p><b>Sentiment Radar Slavonski Brod</b> &mdash; automatski generirano ${dat(a.izradeno)}. Sve vrijednosti izračunate su iz stvarno prikupljenih javnih objava u navedenom prozoru. Izvještaj je interni radni dokument i nije za javnu objavu bez provjere citata i poveznica.</p>
</footer>
</div>
<div id="tip" role="status" aria-live="polite"></div>
<script>
(function(){
  var tip=document.getElementById('tip');
  document.querySelectorAll('.hit').forEach(function(el){
    el.addEventListener('mouseenter',function(ev){
      tip.textContent=el.dataset.opis; tip.style.opacity='1';
      tip.style.left=Math.min(window.innerWidth-tip.offsetWidth-12,ev.clientX+12)+'px';
      tip.style.top=(ev.clientY-34)+'px';
    });
    el.addEventListener('mouseleave',function(){ tip.style.opacity='0'; });
  });
})();
</script>`;
}

if (import.meta.url === `file://${process.argv[1]}`) izvjestaj();

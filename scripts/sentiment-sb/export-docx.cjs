/**
 * Pretvara izvjestaje iz docs/*.html u Word (.docx).
 *
 * Ne renderira CSS - cita semanticku strukturu (naslovi, odlomci, popisi,
 * tablice) i gradi nativan Word dokument sa stilovima, tako da je datoteka
 * uredljiva i za ispis, a ne slika stranice.
 *
 * Pokretanje: node scripts/sentiment-sb/export-docx.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow,
        TableCell, WidthType, BorderStyle, ShadingType, ImageRun, ExternalHyperlink,
        TableOfContents, PageBreak, LevelFormat, PageOrientation } = require('docx');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '../..');
const SIRINA = 9638;                       // A4 minus 2 cm margine, u DXA
const BOJA = { ink:'131A1F', ink2:'41505A', ink3:'6C7C85', accent:'1F4E6B', ochre:'8A5D22',
               poz:'2C7A4B', neg:'9E3524', warn:'8A5D22', linija:'C8D2CE', pozadina:'F2F5F4',
               panel:'EEF2F0', ochreBg:'F7EFE0', negBg:'F7E7E3' };
const F = { serif:'Georgia', sans:'Calibri', mono:'Consolas' };

/* ---------- inline: pretvara djecu cvora u TextRun/hyperlink nizove ---------- */
function inline($, cvor, stil = {}) {
  const out = [];
  $(cvor).contents().each((_, n) => {
    if (n.type === 'text') {
      const t = n.data.replace(/\s+/g, ' ');
      if (t.trim() || t === ' ') out.push(new TextRun({ text: t, ...runStil(stil) }));
      return;
    }
    if (n.type !== 'tag') return;
    const tag = n.name.toLowerCase();
    const cls = ($(n).attr('class') || '');
    if (tag === 'br') { out.push(new TextRun({ break: 1 })); return; }
    if (tag === 'svg' || tag === 'script' || tag === 'style') return;
    if (tag === 'a') {
      const href = $(n).attr('href');
      const djeca = inline($, n, { ...stil, boja: BOJA.accent, podcrtano: true });
      if (href && /^https?:/.test(href)) out.push(new ExternalHyperlink({ children: djeca, link: href }));
      else out.push(...djeca);
      return;
    }
    if (tag === 'strong' || tag === 'b') { out.push(...inline($, n, { ...stil, bold: true })); return; }
    if (tag === 'em' || tag === 'i') { out.push(...inline($, n, { ...stil, italic: true })); return; }
    if (tag === 'code') { out.push(...inline($, n, { ...stil, mono: true })); return; }
    if (cls.includes('chip')) {
      const tekst = $(n).text().trim().replace(/^[✓✕!]\s*/, '');
      const boja = cls.includes('ok') ? BOJA.poz : cls.includes('bad') || cls.includes('no') ? BOJA.neg
                 : cls.includes('warn') || cls.includes('cond') ? BOJA.warn : BOJA.ink2;
      out.push(new TextRun({ text: `[${tekst}]`, bold: true, color: boja, font: F.mono, size: 16 }));
      return;
    }
    out.push(...inline($, n, stil));
  });
  return out;
}
const runStil = s => ({
  bold: !!s.bold, italics: !!s.italic,
  font: s.mono ? F.mono : (s.font || F.sans),
  size: s.size || (s.mono ? 18 : 20),
  color: s.boja || BOJA.ink,
  underline: s.podcrtano ? {} : undefined
});

const odlomak = (djeca, o = {}) => new Paragraph({ children: djeca, spacing: { after: 120, line: 276 }, ...o });
const tekstP = (t, o = {}) => odlomak([new TextRun({ text: t, ...runStil(o) })], o.paragraf || {});

/* ---------- tablice ---------- */
function tablica($, el) {
  const redovi = [];
  const glava = $(el).find('thead tr').first();
  const stupaca = Math.max(glava.children().length,
    ...$(el).find('tbody tr').map((_, r) => $(r).children().length).get());
  if (!stupaca) return null;
  // prvi stupac siri
  const sirine = stupaca <= 2 ? [Math.round(SIRINA*0.34), SIRINA - Math.round(SIRINA*0.34)]
    : [Math.round(SIRINA*0.22), ...Array(stupaca-1).fill(Math.round((SIRINA*0.78)/(stupaca-1)))];
  sirine[sirine.length-1] = SIRINA - sirine.slice(0,-1).reduce((a,b)=>a+b,0);

  const celija = (n, i, zaglavlje) => {
    const djeca = inline($, n, zaglavlje ? { bold: true, size: 17, boja: BOJA.ink2 } : {});
    return new TableCell({
      width: { size: sirine[i] || sirine[sirine.length-1], type: WidthType.DXA },
      shading: zaglavlje ? { type: ShadingType.CLEAR, fill: BOJA.pozadina, color: 'auto' } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({ children: djeca.length ? djeca : [new TextRun('')], spacing: { after: 0, line: 252 } })]
    });
  };
  if (glava.length) redovi.push(new TableRow({
    tableHeader: true,
    children: glava.children().map((i, n) => celija(n, i, true)).get()
  }));
  $(el).find('tbody tr').each((_, r) => {
    const c = $(r).children().map((i, n) => celija(n, i, $(n).is('th') )).get();
    while (c.length < stupaca) c.push(new TableCell({ width:{size:sirine[c.length],type:WidthType.DXA}, children:[new Paragraph('')] }));
    redovi.push(new TableRow({ children: c }));
  });
  const opis = $(el).find('caption').text().trim();
  const t = new Table({
    rows: redovi, columnWidths: sirine, width: { size: SIRINA, type: WidthType.DXA },
    borders: ['top','bottom','left','right','insideHorizontal','insideVertical'].reduce((a,k) =>
      (a[k] = { style: BorderStyle.SINGLE, size: 2, color: BOJA.linija }, a), {})
  });
  return opis ? [t, tekstP(opis, { size: 16, italic: true, boja: BOJA.ink3, paragraf: { spacing: { before: 80, after: 200 } } })]
              : [t, new Paragraph({ text: '', spacing: { after: 160 } })];
}

/* ---------- glavni obilazak ---------- */
function pretvori($, korijen, opt = {}) {
  const izlaz = [];
  const dodaj = x => Array.isArray(x) ? izlaz.push(...x) : izlaz.push(x);

  $(korijen).children().each((_, n) => {
    const tag = n.name.toLowerCase();
    const cls = $(n).attr('class') || '';
    if (['script','style','link','nav','svg'].includes(tag) || $(n).attr('id') === 'tip') return;

    if (cls.includes('sec-head')) {
      const h = $(n).find('h2').first();
      if (h.length) dodaj(new Paragraph({ children: inline($, h[0], { font: F.serif, size: 30, boja: BOJA.ink }),
        heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 100 },
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: BOJA.accent, space: 8 } } }));
      const p = $(n).find('p').first();
      if (p.length) dodaj(tekstP(p.text().trim(), { size: 18, italic: true, boja: BOJA.ink3 }));
      return;
    }
    if (tag === 'h1') { dodaj(new Paragraph({ children: inline($, n, { font: F.serif, size: 44 }),
      heading: HeadingLevel.TITLE, spacing: { after: 160 } })); return; }
    if (tag === 'h2') { dodaj(new Paragraph({ children: inline($, n, { font: F.serif, size: 30 }),
      heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 100 } })); return; }
    if (tag === 'h3') { dodaj(new Paragraph({ children: inline($, n, { font: F.sans, size: 22, bold: true }),
      heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } })); return; }
    if (tag === 'h4') { dodaj(new Paragraph({ children: inline($, n, { font: F.mono, size: 17, boja: BOJA.ochre, bold: true }),
      heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 60 } })); return; }
    if (cls.includes('eyebrow')) { dodaj(tekstP($(n).text().trim().toUpperCase(), { font: F.mono, size: 16, boja: BOJA.ochre })); return; }

    if (tag === 'p') {
      const sitno = cls.includes('sitno') || cls.includes('note');
      const vodeci = cls.includes('lead');
      dodaj(new Paragraph({ children: inline($, n, sitno ? { size: 17, boja: BOJA.ink3 } : vodeci ? { font: F.serif, size: 24, boja: BOJA.ink2 } : {}),
        spacing: { after: 140, line: 276 } }));
      return;
    }
    if (tag === 'ul' || tag === 'ol') {
      const citati = cls.includes('citati');
      $(n).children('li').each((i, li) => {
        if (citati) {
          const pol = $(li).find('.pol').text().trim();
          const a = $(li).find('a').first();
          const meta = $(li).find('.meta').text().trim();
          const negativan = ($(li).attr('class')||'').includes('neg');
          dodaj(new Paragraph({ spacing: { after: 60 }, indent: { left: 220 },
            children: [ new TextRun({ text: `${pol}   `, bold: true, font: F.mono, size: 18, color: negativan ? BOJA.neg : BOJA.poz }),
              ...(a.length ? [new ExternalHyperlink({ link: a.attr('href'), children: [new TextRun({ text: a.text().trim(), color: BOJA.accent, underline: {}, size: 20, font: F.sans })] })]
                           : [new TextRun({ text: $(li).text().trim(), size: 20, font: F.sans })]) ] }));
          if (meta) dodaj(tekstP(meta, { font: F.mono, size: 15, boja: BOJA.ink3, paragraf: { indent: { left: 620 }, spacing: { after: 140 } } }));
          return;
        }
        dodaj(new Paragraph({ children: inline($, li), numbering: { reference: tag === 'ol' ? 'brojevi' : 'tocke', level: 0 }, spacing: { after: 80, line: 276 } }));
      });
      return;
    }
    if (tag === 'dl') {
      const parovi = [];
      let dt = null;
      $(n).children().each((_, c) => {
        if (c.name === 'dt') dt = $(c).text().trim();
        else if (c.name === 'dd') { parovi.push([dt, c]); dt = null; }
      });
      const sirine = [Math.round(SIRINA*0.30), SIRINA - Math.round(SIRINA*0.30)];
      dodaj(new Table({ columnWidths: sirine, width: { size: SIRINA, type: WidthType.DXA },
        borders: ['top','bottom','left','right','insideVertical'].reduce((a,k)=>(a[k]={style:BorderStyle.NONE,size:0,color:'FFFFFF'},a),
          { insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: BOJA.linija } }),
        rows: parovi.map(([k, v]) => new TableRow({ children: [
          new TableCell({ width:{size:sirine[0],type:WidthType.DXA}, margins:{top:80,bottom:80,right:120},
            children:[tekstP(k || '', { bold: true, size: 18, boja: BOJA.ink2 })] }),
          new TableCell({ width:{size:sirine[1],type:WidthType.DXA}, margins:{top:80,bottom:80},
            children:[new Paragraph({ children: inline($, v), spacing:{after:0,line:264} })] }) ] })) }));
      dodaj(new Paragraph({ text:'', spacing:{after:160} }));
      return;
    }
    if (tag === 'pre') {
      const linije = $(n).text().replace(/ /g,' ').split('\n');
      while (linije.length && !linije[0].trim()) linije.shift();
      while (linije.length && !linije[linije.length-1].trim()) linije.pop();
      linije.forEach(l => dodaj(new Paragraph({
        children: [new TextRun({ text: l || ' ', font: F.mono, size: 17, color: BOJA.ink })],
        spacing: { after: 0, line: 240 }, indent: { left: 220 },
        shading: { type: ShadingType.CLEAR, fill: BOJA.panel, color: 'auto' } })));
      dodaj(new Paragraph({ text:'', spacing:{after:160} }));
      return;
    }
    const kljucSlike = $(n).attr('data-slika');
    if (kljucSlike && opt.slike && opt.slike[kljucSlike]) {
      const im = opt.slike[kljucSlike];
      dodaj(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 },
        children: [new ImageRun({ type: 'png', data: fs.readFileSync(im.put),
          transformation: { width: im.sirina, height: im.visina } })] }));
      if (im.opis) dodaj(tekstP(im.opis, { size: 16, italic: true, boja: BOJA.ink3, paragraf: { alignment: AlignmentType.CENTER, spacing: { after: 200 } } }));
      return;
    }
    if (cls.includes('grid')) { const pl = plocice($, n); if (pl) dodaj(pl); else dodaj(pretvori($, n, opt)); return; }
    if (tag === 'table') { const t = tablica($, n); if (t) dodaj(t); return; }
    if (cls.includes('tw')) { const el = $(n).find('table')[0]; if (el) { const t = tablica($, el); if (t) dodaj(t); } return; }

    if (cls.includes('panel') || cls.includes('mock')) {
      const fill = cls.includes('crit') ? BOJA.negBg : cls.includes('flag') ? BOJA.ochreBg : BOJA.panel;
      const unutra = pretvori($, n, opt);
      dodaj(new Paragraph({ text: '', spacing: { before: 120, after: 0 },
        shading: { type: ShadingType.CLEAR, fill, color: 'auto' } }));
      unutra.forEach(x => dodaj(x));
      dodaj(new Paragraph({ text: '', spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: fill === BOJA.panel ? BOJA.linija : BOJA.ochre, space: 4 } } }));
      return;
    }
    // opci spremnici
    if (['div','section','header','footer','main','li','span'].includes(tag)) { dodaj(pretvori($, n, opt)); return; }
  });
  return izlaz;
}

/* ---------- pomocno: pločice (.grid .tile) u tablicu ---------- */
function plocice($, el) {
  const stavke = $(el).children('.tile').map((_, t) => ({
    k: $(t).find('.k').text().trim(),
    v: $(t).find('.v').text().trim().replace(/\s+/g,' '),
    s: $(t).find('p.sub, p:not(.k):not(.v)').text().trim()
  })).get();
  if (!stavke.length) return null;
  const sirine = [Math.round(SIRINA*0.26), Math.round(SIRINA*0.16), SIRINA - Math.round(SIRINA*0.26) - Math.round(SIRINA*0.16)];
  return [new Table({ columnWidths: sirine, width: { size: SIRINA, type: WidthType.DXA },
    borders: ['top','bottom','left','right','insideHorizontal','insideVertical'].reduce((a,k)=>(a[k]={style:BorderStyle.SINGLE,size:2,color:BOJA.linija},a),{}),
    rows: stavke.map(s => new TableRow({ children: [
      new TableCell({ width:{size:sirine[0],type:WidthType.DXA}, margins:{top:70,bottom:70,left:100,right:100},
        shading:{type:ShadingType.CLEAR,fill:BOJA.pozadina,color:'auto'},
        children:[tekstP(s.k, { bold:true, size:16, boja:BOJA.ink2, font:F.mono })] }),
      new TableCell({ width:{size:sirine[1],type:WidthType.DXA}, margins:{top:70,bottom:70,left:100,right:100},
        children:[tekstP(s.v, { font:F.serif, size:28, boja:BOJA.accent })] }),
      new TableCell({ width:{size:sirine[2],type:WidthType.DXA}, margins:{top:70,bottom:70,left:100,right:100},
        children:[tekstP(s.s, { size:18, boja:BOJA.ink2 })] }) ] })) }),
    new Paragraph({ text:'', spacing:{after:180} })];
}
module.exports = { pretvori, plocice, inline, tablica, tekstP, odlomak, BOJA, F, SIRINA,
  docx: require('docx'), cheerio, ROOT };

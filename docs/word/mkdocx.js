const fs = require('fs');
const D = require('docx');
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ImageRun,
  TableOfContents, PageBreak, LevelFormat, convertMillimetersToTwip
} = D;

const model = JSON.parse(fs.readFileSync('model.json', 'utf8'));

const INK='1A2330', MARK='9E3D22', SEA='166069', MUTED='5C6773', LINE='C9CDC6';
const BODY='Cambria', UI='Calibri';
const TEXTW = 9026;              // širina teksta u DXA
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const HAIR = { style: BorderStyle.SINGLE, size: 4, color: LINE };

// ---------- runovi ----------
function mkRuns(rs, o = {}) {
  const out = [];
  let prevEndsSpace = true;
  (rs || []).forEach(r => {
    let t = r.text.replace(/\s+/g, ' ');
    if (prevEndsSpace) t = t.replace(/^ +/, '');
    if (!t) return;
    prevEndsSpace = /\s$/.test(t);
    const run = new TextRun({
      text: t, bold: r.b || o.bold, italics: r.i || o.italics,
      font: o.font || BODY, size: o.size || 22,
      color: r.href ? '1F5673' : (o.color || null),
    });
    out.push(r.href ? new ExternalHyperlink({ children: [run], link: r.href }) : run);
  });
  return out;
}
const P = (rs, o = {}) => new Paragraph({
  children: mkRuns(rs, o),
  spacing: { after: o.after === undefined ? 140 : o.after, before: o.before || 0, line: o.line || 300 },
  alignment: o.align, indent: o.indent, border: o.border, keepNext: o.keepNext,
  numbering: o.numbering, style: o.style,
});
const txtP = (s, o = {}) => P([{ text: s, b: !!o.bold, i: !!o.italics }], o);

// ---------- numeriranje ----------
const numbering = { config: [{
  reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 360, hanging: 220 } }, run: { color: MARK } } }] }] };
let ordSeq = 0;
model.forEach(b => { if (b.t === 'list' && b.ordered) {
  const ref = 'num' + (ordSeq++);
  numbering.config.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 220 } }, run: { color: MARK, bold: true } } }] });
  b._ref = ref;
} });

// ---------- slike ----------
function figureParas(f, widthPx, capSize) {
  const maxH = widthPx > 400 ? 430 : (widthPx > 220 ? 235 : 180);
  if (f.natw) widthPx = Math.min(widthPx, f.natw);
  let w = widthPx, h = Math.round(widthPx * f.ar);
  if (h > maxH) { h = maxH; w = Math.round(maxH / f.ar); }
  const out = [new Paragraph({
    children: [new ImageRun({ data: fs.readFileSync(f.path), type: f.type, transformation: { width: w, height: h } })],
    spacing: { after: 60, before: 60 }, alignment: AlignmentType.CENTER, keepNext: true,
  })];
  if (f.caption && f.caption.length)
    out.push(P(f.caption, { font: UI, size: capSize, after: 30, line: 240 }));
  if (f.src && f.src.length)
    out.push(P(f.src, { font: UI, size: capSize - 2, color: MUTED, after: 200, line: 220 }));
  return out;
}

// ---------- tablice ----------
// širine stupaca prema duljini sadržaja, s donjom i gornjom granicom
function colWidths(b, n) {
  const len = Array(n).fill(0), cnt = Array(n).fill(0);
  const rowsAll = (b.head.length ? [b.head] : []).concat(b.rows);
  rowsAll.forEach(r => r.forEach((c, i) => {
    if (i >= n) return;
    len[i] += (c || []).reduce((a, x) => a + x.text.length, 0); cnt[i]++;
  }));
  let wt = len.map((L, i) => Math.pow(Math.max(4, L / Math.max(1, cnt[i])), 0.75));
  let sum = wt.reduce((a, x) => a + x, 0);
  let pct = wt.map(x => x / sum);
  const MIN = 0.13, MAX = 0.52;
  for (let k = 0; k < 4; k++) {
    pct = pct.map(p => Math.min(MAX, Math.max(MIN, p)));
    const s2 = pct.reduce((a, x) => a + x, 0);
    pct = pct.map(p => p / s2);
  }
  const w = pct.map(p => Math.round(TEXTW * p));
  w[w.length - 1] += TEXTW - w.reduce((a, x) => a + x, 0);
  return w;
}
function cell(rs, w, opt = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: opt.fill ? { type: ShadingType.CLEAR, fill: opt.fill, color: 'auto' } : undefined,
    margins: { top: 90, bottom: 90, left: 110, right: 110 },
    borders: opt.borders,
    children: (rs && rs.length ? [P(rs, { font: UI, size: opt.size || 19, after: 0, line: 250,
      bold: opt.bold, color: opt.color })] : [txtP('', { after: 0 })]),
  });
}
function mkTable(b) {
  const n = Math.max(b.head.length, ...b.rows.map(r => r.length), 1);
  const cw = colWidths(b, n);
  const rows = [];
  if (b.head.length) rows.push(new TableRow({ tableHeader: true, children:
    b.head.map((c, i) => cell(c, cw[i], { bold: true, color: INK, size: 18, fill: 'EDEEEA',
      borders: { top: { style: BorderStyle.SINGLE, size: 12, color: INK }, bottom: HAIR, left: NONE, right: NONE } })) }));
  b.rows.forEach(r => rows.push(new TableRow({ children:
    r.map((c, i) => cell(c, cw[i], { borders: { top: NONE, bottom: HAIR, left: NONE, right: NONE } })) })));
  return new Table({ rows, columnWidths: cw, width: { size: TEXTW, type: WidthType.DXA },
    borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: HAIR, insideVertical: NONE } });
}

// ---------- okviri ----------
function calloutTable(label, bodyParas, color, fill) {
  return new Table({
    columnWidths: [TEXTW], width: { size: TEXTW, type: WidthType.DXA },
    borders: { top: NONE, bottom: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE,
      left: { style: BorderStyle.SINGLE, size: 18, color } },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: TEXTW, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill, color: 'auto' },
      margins: { top: 140, bottom: 140, left: 200, right: 200 },
      children: [txtP(label.toUpperCase(), { font: UI, size: 15, bold: true, color, after: 70, line: 220 }), ...bodyParas],
    })] })],
  });
}

// ---------- dokument ----------
const kids = [];
const gap = (n) => kids.push(new Paragraph({ text: '', spacing: { after: n } }));

model.forEach(b => {
  switch (b.t) {
    case 'eyebrow':
      kids.push(txtP(b.text.toUpperCase(), { font: UI, size: 16, bold: true, color: MARK, after: 120 })); break;
    case 'title':
      kids.push(new Paragraph({ children: [new TextRun({ text: b.text, font: BODY, size: 60, bold: true, color: INK })],
        spacing: { after: 160 } })); break;
    case 'standfirst':
      kids.push(txtP(b.text, { size: 24, color: MUTED, after: 240, line: 320 })); break;
    case 'facts': {
      const cw = [Math.round(TEXTW / 3), Math.round(TEXTW / 3), TEXTW - 2 * Math.round(TEXTW / 3)];
      kids.push(new Table({ columnWidths: cw, width: { size: TEXTW, type: WidthType.DXA },
        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: LINE }, bottom: { style: BorderStyle.SINGLE, size: 8, color: LINE },
          left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
        rows: [new TableRow({ children: b.items.map((it, i) => new TableCell({
          width: { size: cw[i], type: WidthType.DXA }, margins: { top: 120, bottom: 120, left: 0, right: 140 },
          children: [txtP(it[0].toUpperCase(), { font: UI, size: 14, color: MUTED, after: 30, line: 200 }),
                     txtP(it[1], { font: UI, size: 19, bold: true, color: INK, after: 0, line: 220 })] })) })] }));
      gap(300);
      kids.push(txtP('Sadržaj', { font: BODY, size: 26, bold: true, color: INK, after: 120 }));
      kids.push(new TableOfContents('Sadržaj', { hyperlink: true, headingStyleRange: '1-2' }));
      kids.push(txtP('Ako je popis prazan: desni klik u njega \u2192 Update field (F9).',
        { font: UI, size: 15, color: MUTED, after: 0 }));
      kids.push(new Paragraph({ children: [new PageBreak()] }));
      break; }
    case 'h2':
      kids.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: b.num + '  ', font: UI, size: 22, bold: true, color: MARK }),
                   new TextRun({ text: b.text, font: BODY, size: 38, bold: true, color: INK })] }));
      kids.push(new Paragraph({ text: '', border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK } }, spacing: { after: 220 } }));
      break;
    case 'h3':
      kids.push(new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, spacing: { before: 300, after: 100 },
        children: mkRuns(b.runs, { size: 26, bold: true, color: INK }) })); break;
    case 'h4':
      kids.push(new Paragraph({ heading: HeadingLevel.HEADING_3, keepNext: true, spacing: { before: 240, after: 90 },
        children: mkRuns(b.runs, { font: UI, size: 19, bold: true, color: MUTED }) })); break;
    case 'p': kids.push(P(b.runs)); break;
    case 'terms':
      kids.push(new Paragraph({ children: mkRuns(b.runs, { size: 21 }), spacing: { after: 200, line: 300 },
        indent: { left: 220 }, border: { left: { style: BorderStyle.SINGLE, size: 12, color: LINE, space: 10 } } })); break;
    case 'list':
      b.items.forEach(it => kids.push(P(it, {
        numbering: { reference: b.ordered ? b._ref : 'bul', level: 0 },
        size: b.small ? 18 : 22, font: b.small ? UI : BODY, after: 70, line: 280 })));
      gap(100); break;
    case 'table': kids.push(mkTable(b)); gap(220); break;
    case 'note':
      kids.push(calloutTable(b.label, b.blocks.map((x, i, a) =>
        P(x.runs, { size: 20, after: i === a.length - 1 ? 0 : 120, line: 280 })),
        b.kind === 'mark' ? MARK : SEA, b.kind === 'mark' ? 'F6ECE7' : 'E9F1F1'));
      gap(220); break;
    case 'triad': {
      const ps = [];
      b.pairs.forEach((pr, i) => {
        ps.push(txtP(pr[0].toUpperCase(), { font: UI, size: 15, bold: true, color: MUTED, after: 20, line: 200 }));
        ps.push(P(pr[1], { size: 20, after: i === b.pairs.length - 1 ? 0 : 120, line: 280 }));
      });
      kids.push(calloutTable(b.label, ps, MARK, 'F8F7F4')); gap(220); break; }
    case 'figure': figureParas(b, 600, 18).forEach(p => kids.push(p)); break;
    case 'figrow': {
      const n = b.figs.length;
      const cw = Array(n).fill(Math.round(TEXTW / n));
      cw[n - 1] += TEXTW - cw.reduce((a, x) => a + x, 0);
      const px = n === 2 ? 278 : 182;
      kids.push(new Table({ columnWidths: cw, width: { size: TEXTW, type: WidthType.DXA },
        borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
        rows: [new TableRow({ children: b.figs.map((f, i) => new TableCell({
          width: { size: cw[i], type: WidthType.DXA },
          margins: { top: 0, bottom: 0, left: i ? 120 : 0, right: i === n - 1 ? 0 : 120 },
          children: figureParas(f, px, 16) })) })] }));
      gap(160); break; }
  }
});

const doc = new Document({
  features: { updateFields: true },
  creator: 'VisitLogic — nastavni materijali',
  title: 'Modul 1 — Arhitektura i urbanizam',
  description: 'Nastavna cjelina 1: arhitektura i urbanizam, ilustrirano izdanje',
  numbering,
  styles: { default: {
      document: { run: { font: BODY, size: 22, color: '2C3743' } },
      heading1: { run: { font: BODY, size: 38, bold: true, color: INK }, paragraph: { spacing: { before: 0, after: 60 } } },
      heading2: { run: { font: BODY, size: 26, bold: true, color: INK } },
      heading3: { run: { font: UI, size: 19, bold: true, color: MUTED } },
    },
    paragraphStyles: [{ id: 'Hyperlink', name: 'Hyperlink', basedOn: 'Normal', run: { color: '1F5673', underline: {} } }] },
  sections: [{
    properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: kids,
  }],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync('Modul-1-Arhitektura-i-urbanizam.docx', b);
  console.log('zapisano:', (b.length / 1048576).toFixed(2), 'MB, blokova:', kids.length);
});

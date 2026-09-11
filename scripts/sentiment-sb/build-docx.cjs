/**
 * Gradi dvije Word datoteke iz postojecih HTML izvjestaja:
 *   docs/word/Specifikacija-agenta-Slavonski-Brod.docx
 *   docs/word/Prva-iteracija-Slavonski-Brod.docx
 *
 * Pokretanje: node scripts/sentiment-sb/build-docx.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const H = require('./export-docx.cjs');
const { pretvori, tekstP, BOJA, F, SIRINA, docx, cheerio, ROOT } = H;
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
        LevelFormat, TableOfContents, PageBreak, Footer, Header, PageNumber, convertMillimetersToTwip } = docx;

const NUMERIRANJE = {
  config: [
    { reference: 'tocke', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 420, hanging: 220 } } } }] },
    { reference: 'brojevi', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 420, hanging: 220 } } } }] }
  ]
};

const STILOVI = {
  default: {
    document: { run: { font: F.sans, size: 20, color: BOJA.ink }, paragraph: { spacing: { line: 276 } } },
    title:    { run: { font: F.serif, size: 44, bold: false, color: BOJA.ink } },
    heading1: { run: { font: F.serif, size: 30, bold: false, color: BOJA.accent }, paragraph: { spacing: { before: 360, after: 120 } } },
    heading2: { run: { font: F.sans, size: 22, bold: true, color: BOJA.ink }, paragraph: { spacing: { before: 240, after: 80 } } },
    heading3: { run: { font: F.mono, size: 17, bold: true, color: BOJA.ochre }, paragraph: { spacing: { before: 200, after: 60 } } }
  }
};

function ocisti($) {
  $('script, style, link, nav.toc, #tip, .legenda').remove();
  $('[id="tip"]').remove();
  return $;
}

function naslovnica({ nadnaslov, naslov, podnaslov, meta }) {
  const d = [
    new Paragraph({ spacing: { before: 1600, after: 200 },
      children: [new TextRun({ text: nadnaslov.toUpperCase(), font: F.mono, size: 17, color: BOJA.ochre, characterSpacing: 40 })] }),
    new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 200 },
      children: [new TextRun({ text: naslov, font: F.serif, size: 52, color: BOJA.ink })] }),
    new Paragraph({ spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BOJA.accent, space: 10 } },
      children: [new TextRun({ text: podnaslov, font: F.serif, size: 26, italics: true, color: BOJA.ink2 })] })
  ];
  for (const [k, v] of meta) d.push(new Paragraph({ spacing: { after: 70 }, children: [
    new TextRun({ text: `${k}   `, font: F.mono, size: 17, color: BOJA.ink3 }),
    new TextRun({ text: v, font: F.sans, size: 19, color: BOJA.ink, bold: true }) ] }));
  d.push(new Paragraph({ children: [new PageBreak()] }));
  return d;
}

function sadrzajStranica(naslov) {
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 160 },
      children: [new TextRun({ text: naslov, font: F.serif, size: 30, color: BOJA.accent })] }),
    new TableOfContents('Sadržaj', { hyperlink: true, headingStyleRange: '1-2' }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

const podnozje = tekst => new Footer({ children: [new Paragraph({
  alignment: AlignmentType.RIGHT, spacing: { before: 120 },
  border: { top: { style: BorderStyle.SINGLE, size: 4, color: BOJA.linija, space: 6 } },
  children: [
    new TextRun({ text: `${tekst}    `, font: F.mono, size: 15, color: BOJA.ink3 }),
    new TextRun({ children: [PageNumber.CURRENT], font: F.mono, size: 15, color: BOJA.ink3 }),
    new TextRun({ text: ' / ', font: F.mono, size: 15, color: BOJA.ink3 }),
    new TextRun({ children: [PageNumber.TOTAL_PAGES], font: F.mono, size: 15, color: BOJA.ink3 })
  ] })] });

const STRANICA = {
  page: { margin: { top: convertMillimetersToTwip(20), bottom: convertMillimetersToTwip(20),
                    left: convertMillimetersToTwip(20), right: convertMillimetersToTwip(20) } }
};

async function gradi(cilj, { izvor, naslovnicaOpt, sadrzajNaslov, slike, filtar }) {
  const html = fs.readFileSync(path.join(ROOT, izvor), 'utf8');
  const $ = ocisti(cheerio.load(html));
  if (filtar) filtar($);
  const korijen = $('main').length ? $('main')[0] : $('.wrap')[0] || $('body')[0];
  const tijelo = pretvori($, korijen, { slike });

  const doc = new Document({
    styles: STILOVI, numbering: NUMERIRANJE,
    creator: 'Sentiment Radar Slavonski Brod', title: naslovnicaOpt.naslov,
    description: naslovnicaOpt.podnaslov,
    sections: [{
      properties: STRANICA,
      footers: { default: podnozje(naslovnicaOpt.naslov) },
      children: [...naslovnica(naslovnicaOpt), ...sadrzajStranica(sadrzajNaslov), ...tijelo]
    }]
  });
  const buf = await Packer.toBuffer(doc);
  fs.mkdirSync(path.dirname(cilj), { recursive: true });
  fs.writeFileSync(cilj, buf);
  console.log(`${path.basename(cilj)}  ${(buf.length/1024).toFixed(0)} kB  (${tijelo.length} blokova)`);
}

(async () => {
  const out = path.join(ROOT, 'docs/word');

  await gradi(path.join(out, 'Specifikacija-agenta-Slavonski-Brod.docx'), {
    izvor: 'docs/sentiment-agent-slavonski-brod.html',
    sadrzajNaslov: 'Sadržaj',
    naslovnicaOpt: {
      nadnaslov: 'Funkcionalna i tehnička specifikacija · v1.0',
      naslov: 'Sentiment Radar Slavonski Brod',
      podnaslov: 'Automatizirani tjedni agent za praćenje općeg i turističkog sentimenta — za Turističku zajednicu grada Slavonskog Broda',
      meta: [['Naručitelj', 'Turistička zajednica grada Slavonskog Broda'],
             ['Ritam', 'tjedno, ponedjeljkom u 06:00'],
             ['Isporuka', 'HTML izvještaj i PowerPoint prezentacija'],
             ['Opseg', '11 poglavlja'],
             ['Datum', '11. rujna 2026.']]
    },
    filtar: $ => { $('header.masthead').remove(); }
  });

  await gradi(path.join(out, 'Prva-iteracija-Slavonski-Brod.docx'), {
    izvor: 'docs/dashboard-slavonski-brod.html',
    sadrzajNaslov: 'Sadržaj izvještaja',
    naslovnicaOpt: {
      nadnaslov: 'Prva probna iteracija · stvarni podaci',
      naslov: 'Tjedni izvještaj o sentimentu',
      podnaslov: 'Slavonski Brod — prozor od 4. do 11. rujna 2026., generirano automatski iz javno dostupnih izvora',
      meta: [['Izvori', '3 od 5 dostupno (GDELT nedostupan)'],
             ['Uzorak', '28 objava, 35 aspektnih spominjanja'],
             ['Klasifikator', 'leksički MVP, točnost izmjerena na uzorku'],
             ['Trajanje obrade', '4 minute 38 sekundi'],
             ['Datum', '11. rujna 2026.']]
    },
    slike: { graf: { put: path.join(ROOT, 'docs/word/assets/graf-wikipedia.png'), sirina: 620, visina: 272,
      opis: 'Dnevni pregledi članka „Slavonski Brod" na hrvatskoj, engleskoj i njemačkoj Wikipediji kroz 60 dana.' } },
    filtar: $ => {
      $('header.top').remove();
      $('.graf').replaceWith('<div data-slika="graf"></div>');
      // Stupac s trakom je cisto vizualan - u Wordu bi ostao prazan.
      $('td.traka-c').remove();
      $('th').each((_, th) => { if ($(th).text().includes('Odstupanje od neutralnog')) $(th).remove(); });
    }
  });
})();

# Word izdanje Modula 1

`Modul-1-Arhitektura-i-urbanizam.docx` generira se iz
`docs/modul-1-arhitektura-urbanizam.html` — HTML je izvor istine, Word je izvedenica.
Nakon izmjene HTML-a dokument se ponovno izrađuje u tri koraka:

```bash
# 1. sheme (inline SVG) -> PNG, u mapu svgpng/
python3 render-sheme.py

# 2. HTML -> model.json (naslovi, tablice, okviri, slike, natpisi, izvori)
python3 parse.py

# 3. dopuna modela (putanje, omjeri, ujednačeni izrezi za redove slika)
python3 augment.py

# 4. model.json -> .docx
npm install docx     # samo prvi put
node mkdocx.js
```

Napomene:

- Sadržaj (TOC) je Wordovo polje. Dokument ima `updateFields`, pa ga Word ponudi
  osvježiti pri otvaranju; ako je popis prazan, desni klik u njega → Update field (F9).
- Navodi izvora ispod slika generiraju se iz `docs/img/modul1/izvori.json`
  (skripta `docs/build-slike.py`), pa se ne upisuju ručno.
- Provjera izlaza: `soffice --headless --convert-to pdf <datoteka>.docx`

## Ugradnja u kanonski udžbenik (K2)

`inject-u-kanonski.py` zamjenjuje MODUL 1 u kanonskoj datoteci
`K2_Kulturna_umjetnicka_i_nematerijalna_bastina_Hrvatske` ilustriranom verzijom,
uz preslikane stilove domaćina (Heading1–4, FirstParagraph, BodyText, Compact,
BlockText, Table, Figure, ImageCaption) i očuvane bookmarkove na koje upućuje sadržaj.

```bash
unzip -q K2_....docx -d unpacked && find unpacked -type l -delete
python3 render-sheme.py && python3 parse.py && python3 augment.py
python3 inject-u-kanonski.py                  # traži model.json, hostmap.json, svgpng/, rowimg/
(cd unpacked && zip -Xrq ../K2-ilustrirano.docx .)
python3 <skills>/docx/scripts/office/validate.py K2-ilustrirano.docx --original K2_....docx
```

Zamjenjuje se raspon od naslova „MODUL 1” do kraja cjeline „Vizualni prilozi za ovaj
modul”. Dijelovi **Sažetak modula 1**, **Samoprovjera — modul 1** i **Izvori i
literatura — modul 1** ostaju netaknuti.

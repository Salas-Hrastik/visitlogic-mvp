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

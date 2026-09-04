# Web sjedište TZ grada Slavonskog Broda

Produkcijski frontend prema **Varijanti B** iz Pogl. 13.2 Strategije — Next.js
App Router, sadržaj odvojen od prikaza, sve generirano statički.

Prototip iz `../brod/` ostaje kao referenca izgleda i ponašanja; ovaj projekt
je ono što ide u produkciju.

## Pokretanje

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # statička gradnja
npm run typecheck
```

## Struktura

| Putanja | Uloga |
|---|---|
| `content/*.json` | Sadržaj. Danas u repozitoriju, sutra iz CMS-a. |
| `src/lib/content/types.ts` | Model sadržaja prema Pogl. 5.1 |
| `src/lib/content/source.ts` | **Jedina točka dodira s pohranom** |
| `src/lib/content/validacija.ts` | Pravila koja tip ne može iznuditi |
| `src/lib/i18n.ts` | Rutiranje i jezični fallback (Pogl. 7.2–7.4) |
| `src/lib/rjecnik.ts` | Nazivi sučelja na HR/EN/DE |
| `src/proxy.ts` | HR bez prefiksa — prepisivanje, ne preusmjeravanje |
| `src/app/[jezik]/[[...put]]/page.tsx` | Razrješavanje putanje i sve stranice |
| `src/app/globals.css` | Dizajn sustav iz Pogl. 10.2 |

## Tri odluke koje objašnjavaju oblik koda

**Sadržaj se čita kroz jedan modul.** `source.ts` je jedino mjesto koje zna
odakle sadržaj dolazi. Funkcije su asinkrone iako danas čitaju JSON iz memorije —
upravo zato da prelazak na `fetch` prema Strapiju ne dira nijednu stranicu.

**Putanje se sastavljaju na jednom mjestu.** `putanja()` u `i18n.ts` jedina zna
kako izgleda URL. Pogl. 7.2 traži lokalizirane segmente (`dogadanja` / `events` /
`veranstaltungen`), pa je ručno slaganje stringova po komponentama način da se
tri jezika razidu. `razrijesi()` je njezin obrat i zajedno drže URL-ove
simetričnima.

**HR nema prefiks, ali interno ga ima.** Sve živi pod `/[jezik]/`, a `proxy.ts`
prepisuje putanju bez prefiksa na `/hr/`. Prepisivanje, ne preusmjeravanje —
Pogl. 7.4 zabranjuje automatsko preusmjeravanje po jeziku, a URL u adresnoj
traci mora ostati `/dogadanja`.

## Što je izvedeno

- Rutiranje na tri jezika s lokaliziranim segmentima; **110 statičkih stranica**
- Naslovnica, atrakcije, događanja, smještaj, gdje jesti, novosti — svi s detaljima
- Pretraga (W10) — indeks se gradi u buildu, filtriranje je u pregledniku,
  neosjetljivo na dijakritiku („tvrdava" nalazi Tvrđavu)
- Traka hitnih obavijesti (W11) s rokom trajanja koji provodi kod
- hreflang i canonical, apsolutni, samo za jezike u kojima prijevod postoji (7.3)
- Jezični fallback s vidljivom oznakom i `lang="hr"` na posuđenom tekstu (7.4)
- `Event` schema.org na detalju događaja (6.2)
- Dizajn tokeni iz 10.2.3, samoposluženi fontovi, `rem` jedinice, fokus prsten

## `zadnjaProvjera` je obavezno polje

Pogl. 5.1 uz E3 kaže da to polje *„ne postoji ni u jednom standardnom CMS
predlošku, ali je za malu TZ najvažnije polje u cijelom modelu"* — jer sprječava
najgori scenarij, gosta pred zatvorenim vratima. Zato je u tipu obavezno, a ne
neobavezno, i svaka stranica s praktičnim podacima nosi javnu oznaku ažurnosti.

## Što još nije

Itinereri i „Pitaj Brod" stoje kao poštene „u pripremi" stranice — postoje u
rutiranju, nemaju sadržaj. Nema karte, obrasca upita, filtara na katalozima ni
CMS-a. Rezervacije su Varijanta A iz Pogl. 8 (upit), pa detalj smještaja vodi
na kontakt umjesto na booking.

## Sadržaj

Podaci o atrakcijama preuzeti su iz baze prikupljene s Google Mapsa (2025.) i
**ispravljaju tri netočnosti iz prototipa**: Tvrđava je otvorena 0–24 i besplatna
(prototip je tvrdio 4 € i zatvoreno ponedjeljkom), Muzej Brodskog Posavlja je
4 €, a Kuća Brlićevih ima stvarno radno vrijeme. Cijena koja nije potvrđena na
izvoru nosi oznaku.

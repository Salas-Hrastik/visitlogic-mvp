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
- Filtri na katalozima događanja, smještaja i ugostiteljstva (Pogl. 4.4.2):
  čipovi, brojači uz svaku opciju, opcije s nula pogodaka onemogućene,
  stanje u URL-u, `aria-live` najava. Prazno stanje imenuje najrestriktivniji
  filtar (4.4.3)
- Hrvatska množina s tri oblika (Pogl. 7.5) — „1 rezultat", „2 rezultata"
- **„Pitaj Brod"** (Pogl. 9) — informator koji odgovara iz sadržaja sjedišta
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

## Filtri: zašto je stanje lokalno, a URL posljedica

Na statički predrenderiranoj stranici `useSearchParams()` se nakon
`router.replace` ne osvježi pouzdano. Kontrolirana kvačica zato ostaje
neoznačena i filtar se naprosto ne da uključiti — što se i dogodilo u prvoj
verziji. Izvor istine je sada lokalno stanje, a URL njegova posljedica;
`useEffect` sluša samo vanjske promjene URL-a (dubinska poveznica, natrag).

## „Pitaj Brod" (Pogl. 9)

Baza znanja gradi se iz **strukturiranog izvoza entiteta**, ne iz HTML-a
stranica (9.3), pa se informator i sjedište ne mogu raziću. Sustavska uputa je
prenesena iz 9.4 gotovo doslovno.

Tri stvari su namjerno izvedene kao kod, ne kao uputa modelu:

- **Hitne situacije** (9.4) — na ključne riječi (nesreća, hitna, policija, i
  njihove engleske i njemačke inačice) vraća se 112 i ostali brojevi, a model se
  **uopće ne poziva**. Jedini prihvatljiv odgovor ovdje je onaj koji ne može
  biti izmišljen. Provjera ide kroz sva tri jezika, jer se u panici piše na
  materinjem, ne na jeziku sučelja.
- **Ne znam** (9.4) — model vraća sentinel, poslužitelj ga zamjenjuje propisanim
  tekstom i **zapisuje pitanje u red za uredništvo** (9.6). Dokument taj red
  zove najkonkretnijim mehanizmom kontinuiranog poboljšanja koji sjedište može
  imati, pa postoji od prvog dana. Zapis je anonimiziran (9.7).
- **Predaja čovjeku** (9.5) — nakon dva uzastopna „ne znam" sučelje samo nudi
  Centar za posjetitelje. Telefon i radno vrijeme vidljivi su uvijek.

Uz to: oznaka „ovo je automatski asistent" pri svakom otvaranju (obveza iz EU
akta o umjetnoj inteligenciji), privola prije prve poruke — bez nje razgovor
nije moguć, ograničenje po IP-u i duljini ulaza, sanitizacija.

**Za rad treba `ANTHROPIC_API_KEY`.** Bez njega ruta uredno vraća 503 i sučelje
kaže da informator nije postavljen — ne puca. Sve ostalo, uključujući hitne
situacije, radi i bez ključa.

## Pravne stranice su nacrti

Politika privatnosti, izjava o pristupačnosti, kolačići i uvjeti korištenja
postoje na sva tri jezika, ali su **nacrti**. Status nacrta je polje u modelu
(`nacrt: boolean`), ne komentar — dok je `true`, stranica sama iznad teksta
kaže da nije prošla pravnu provjeru. Mjesta koja TZ mora dopuniti podebljana su
u tekstu.

Što ostaje izvan koda — DPA s pružateljem AI usluge (Pogl. 9.7 ga zove
preduvjetom za puštanje u rad), vanjska ocjena pristupačnosti, sigurnosne
kopije — popisano je u [`../brod/docs/PRIJE-OBJAVE.md`](../brod/docs/PRIJE-OBJAVE.md).

## Fotografije

Model slijedi E13: `alt`, `autor` i `licenca` su **obavezna polja** — uz E13
piše da se bez alt teksta ne može objaviti, pa to nosi tip, ne uputa uredniku.

Preuzeto je šest fotografija Kuće Brlićevih s `tzgsb.hr`. To je **sve što je
ondje upotrebljivo**: od 74 fotografije na postojećem sjedištu, 62 su sličice
širine 170 px. Licenca im je upisana kao `nepotvrdeno`, pa galerija prikazuje
vidljivu napomenu o pravima. Za ostale entitete TZ mora isporučiti izvornike.

## Što još nije

Itinereri stoje kao poštena „u pripremi" stranica — postoje u rutiranju, nemaju
sadržaj. Nema karte ni obrasca upita, ni CMS-a. Rezervacije
su Varijanta A iz Pogl. 8 (upit), pa detalj smještaja vodi na kontakt umjesto
na booking.

## Sadržaj

Podaci o atrakcijama preuzeti su iz baze prikupljene s Google Mapsa (2025.) i
**ispravljaju tri netočnosti iz prototipa**: Tvrđava je otvorena 0–24 i besplatna
(prototip je tvrdio 4 € i zatvoreno ponedjeljkom), Muzej Brodskog Posavlja je
4 €, a Kuća Brlićevih ima stvarno radno vrijeme. Cijena koja nije potvrđena na
izvoru nosi oznaku.

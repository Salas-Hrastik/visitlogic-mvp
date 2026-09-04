# Usklađenost prototipa sa Strategijom

Provjera prototipa (`../index.html`) prema dokumentu **„Novo višejezično web
sjedište TZ grada Slavonskog Broda — Strategija, informacijska arhitektura i
UX/UI koncept", verzija 1.0, 31. kolovoza 2026., 101 stranica.**

Provjereno je ono što je u prototipu mjerljivo: navigacija, paleta, tipografija,
mreža, pokrivenost žičanih maketa, semantika i pristupačnost. Sadržajna
vjerodostojnost demo podataka obrađena je odvojeno, u poglavlju 6.

**Ukupna ocjena: prototip vjerno slijedi Strategiju u onome što je vidljivo
(navigacija, paleta, IA logika), a odstupa u onome što se ne vidi golim okom
(tipografski budžet, jedinice, opseg sitemapa).** Nijedno odstupanje nije
koncepcijsko — sva su provedbena i popravljiva.

**O smjeru usklađivanja.** Sjedište razvijamo sami, pa Strategija nije
specifikacija predana nekom drugom nego vlastiti radni dokument. Zato svako
odstupanje ima dva ispravna ishoda: promijeniti kod ili promijeniti Strategiju.
Za svako odstupanje niže navedeno je koje rješenje ima jači razlog, ali odluka
je u oba slučaja naša. Ono što nije prihvatljivo jest da razlika ostane
nezabilježena — tada za pola godine nitko ne zna koja je vrijednost mjerodavna.

---

## 1. Što se poklapa

### Navigacija — doslovno poklapanje (Pogl. 4.3.1)

Svih pet stavki primarne navigacije, u sva tri jezika, znak po znak:

| Strategija | Prototip |
|---|---|
| Doživi / Things to do / Erleben | ✅ isto |
| Događanja / Events / Veranstaltungen | ✅ isto |
| Prenoći i jedi / Stay & Eat / Übernachten & Essen | ✅ isto |
| Planiraj / Plan your trip / Reise planen | ✅ isto |
| Otkrij Brod / About Brod / Brod entdecken | ✅ isto |

### Brend boje (Pogl. 10.2.3)

Osam od trinaest tokena preuzeto je točno, uključujući sve nositelje identiteta:

| Token | Prototip | Strategija | |
|---|---|---|---|
| Primarna (duboka savska) | `#0F4C5C` | `#0F4C5C` | ✅ |
| Primarna tamna | `#0A3642` | `#0A3642` | ✅ |
| Akcent (opeka Tvrđave) | `#B5451B` | `#B5451B` | ✅ |
| Akcent tamna | `#8E3614` | `#8E3614` | ✅ |
| Uspjeh | `#1F7A45` | `#1F7A45` | ✅ |
| Greška | `#B3261E` | `#B3261E` | ✅ |
| Pozadina | `#FFFFFF` | `#FFFFFF` | ✅ |
| Fokus prsten | `#0A66C2` | `#0A66C2` | ✅ |

### Ostalo usklađeno

- **Fontovi samoposluženi, ne s Googleova CDN-a** (10.2.2) — ispravljeno u ovom
  radu; prototip sada nema **nijedan** vanjski zahtjev.
- **Žičane makete W1–W9 i W12** pokrivene su ekranima. W12 u Strategiji obuhvaća
  i kontakt i „Pitaj Brod", pa dva ekrana pod istom oznakom nisu greška.
- **Tri jezika** (Pogl. 7) s promjenom `lang` atributa pri prebacivanju.
- **Semantički HTML** (11.3, kriterij 1.3.1): `<nav>`, `<main>`, `<article>`,
  `<header>`, `<footer>`.
- **Pristupačnost u markupu**, ne kroz overlay (11.2): skip link, 16 × `aria-label`,
  `aria-modal`, `aria-pressed`, `aria-selected`, `aria-live`, klasa za čitače ekrana.
- **`prefers-color-scheme` i `prefers-reduced-motion`** (11.2).
- **Tamna tema s vlastitim tokenima**, ne automatskom inverzijom — točno kako
  10.2.3 traži *ako* se tamna tema radi.

---

## 2. Odstupanja — dizajn sustav

### 2.1 Tipografija — najveće odstupanje (Pogl. 10.2.2) — ✅ riješeno (O1)

Strategija traži: *„sustavski font stack kao osnova (nula mrežnih zahtjeva) +
**najviše jedan** varijabilni font za naslove… Ukupan budžet fontova: **≤ 60 KB**."*

Prototip koristi **dva** web fonta — Archivo za naslove i Public Sans za tijelo
teksta — pa tijelo teksta nije u sustavskom fontu.

| | Strategija | Prototip |
|---|---|---|
| Broj web fontova | najviše 1 | 2 |
| Tijelo teksta | sustavski stack | Public Sans (mrežni zahtjev) |
| Budžet | ≤ 60 KB | 136,1 KB ukupno, 110,2 KB po tipičnom učitavanju |

**Riješeno u korist koda:** oba fonta se zadržavaju, a budžet u Pogl. 10.2.2
podiže se na ≤ 120 KB po tipičnom učitavanju. Obrazloženje i gotov tekst za
zamjenu u [`ODLUKE.md`](ODLUKE.md), odluka O1.

Odbačena alternativa bila je izbaciti Public Sans i vratiti tijelo teksta na
sustavski stack (66,0 KB), što bi uštedjelo 44 KB uz vidljivu promjenu karaktera
teksta.

### 2.2 Veličine teksta (Pogl. 10.2.2)

Najmanja veličina u tipografskoj ljestvici Strategije je **14 px** (mali tekst i
metapodaci); za tijelo teksta izrijekom piše *„Minimalna veličina tijela teksta:
16 px. Nikad ispod."*

Prototip ima **24 pravila ispod te granice**: 13 px (15 pravila), 12 px (5),
11 px (4). Za njih u ljestvici nema osnove.

### 2.3 Neutralni tokeni i tokeni upozorenja (Pogl. 10.2.3) — ✅ riješeno (O2)

Pet tokena odstupalo je od propisanih vrijednosti:

| Token | Prototip | Strategija |
|---|---|---|
| Upozorenje | `#8A5800` | `#9A6300` |
| Tekst osnovni | `#101B1D` | `#1A1D1E` |
| Tekst prigušen | `#43555A` | `#4A5254` |
| Pozadina suptilna | `#F1F5F5` | `#F5F7F7` |
| Rub | `#CFDBDC` | `#D5DBDC` |

Sve su razlike male i **nijedna ne pada ispod traženog kontrasta** — prototipov
`#8A5800` je čak tamniji, dakle kontrastniji od propisanog. Problem nije kontrast
nego to što postoje **dvije verzije palete**: kad se za pola godine bude tražilo
zašto je neki rub svjetliji nego drugdje, nitko neće znati koja je vrijednost
mjerodavna. Treba odabrati jednu i uskladiti oba dokumenta.

**Riješeno u korist Strategije:** svih pet vrijednosti usklađeno je u kodu,
uz preračunate kontraste (odluka O2). Tamna tema nije dirana.

**Nazivlje tokena** riješeno je obratno — Strategija propisuje `--c-primary`,
`--c-accent`, `--c-text`, a zadržava se nazivlje iz koda (`--brand`, `--brick`,
`--ink`), koje je opisnije. Gotova zamjenska tablica je u odluci O3.

### 2.4 Hardkodirane boje (Pogl. 10.2.3)

Pravilo glasi: *„nijedna heksadecimalna vrijednost izravno u komponenti."*
Prototip ima **75 različitih hex vrijednosti izvan `:root`**, gotovo sve u
generiranim SVG motivima. U produkciji te motive zamjenjuju fotografije, pa
odstupanje vjerojatno nestaje samo od sebe — ali ako motivi ostanu, boje moraju
u varijable.

### 2.5 Mreža (Pogl. 10.2.1)

Za prijelom xl (1440+) Strategija propisuje **maksimalnu širinu sadržaja
1360 px**. Prototip koristi `--maxw: 1240px`.

### 2.6 Jedinice (Pogl. 11.3, kriterij WCAG 1.4.4)

Strategija traži **relativne jedinice (rem)** radi zumiranja do 200 %. Prototip
ima 679 vrijednosti u `px` naspram 4 u `rem`. Zumiranje preglednika i dalje radi,
ali korisnikova postavka veće osnovne veličine fonta nema učinka.

### 2.7 `prefers-contrast`

Poglavlje 11.2 nabraja tri mehanizma; prototip podržava dva. `prefers-contrast`
nije implementiran.

---

## 3. Odstupanja — opseg

### 3.1 W11 — Novosti, priopćenja i hitne obavijesti — ✅ riješeno (O7)

Bila je to jedina od dvanaest žičanih maketa koju prototip nije prikazivao.
Sada je izvedena u cijelosti:

- **Traka hitnih obavijesti** na vrhu svih ekrana, `role="alert"`, s vremenom
  ažuriranja, poveznicom na detalje i gumbom za odbacivanje. Odbacivanje se pamti.
- **Rok trajanja.** Anotacija uz W11 traži da traka bude uređivačka komponenta s
  rokom trajanja — *„inače ostaje mjesecima i gubi značenje."* Polje `objaviDo`
  je obavezno i traka se sama prestaje prikazivati kad rok istekne.
- **Ekran novosti** s filtrima Sve / Obavijesti / Priopćenja / Natječaji /
  Projekti, karticama s datumom i vrstom te otvaranjem cijelog teksta.
- Poveznica u podnožju; sve troje na HR, EN i DE.

### 3.2 W10 — Pretraga postoji, ali nije predstavljena — ✅ riješeno

Funkcija pretrage bila je implementirana, ali ekran nije bio u izborniku ekrana.
Sada jest, s upitom „tvrđava" da se odmah vidi popunjen.

### 3.3 Sitemap (Pogl. 4.2)

Prototip pokriva pet glavnih grana. Ne postoje: `/mice` (poslovni segment s
vlastitim RFP obrascem), `/novosti`, `/o-nama` sa svim podstranicama, `/faq`
(koji je u Pogl. 6.4 ključan za jezične modele), `/newsletter` i cijela
pravno-utilitarna grana.

**Iz te grane posebno:** `/izjava-o-pristupacnosti`, `/politika-privatnosti` i
`/kolacici`. Za tijelo javnog sektora to nisu opcionalne stranice.

Za prototip je ovo opravdano — svrha mu je pokazati koncept, ne opseg. Postaje
obveza tek u produkciji.

---

## 4. Što je Strategija tražila, a prototip je već ispravio

Poglavlje 1.1 opisuje zatečeno stanje `tzgsb.hr`: događanja bez strukturiranih
datuma, bez filtriranja i bez pojedinačnih URL-ova; nepostojanje karte, itinerera
i planera puta; AI informator kao vanjski widget odvojen od sadržaja.

Prototip na sve to odgovara: kalendar s filtrima po datumu, tipu, cijeni i
publici; detalj događaja s vlastitim ekranom; karta; šest itinerera; „Moj plan";
informator ugrađen u sjedište i povezan sa sadržajem preko izvora i radnji.

**Strateška teza je prenesena ispravno.** Prototip je planer boravka, ne brošura.

---

## 5. Redoslijed popravaka

**Napravljeno:**
1. ✅ Pet neutralnih tokena i token upozorenja usklađeno (O2)
2. ✅ Ekran pretrage (W10) uvršten u izbornik
3. ✅ Odluka o fontovima — oba se zadržavaju, budžet u Strategiji se podiže (O1)
4. ✅ Nazivlje tokena — zadržava se kod, ispravlja se Strategija (O3)

5. ✅ W11 — traka hitnih obavijesti i ekran novosti (O7)
6. ✅ Kuća Brlićevih dodana i uvrštena u itinerer

**Otvoreno** — vidi tablicu na kraju [`ODLUKE.md`](ODLUKE.md):
7. `--maxw`: 1240 px u kodu naspram 1360 px u Strategiji (O5)
8. Veličine ispod 14 px (O4)
9. Prelazak s `px` na `rem` (O6)

**Za produkciju:**
8. Prijeći na `rem`
9. `prefers-contrast`
10. Boje iz SVG motiva u varijable, ako motivi ostaju
11. Pravno-utilitarne stranice, prije svega Izjava o pristupačnosti

---

## 6. Sadržaj: usporedba sa stvarnim podacima

Odvojeno od Strategije, demo podaci prototipa uspoređeni su s dokumentom
„Slavonski Brod — turistička ponuda, baza podataka za chatbot" (Google Maps, 2025.):

| Kategorija | U prototipu | Stvarnih |
|---|---|---|
| Atrakcije | 9 | 6 |
| Događanja | 17 | 2 od 5 ključnih manifestacija |
| Smještaj | 8 | 0 |
| Ugostiteljstvo | 6 | 0 |

To odgovara onome što prototip o sebi tvrdi, pa nije nedosljednost nego popis
posla. Tri podatka o stvarnim objektima ipak treba provjeriti na izvoru:

- **Tvrđava Brod** — prototip: „Uto–ned 09:00–20:00, ponedjeljkom zatvoreno, 4 €".
  Baza: „otvoreno 24 sata, svaki dan, besplatan ulaz". Vjerojatno je oboje
  djelomično točno — kompleks je otvoren i besplatan, a muzeji u njemu imaju
  radno vrijeme i ulaznicu. Prototip cijelu tvrđavu tretira kao naplatnu atrakciju.
- **Muzej Brodskog Posavlja** — 3 € naspram ~4 €.
- **Franjevački samostan** — 08:00–19:00 naspram „otvoreno 24 sata".

**Jedna stvarna greška u sadržaju — ✅ ispravljena.** Itinerer „Tragovima Ivane
Brlić-Mažuranić" u uvodu je obećavao *„Trg, kuća, muzejski postav"*, a četiri su
mu točke bile Korzo → Muzej → Galerija → Slastičarna Tambura (izmišljeni objekt).
**Kuća Brlićevih** — njezina stvarna memorijalna kuća, ocjena 4,8 — nije se
spominjala nijednom. Itinerer je obećavao kuću koje nema.

Kuća je dodana kao atrakcija sa **stvarnim radnim vremenom** iz baze (pon, sri,
pet i sub 10–14, uto i čet 18–20, nedjeljom zatvoreno) i uvrštena u itinerer kao
druga postaja, odmah nakon Korza — na istom je trgu. Redoslijed je sada Korzo →
Kuća Brlićevih → Muzej → Galerija → Tambura, sa satnicom preračunatom unutar
zadanih 240 minuta. Cijena ulaznice nije poznata iz baze, pa nosi oznaku demo
podatka.

Time je popunjena i praznina koju je Pogl. 4.2 otvorilo:
`/otkrij-brod/ivana-brlic-mazuranic` predviđen je kao **tematska okosnica
identiteta** destinacije, a nedostajao joj je središnji objekt.

Nedostaju i druge jake stvarne atrakcije: Muzej tambure, Galerija Ružić,
Kazalište Ivane Brlić-Mažuranić, Gradski park (2.035 ocjena), Šuma Striborova,
izletište Jezero Zeleno srce, gradski bazeni.

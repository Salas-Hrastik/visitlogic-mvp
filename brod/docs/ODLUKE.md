# Dnevnik odluka

Odstupanja između koda i Strategije rješavaju se u jednom od dva smjera —
mijenja se kod ili se mijenja Strategija. Ovdje se bilježi koji je smjer
odabran i zašto, da se za pola godine ne raspravlja ispočetka.

Strategija se vodi kao Google dokument `TZSlavonskiBrodstrategijawebsjedista`.
Odluke koje traže izmjenu Strategije nose gotov tekst za zamjenu, jer izmjenu
u samom dokumentu treba napraviti ručno.

---

## O1 — Dva web fonta umjesto jednog

**Datum:** 4. rujna 2026. · **Poglavlje:** 10.2.2 · **Smjer: mijenja se Strategija**

Strategija je tražila sustavski font stack kao osnovu i najviše jedan varijabilni
font za naslove, uz budžet ≤ 60 KB. Prototip koristi Archivo za naslove i
Public Sans za tijelo teksta.

**Odlučeno: zadržati oba fonta, ispraviti Strategiju.** Ograničenje je napisano
prije nego što je dizajn postojao. Tipografija je dio onoga zbog čega prototip
izgleda vjerodostojno, a stvarni je trošak manji nego što je budžet
pretpostavljao: fontovi su samoposluženi, keširaju se i učitavaju s
`font-display: swap`, pa ne blokiraju prikaz.

**Stvarna težina** (izmjereno, ne procijenjeno):

| | Bajtova | |
|---|---|---|
| Svih šest datoteka | 139.404 | 136,1 KB |
| Tipično učitavanje (bez kurziva) | 112.840 | **110,2 KB** |
| Kad bi ostao samo Archivo | 67.536 | 66,0 KB |

Kurziv se učitava samo kad se na stranici pojavi kurzivni tekst, pa uobičajeno
učitavanje staje na 110 KB.

**Odbačena alternativa:** izbaciti Public Sans i vratiti tijelo teksta na
sustavski stack. Uštedjelo bi 44 KB, ali bi tijelo teksta vidljivo promijenilo
karakter — a 44 KB na keširanom, samoposluženom fontu nije vrijedno te promjene.

### Tekst za zamjenu u Pogl. 10.2.2

> **Izbor fontova:** dva samoposlužena varijabilna fonta — jedan naslovni
> (Archivo, težine 500–800) i jedan tekstualni (Public Sans, 400–700 plus
> kurziv 400). Oba s `font-display: swap` i podskupovima `latin` + `latin-ext`;
> `latin-ext` je obavezan jer su hrvatski dijakritički znakovi (č, ć, đ, š, ž)
> izvan osnovnog latinskog raspona, a njemački (ä, ö, ü, ß) su unutar njega.
> **Nikad s Googleova CDN-a** — samoposluživanje je uvjet zbog GDPR-a, ne
> preporuka. Budžet fontova: **≤ 120 KB po tipičnom učitavanju**, mjereno bez
> kurziva. Varijabilni format je uvjet: jedna datoteka po obitelji i podskupu
> pokriva cijeli raspon težina umjesto jedne datoteke po težini.

---

## O2 — Neutralni tokeni i token upozorenja

**Datum:** 4. rujna 2026. · **Poglavlje:** 10.2.3 · **Smjer: mijenja se kod**

Pet tokena u kodu odstupalo je od vrijednosti u Strategiji. Vrijednosti iz
Strategije birane su s izračunatim kontrastima, a one u kodu izgledale su kao
nenamjeran pomak.

**Odlučeno: uskladiti kod prema Strategiji.** Provedeno.

| Token | Bilo | Sada | Kontrast na bijeloj |
|---|---|---|---|
| `--warn` | `#8A5800` | `#9A6300` | 6,04 → **5,05** |
| `--ink` | `#101B1D` | `#1A1D1E` | 17,55 → **16,96** |
| `--ink-2` | `#43555A` | `#4A5254` | 7,82 → **8,00** |
| `--paper-2` | `#F1F5F5` | `#F5F7F7` | — |
| `--line` | `#CFDBDC` | `#D5DBDC` | 1,42 → **1,40** |

Kontrasti su preračunati; nijedan tekstualni token ne pada ispod WCAG AA (4,5:1).
Vrijedi primijetiti da je `--warn` ovom izmjenom postao **manje** kontrastan —
prijašnja vrijednost bila je tamnija. I dalje prolazi AA s rezervom, pa je
usklađenost pretegnula.

Tokeni bez para u Strategiji (`--ink-3`, `--paper-3`, `--line-strong`) nisu
dirani; tonska ljestvica ostaje ispravno stupnjevana. Tamna tema nije dirana —
Strategija je vodi kao otvoreno pitanje s vlastitim kontrastima.

---

## O3 — Nazivlje tokena

**Datum:** 4. rujna 2026. · **Poglavlje:** 10.2.3 · **Smjer: mijenja se Strategija**

Strategija propisuje `--c-primary`, `--c-accent`, `--c-text`; kod koristi
`--brand`, `--brick`, `--ink`.

**Odlučeno: zadržati nazivlje iz koda, ispraviti Strategiju.** Preimenovanje kroz
2.900 linija je čista buka bez dobitka. Imena u kodu su k tome opisnija —
`--brick` govori odakle boja dolazi (opeka Tvrđave), `--c-accent` ne govori ništa.

### Tekst za zamjenu u tablici Pogl. 10.2.3

| Uloga | Token | Vrijednost |
|---|---|---|
| Primarna (brend) | `--brand` | `#0F4C5C` (duboka savska) |
| Primarna tamna (hover) | `--brand-2` | `#0A3642` |
| Akcent (CTA) | `--brick` | `#B5451B` (opeka Tvrđave) |
| Akcent tamna | `--brick-2` | `#8E3614` |
| Uspjeh | `--ok` | `#1F7A45` |
| Upozorenje | `--warn` | `#9A6300` |
| Greška | `--err` | `#B3261E` |
| Tekst osnovni | `--ink` | `#1A1D1E` |
| Tekst prigušen | `--ink-2` | `#4A5254` |
| Tekst najprigušeniji | `--ink-3` | `#6B7D81` |
| Pozadina | `--paper` | `#FFFFFF` |
| Pozadina suptilna | `--paper-2` | `#F5F7F7` |
| Pozadina naglašena | `--paper-3` | `#E4EBEB` |
| Rub | `--line` | `#D5DBDC` |
| Rub naglašeni | `--line-strong` | `#A9BCBE` |
| Fokus prsten | `--focus` | `#0A66C2` |

Zadržava se pravilo: boja nikad nije jedini nositelj informacije, i nijedna
heksadecimalna vrijednost izravno u komponenti.

---

## O8 — Next.js 16 umjesto 15

**Datum:** 4. rujna 2026. · **Poglavlje:** 13.2 · **Smjer: mijenja se Strategija**

Pogl. 13.2 imenuje „Next.js 15 (App Router)". U međuvremenu je 16 stabilan, pa
bi kretanje na 15 značilo početak na prethodnom majoru i migraciju za nekoliko
mjeseci.

**Odlučeno: Next.js 16.** U Pogl. 13.2 zamijeniti „Next.js 15 (App Router) ili
Nuxt 4" s „Next.js 16 (App Router) ili Nuxt 4".

Uz to: Next 16 je konvenciju `middleware.ts` proglasio zastarjelom u korist
`proxy.ts`. Projekt od početka koristi novu konvenciju, pa nema upozorenja u
buildu ni migracije kasnije.

---

## O9 — Bez vektorske baze za informator

**Datum:** 4. rujna 2026. · **Poglavlje:** 9.3 · **Smjer: mijenja se Strategija**

Pogl. 9.3 predviđa indeksiranje, embeddinge i vektorsku bazu između izvora
znanja i modela.

**Odlučeno: cijela baza znanja ide u zahtjev, bez vektorske baze.** Za dvadesetak
entiteta to je **točnije** — model vidi sve i ne može promašiti zapis koji
dohvaćanje po sličnosti ne bi vratilo — i jeftinije, jer nema embeddinga ni
druge infrastrukture. Baza je stabilan prefiks pa se kešira, što nosi glavninu
uštede.

Vektorska baza postaje potrebna tek kad znanje preraste kontekst. Prag treba
zapisati u Strategiju: **kad baza znanja prijeđe otprilike 100.000 znakova**,
vraća se dohvaćanje po sličnosti. Do tada je to infrastruktura bez svrhe.

### Dopuna za Pogl. 9.3

> **Faza 1 (do ~100.000 znakova baze znanja):** cijeli strukturirani izvoz
> prosljeđuje se modelu u sustavskoj uputi, uz keširanje prefiksa. Bez
> indeksiranja i bez vektorske baze.
> **Faza 2 (iznad tog praga):** uvodi se chunking, embeddinzi i vektorska baza
> kako je opisano u izvornom dijagramu.

---

## O10 — Pravni tekstovi kao nacrti s poljem, ne s napomenom

**Datum:** 4. rujna 2026. · **Poglavlje:** 9.7, 11.1 · **Smjer: dopunjuje se kod**

Politika privatnosti, izjava o pristupačnosti, kolačići i uvjeti korištenja
napisani su kao **nacrti**, jer ih mora pregledati pravnik.

**Odlučeno: status nacrta je polje u modelu (`nacrt: boolean`), ne komentar.**
Komentar u kodu se previdi, a stranica koja izgleda kao objavljena politika
privatnosti čita se kao obveza. Dok je polje `true`, stranica sama, iznad
teksta, kaže da nije prošla pravnu provjeru. Objava kao gotovog dokumenta traži
svjesnu izmjenu podatka, ne zaborav.

Mjesta koja TZ mora dopuniti podebljana su unutar teksta, pa se vide bez
pretraživanja koda. Popis je u [`PRIJE-OBJAVE.md`](PRIJE-OBJAVE.md).

---

## O11 — „Objeduj" umjesto „jedi"

**Datum:** 4. rujna 2026. · **Poglavlje:** 4.2, 4.3.1 · **Smjer: mijenja se Strategija**

Naručitelj traži da se u hrvatskom nazivlju umjesto „jedi" koristi „objeduj".

**Provedeno u kodu:**

| Bilo | Sada |
|---|---|
| Prenoći i jedi | **Prenoći i objeduj** |
| Gdje jesti | **Gdje objedovati** |
| `/prenoci-i-jedi/` | `/prenoci-i-objeduj/` |
| `/prenoci-i-jedi/gdje-jesti` | `/prenoci-i-objeduj/gdje-objedovati` |

Engleski i njemački ostaju nepromijenjeni — traženo je hrvatsko nazivlje.

Promijenjen je i **segment URL-a**, ne samo natpis. Da je ostao `gdje-jesti`
ispod natpisa „Gdje objedovati", nastala bi razlika koju bi netko kasnije
morao objašnjavati. Sjedište još nije objavljeno, pa nema starih poveznica
koje bi trebalo preusmjeriti; kad bude, svaka takva promjena traži 301.

**U Strategiji treba ispraviti Pogl. 4.2 (sitemap) i tablicu u Pogl. 4.3.1.**

### Uz to: navigacija vraćena na pet stavki

Pogl. 4.3.1 propisuje točno pet, a u kodu ih je bilo šest — uz to krivih:
„Novosti i priopćenja" i „Pretraga" bile su u navigaciji, a **„Otkrij Brod"
je nedostajao**. Sada je: Doživi · Događanja · Prenoći i objeduj · Planiraj ·
Otkrij Brod. Novosti i pretraga su u podnožju, gdje su i bile.

`/otkrij-brod` zasad je stranica u pripremi, kao i itinereri.

---

## O12 — Fotografije s postojećeg sjedišta

**Datum:** 4. rujna 2026. · **Poglavlje:** 3.1.3, 5.1 (E13) · **Smjer: dopunjuje se kod**

Naručitelj je odobrio korištenje fotografija s `tzgsb.hr`.

**Nalaz: od 74 fotografije na tom sjedištu, upotrebljivih je šest.**

| Širina | Broj |
|---|---|
| 1000 px i više | 5 |
| 600–999 px | 1 |
| 300–599 px | 0 |
| 170–299 px | **62** |
| ispod 170 px | 6 |

Svih šest upotrebljivih prikazuje **Kuću Brlićevih**. Ostalo su sličice od
170 px, koje na kartici od 400 px — pogotovo na zaslonu dvostruke gustoće —
izgledaju mutno. Postojeće sjedište ih koristi u toj veličini jer ih tako i
prikazuje.

**Zaključak: zaliha fotografija ne postoji.** Za ostale entitete TZ mora
isporučiti izvornike. To potvrđuje procjenu iz Pogl. 3.1.3 da fotografije
traže vlastitu trijažu, a ne preuzimanje sa starog sjedišta.

**Prava:** E13 traži autora i licencu kao obavezna polja. Upisani su kao
`nepotvrdeno`, uz izvor i datum preuzimanja. Galerija zbog toga prikazuje
**vidljivu napomenu** da prava nisu potvrđena — fotografija bez utvrđenih
prava ne smije tiho proći u produkciju samo zato što izgleda dobro.

---

## O13 — Licencija fotografije se provodi kodom

**Datum:** 4. rujna 2026. · **Poglavlje:** 5.3.2, 5.3.3 · **Smjer: dopunjuje se kod**

Postavljeno je pitanje mogu li se koristiti izvornici s web sjedišta objekata i
fotografije s Google Mapsa.

**Odgovor je u samoj Strategiji.** Pogl. 5.3.2, točka 2: *„Fotografija bez ovog
polja **ne smije** biti objavljena."* Uz to se traži pisana suglasnost (t. 1) i
vidljiv kredit autora (t. 3).

**Odlučeno: pravilo se provodi kodom, ne disciplinom.**

- `slikaObjavljiva()` propušta samo sliku s utvrđenom licencijom koja nije
  istekla. `Galerija` filtrira prije ičega drugog.
- Zadržane fotografije se ne prešućuju — stranica kaže koliko ih čeka potvrdu,
  da se vidi da posao postoji.
- Kredit autora prikazuje se u galeriji, kako t. 3 i traži.

**Posljedica:** šest fotografija Kuće Brlićevih trenutno **nije objavljeno**,
jer im je licencija `nepotvrdeno`. Objavljuju se izmjenom dva polja čim TZ
potvrdi da su njihove.

**Google Maps:** te fotografije pripadaju onome tko ih je postavio, a Googleova
licencija ne prenosi se na treće strane; uvjeti zabranjuju preuzimanje. Zakonita
je varijanta Places API („Place Photos") — prikaz uživo uz atribuciju, bez
pohrane — ali se plaća po prikazu i po Pogl. 14.2 traži privolu. Za objekte koji
ionako moraju dati suglasnost zbog opisa i cijena, izravno traženje je
jednostavnije.

**Drugi nalaz:** provjera iz 5.3.3 pokazuje da su i te fotografije 1024 i 950 px,
dakle **ispod praga od 1200 px** koji Strategija traži pri uvozu. Prag treba
navesti u zahtjevu prema objektima.

Popis zahtjeva po objektima: [`ZAHTJEV-ZA-FOTOGRAFIJE.md`](ZAHTJEV-ZA-FOTOGRAFIJE.md).

---

## Otvoreno

| | Pitanje | Poglavlje |
|---|---|---|
| **O4** | Veličine teksta ispod 14 px — spustiti ljestvicu u Strategiji ili podići 24 pravila u kodu | 10.2.2 |
| **O5** | Maksimalna širina sadržaja: 1240 px u kodu, 1360 px u Strategiji | 10.2.1 |
| **O6** | Prelazak s `px` na `rem` — traži WCAG 1.4.4, dira cijeli stilski blok | 11.3 |

---

## O7 — W11: novosti i hitne obavijesti

**Datum:** 4. rujna 2026. · **Poglavlje:** 10.3 · **Smjer: mijenja se kod**

Jedina od dvanaest žičanih maketa koju prototip nije prikazivao. Izvedena je u
cijelosti, prema anotaciji uz W11.

**Traka hitnih obavijesti** stoji na vrhu svih ekrana, ima `role="alert"`,
prikazuje vrijeme ažuriranja, vodi na cijeli tekst i može se odbaciti; odbacivanje
se pamti po objavi, pa se ista obavijest ne vraća.

**Rok trajanja je ugrađen, ne preporučen.** Anotacija traži da traka bude
uređivačka komponenta s rokom trajanja — *„inače ostaje mjesecima i gubi
značenje."* Polje `objaviDo` zato nije neobavezno: traka se sama prestaje
prikazivati kad rok istekne, bez ičije intervencije.

**Ekran novosti** ima filtre Sve / Obavijesti / Priopćenja / Natječaji / Projekti
i kartice s datumom, vrstom i sažetkom; cijeli tekst otvara se u modalu. Sve na
HR, EN i DE, s poveznicom u podnožju.

Uz W11 je ispravljena i jedina stvarna greška u sadržaju — **Kuća Brlićevih**
dodana je kao atrakcija sa stvarnim radnim vremenom i uvrštena u itinerer
„Tragovima Ivane Brlić-Mažuranić", koji ju je u uvodu obećavao, a nije je imao.

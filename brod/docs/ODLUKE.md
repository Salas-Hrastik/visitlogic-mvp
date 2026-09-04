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

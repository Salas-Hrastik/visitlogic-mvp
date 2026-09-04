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

## Otvoreno

| | Pitanje | Poglavlje |
|---|---|---|
| **O4** | Veličine teksta ispod 14 px — spustiti ljestvicu u Strategiji ili podići 24 pravila u kodu | 10.2.2 |
| **O5** | Maksimalna širina sadržaja: 1240 px u kodu, 1360 px u Strategiji | 10.2.1 |
| **O6** | Prelazak s `px` na `rem` — traži WCAG 1.4.4, dira cijeli stilski blok | 11.3 |
| **O7** | W11 — traka za hitne obavijesti i popis novosti; jedina maketa koja ne postoji | 10.3 |

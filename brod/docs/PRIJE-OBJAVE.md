# Prije objave — što se ne rješava kodom

Popis obveza koje ostaju otvorene kad je kod gotov. Nastao je iz poglavlja 9.7,
11.1, 13.4 i 14.2 Strategije.

> **Ovo nije pravni savjet.** Nacrti pravnih tekstova u `brod-web/content/pravno.json`
> napisani su da se ima od čega krenuti i **svi nose oznaku nacrta na samoj
> stranici**. Prije objave ih mora pregledati pravnik.

---

## 1. Ugovor o obradi podataka (DPA) — blokira objavu

Pogl. 9.7 kaže izrijekom: DPA s pružateljem AI usluge je **„preduvjet za
puštanje u rad"**. Ne postoji verzija u kojoj informator ide u javnost bez toga.

Što ugovor mora pokriti, prema istom poglavlju:

| Zahtjev | Zašto |
|---|---|
| **Zabrana treniranja** na razgovorima | Pogl. 9.7 to traži kao ugovornu odredbu, ne kao postavku |
| **Lokacija obrade** — prednost EU regiji | Ako nije moguće, standardne ugovorne klauzule (SCC) |
| Rokovi čuvanja kod pružatelja | Moraju biti kraći ili jednaki našima (12 mj. anonimizirano, 30 dana s kontaktom) |
| Podizvođači i obavijest o promjeni | Standardni dio DPA-a |
| Postupak u slučaju povrede podataka | Rok obavještavanja voditelja obrade |
| Brisanje na kraju ugovora | Uključujući sigurnosne kopije |

**Tko to radi:** TZ kao voditelj obrade sklapa ugovor s pružateljem. Naš je
posao dati im točan opis obrade — što se šalje, koliko često, koliko se čuva.
Taj je opis već u nacrtu politike privatnosti, u odjeljku o informatoru.

---

## 2. Što TZ mora upisati u nacrte

Sva ta mjesta su na stranicama **podebljana**, pa se vide bez traženja po kodu.

**Politika privatnosti**
- [ ] OIB Turističke zajednice
- [ ] Ime i kontakt službenika za zaštitu podataka
- [ ] Naziv pružatelja jezičnog modela (nakon odluke i potpisanog DPA-a)

**Izjava o pristupačnosti**
- [ ] Datum objave i datum zadnje revizije
- [ ] Potvrda statusa usklađenosti — nacrt kaže „djelomično", ali to je
      **samoocjena tijekom izrade**, ne vanjska ocjena
- [ ] Ime službenika za pristupačnost

---

## 3. Vanjska ocjena pristupačnosti

Interna provjera nije ocjena. Nacrt izjave to i kaže. Prije objave treba
vanjski pregled prema EN 301 549 / WCAG 2.2 AA.

Što je već ugrađeno i vjerojatno će proći: semantički HTML, skip poveznica,
fokus prsten 3 px, ciljevi dodira ≥ 44 px, `rem` jedinice, `prefers-reduced-motion`,
kontrasti provjereni po tokenu, `aria-live` na filtrima, `lang` na posuđenom tekstu.

Što neće proći bez rada: `prefers-contrast` nije podržan; karta i obrazac upita
ne postoje pa nisu ni ocijenjeni.

---

## 4. Kolačići i privola

Trenutno **nema nijednog kolačića za praćenje**, pa nema ni skočnog prozora —
i to je ispravno stanje, ne propust. Stranica o kolačićima to kaže.

Čim se doda analitika, karta ili ugrađeni video, prije toga mora doći sustav za
privolu, prema Pogl. 14.2:

- Ravnopravni gumbi **Prihvati sve** / **Odbij sve** / **Postavke** — odbijanje
  ne smije biti teže od prihvaćanja
- Nikad „nastavkom pregledavanja pristajete"
- Karte i video ne učitavaju se bez privole; umjesto njih placeholder s gumbom
- Zapis privole s vremenskom oznakom i trajna poveznica za opoziv u podnožju

---

## 5. Ostalo iz Pogl. 13.4 što još nije riješeno

| Područje | Stanje |
|---|---|
| **Sigurnosne kopije** | Nema ih. Traži se dnevno/tjedno/mjesečno uz **kvartalno testiranje vraćanja** — kopija koja nije testirana ne postoji |
| **CSP bez `unsafe-inline`** | Nije postavljen. Trenutni inline stilovi na stranicama to sprječavaju |
| **HSTS** | Postavlja se na razini hostinga |
| **Fotografije** | Nema nijedne. Prava korištenja su najčešći propust kod TZ-ova |
| **301 preusmjeravanja** | Popis starih URL-ova s `tzgsb.hr` još nije izvučen |
| **Rate limit informatora** | Radi u memoriji procesa. Preživi li deploy više instanci, treba zajedničku pohranu |

# R4 — Izvještaj o reviziji, v0.9 → v0.9.1

Dokument: `R4_Drustveno_okruzenje_Regije_I_KANONSKI_v0.9.1.docx`
Polazna verzija: `R4_Drustveno_okruzenje_Regije_I_KANONSKI_v0.9.docx` (27 str., 12 shema, bez fotografija)
Rezultat: **30 str., 20 ilustracija** — 12 izvornih shema + **8 fotografija**

**Nijedan odlomak izvornika nije obrisan ni skraćen.** Izvan natpisa ilustracija i ćelija
pregrađenoga popisa uklonjena su četiri retka — sve namjerne zamjene.

---

## 1. Revizija teksta

### 1.1 Nalaz: R4 je tekstualno najčišći od dosad pregledanih modula

Za razliku od R2 (tri nesuglasna poretka ilustracija, ćirilica usred hrvatske riječi) i R3
(ravni apostrofi, oštećena poveznica), **u R4 nisam našao nijednu činjeničnu, jezičnu ni
numeričku pogrešku.** Provjereno i potvrđeno ispravnim:

- **Numeracija ilustracija** — natpisi „Slika 1–12" slijedili su redoslijed pojavljivanja, a popis
  ilustracija na kraju odgovarao im je jedan za jedan. Renumeracija na 1–20 provedena je samo
  zbog umetnutih fotografija.
- **Kronologija mirne reintegracije** — Temeljni sporazum 12. studenoga 1995., UNTAES uspostavljen
  15. siječnja 1996., mandat završen 15. siječnja 1998. Sve točno i usklađeno s R1.
- **Unutarnja aritmetika ispitnog okvira** — pitanje vrijedi 5 bodova, prag 2,5; analitička rubrika
  zbraja 1,5 + 1,0 + 1,0 + 1,0 + 0,5 = **5,0**. Slaže se.
- **Satnica** — uvodni tekst navodi 3 + 2 + 3 + 2 sata; tablica programske satnice daje iste
  brojeve. Slaže se.
- **Svih šest domena iz popisa izvora provjereno je i vraća HTTP 200:** `podaci.dzs.hr`,
  `razvoj.gov.hr`, `narodne-novine.nn.hr`, `peacekeeping.un.org`, `unios.hr`, `azvo.hr`.
- **Tipografija** — nema dvostrukih razmaka, razmaka ispred interpunkcije, ravnih apostrofa,
  nelatiničnih znakova ni nedosljednih navodnika.
- **Svih 12 shema već je imalo alt-opise.**

### 1.2 Stvarne izmjene

| Mjesto | Izmjena | Razlog |
|---|---|---|
| `[Content_Types].xml` | dodana deklaracija tipa `jpg` | **Bez ovoga Word ne bi otvorio dokument s fotografijama.** Isti propust kao u R2 i R3. |
| Uvod u popis ilustracija | prepisan | „Svih dvanaest ilustracija izrađeno je izvorno" prestalo je biti točno. Dodana i rečenica da fotografija ilustrira vidljiv trag, ali **ne dokazuje brojčanu tvrdnju** — podatak i dalje traži pokazatelj, teritorij, razdoblje i izvor. |
| Revizijska matrica, *Jezik, vizuali i pristupačnost* | kriterij dopunjen | „kod fotografija provjeren autor, licencija, trajna poveznica i to da natpis ne sugerira brojčani zaključak". |
| Naslovnica i bilješka o statusu | → v0.9.1 | uz opis opsega revizije. |

---

## 2. Fotografska nadopuna — 8 fotografija

R4 je metodološki modul o podacima, ustanovama i postupcima, pa podnosi manje fotografija od
R1–R3. Odabir je zato uži i vezan uz mjesta gdje tekst izričito traži **vidljiv trag**.
Sve su s Wikimedia Commonsa pod CC BY ili CC BY-SA; **svih 8 poveznica vraća HTTP 200**.

| Br. | Cjelina | Motiv | Autor / licencija |
|---|---|---|---|
| 3 | R4.1 | Vinogradi u Baranji | Misalalic / CC BY-SA 4.0 |
| 4 | R4.1 | Plovilo Lučke kapetanije, Vukovar | Ex13 / CC BY-SA 3.0 |
| 8 | R4.2 | Osijek uz Dravu | Rp031 / CC BY-SA 4.0 |
| 11 | R4.3 | Muzej vučedolske kulture | Darkobilandzic / CC BY-SA 4.0 |
| 12 | R4.3 | Šetnica u Kopačkom ritu | Misalalic / CC BY-SA 4.0 |
| 15 | R4.3 | Akademija za umjetnost i kulturu, Osijek | Roko Poljak / CC BY-SA 4.0 |
| 17 | R4.4 | Stadion Gradski vrt, Osijek | IvanOS / CC BY-SA 3.0 |
| 18 | R4.4 | Vinkovačke jeseni | IvanOS / CC BY-SA 3.0 HR |

Svaka stoji uz odlomak koji je tumači: plovilo Lučke kapetanije uz temu luke i riječnog prometa,
Osijek noću uz rečenicu da najveće središte „ne opisuje iskustvo svih ruralnih, pograničnih,
brdskih i riječnih prostora", šetnica u Kopačkom ritu uz javne ustanove za zaštićena područja,
stadion uz pitanje kako je sportski prostor povezan s razvojem grada.

### Što sam namjerno izostavio i zašto

- **Demografija (R4.2) nije ilustrirana slikom „praznog sela".** Fotografija napuštene kuće ili
  zaraslog dvorišta bila bi upravo ono što tekst zabranjuje — vizualni dokaz za tvrdnju koju
  dokazuje samo pokazatelj s teritorijem i razdobljem, i pritom stereotip. Uvrštena je jedino
  neutralna snimka Osijeka, uz natpis koji ponavlja ogradu iz teksta.
- **Zgrade ustanova nacionalnih manjina u Vukovaru.** Na Commonsu postoje snimke sjedišta Saveza
  Rusina i Srpskoga doma (obje CC BY-SA 4.0) i razmatrao sam ih za temu manjinskih prava. Odustao
  sam iz dva razloga: obje su vizualno obične zgrade čije značenje nosi isključivo natpis, a izbor
  baš dviju od više manjinskih zajednica Vukovara sam po sebi je urednička poruka. Tekst već traži
  da se manjinske teme predstave „preko vlastitih ustanova, kazivača i arhiva", uz više glasova —
  to je izbor koji treba napraviti **sa zajednicama**, ne pretragom baze slika.
- **Poljoprivredna proizvodnja, drvna industrija i poduzetničke zone.** Na Commonsu nema
  upotrebljivih snimaka iz regije; pretraga vraća skenirane publikacije i službene listove.
  Uvršteni su samo vinogradi u Baranji kao poljoprivredni krajobraz.
- **Memorijalni centar Domovinskog rata Vukovar.** Nema snimke na Commonsu, a R4 tu temu ionako
  izričito prepušta zasebnom memorijalnom modulu.

### Prateće izmjene aparata

- **Popis ilustracija pregrađen** na 20 stavki redoslijedom pojavljivanja.
- **Novi prilog „Trajne poveznice na izvore fotografija"** s poveznicom i datumom preuzimanja
  (30. kolovoza 2026.).

---

## 3. Preostalo za v1.0

Sve stavke revizijske matrice ostaju otvorene. Uz njih, iz ove revizije:

1. Popuniti praznine iz odjeljka 2 — poljoprivreda, drvna industrija, luka Vukovar u pogonu,
   Memorijalni centar. Snimke zatražiti od ustanova navedenih u popisu izvora.
2. O ilustriranju manjinskih tema odlučiti **zajedno s predstavnicima zajednica**, kako traži i
   sam tekst.
3. Dopuniti pune bibliografske zapise, točne tablice/varijable i datume pristupa za DZS-ove
   skupove podataka (već traženo u v0.9).

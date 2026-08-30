# R6 — Izvještaj o reviziji, v0.9 → v0.9.1

Dokument: `R6_Vodjenje_grupa_Regije_I_KANONSKI_v0.9.1.docx`
Polazna verzija: `R6_Vodjenje_grupa_Regije_I_KANONSKI_v0.9.docx` (37 str., 12 shema, bez fotografija)
Rezultat: **41 str., 20 ilustracija** — 12 izvornih shema + **8 fotografija** + **novo poglavlje o pravima uporabe**

**Nijedan odlomak izvornika nije obrisan ni skraćen.** Uklonjena su samo dva retka — oznaka verzije
i bilješka o statusu, oboje zamijenjeni proširenim tekstom.

---

## 1. Revizija teksta

### 1.1 Nalaz: nijedna pogreška u tekstu

Kao i u R4, **nisam našao nijednu činjeničnu, jezičnu ni numeričku pogrešku.** Provjereno:

- **Numeracija ilustracija** — natpisi „Slika 1–12" slijedili su redoslijed pojavljivanja.
  Renumeracija na 1–20 provedena je samo zbog umetnutih fotografija.
- **Brojevi se slažu na svakoj razini:** tablica članka 4. ima 14 redaka, članka 5. jedanaest,
  završna kartica navodi 25 lokaliteta (14 + 11); satnica 5 × 4 = 20 sati; rubrika ima 5 kriterija
  po 1 bod = 5 uz prag 2,5; tablica klastera ima šest klastera, kako navodi i revizijska matrica.
- **Naslov na naslovnici** („Vođenje grupa na" / „zaštićenim cjelinama…") prelomljen je namjernim
  prijelomom retka — nije spojena riječ.
- **Tipografija** — nema dvostrukih razmaka, razmaka ispred interpunkcije, ravnih apostrofa ni
  nelatiničnih znakova. Navodnici `» «` korišteni su dosljedno za službene nazive spomen-obilježja
  iz Pravilnika, kao i u R5.
- **Svih 12 shema već je imalo alt-opise.**

### 1.2 Provjera tvrdnji o pravilima Parka prirode Papuk

Odlomak „PRAVILO PAPUKA KAO PRIMJER" iznosi šest konkretnih tvrdnji o pravilima Parka. Dohvatio sam
službenu stranicu Parka (`pp-papuk.hr/o-nama/pravila-parka/`) i provjerio svaku:

| Tvrdnja u R6 | Nalaz na službenoj stranici |
|---|---|
| upućivanje na označene staze | „da se pridržavaju znakova upozorenja te se kreću po naznačenim stazama" ✔ |
| pridržavanje upozorenja | isto ✔ |
| zaštita biljaka | „da ne oštećuju drveće, grmlje, ne trgaju cvijeće…" ✔ |
| zaštita životinja | „da ne plaše, uznemiruju, hvataju, love ili ubijaju bilo koju vrstu životinja" ✔ |
| zaštita voda | „da ne zagađuju vodotoke i izvore" ✔ |
| psi na povodcu | „zabranjeno je svako kretanje pasa bez povodaca" ✔ |
| posebna dozvola za komercijalno fotografiranje | „zabranjeno je snimanje i fotografiranje u komercijalne svrhe, osim uz dozvolu Parka prirode" ✔ |

**Svih sedam tvrdnji potvrđeno je doslovno.** Stranica dodatno navodi zabranu logorovanja i paljenja
vatre izvan predviđenih mjesta, zabranu kupanja u jezerima te obavijest da čuvari prirode mogu
izreći kaznu na mjestu prekršaja — to bi se moglo dodati u v1.0, ali nije pogreška da nedostaje.

- **Sve četiri poveznice u popisu izvora provjerene su i vraćaju HTTP 200:** oba propisa
  (NN 53/2026, br. 668 i 669), stranica Broja 112 Ravnateljstva civilne zaštite i pravila PP Papuk.

### 1.3 Stvarne izmjene

| Mjesto | Izmjena | Razlog |
|---|---|---|
| **Novo poglavlje „Popis ilustracija i prava uporabe"** | dodano | R6 ga, kao i R5, nije imao. Za razliku od R5, sadržaj ga ovdje nije ni najavljivao — ali sada ga imaju svi moduli R1–R6, pa je dodano radi ujednačenosti platforme. |
| **Revizijska matrica — novi redak „Vizuali i prava"** | dodan | Matrica je imala deset redaka audita, ali **nijedan za ilustracije, alt-opise ni prava uporabe** — jedini modul bez takve stavke. |
| `[Content_Types].xml` | dodan tip `jpg` | **Bez ovoga Word ne bi otvorio dokument s fotografijama.** Peti put zaredom (R2–R6). |
| Naslovnica i bilješka o statusu | → v0.9.1 | uz opis opsega revizije. |

Uvodni tekst novoga poglavlja nosi ogradu specifičnu za R6: *fotografija ilustrira uvjet izvedbe,
ali ne zamjenjuje procjenu na licu mjesta* — stanje staze, kapacitet, režim i dopuštenje provjeravaju
se kod upravitelja neposredno prije svake izvedbe.

---

## 2. Fotografska nadopuna — 8 fotografija

R6 uči upravljanje skupinom u tri obvezna terenska konteksta, pa je svaka fotografija odabrana kao
prikaz **operativnog uvjeta**, ne lokaliteta kao znamenitosti. Sve su s Wikimedia Commonsa;
**svih 8 poveznica vraća HTTP 200**.

| Br. | Kontekst | Motiv i operativna poanta | Autor / licencija |
|---|---|---|---|
| 3 | otvoreni teren | Ružica grad — razmak, tempo i procjena podloge | 1vilenjak / CC BY-SA 4.0 |
| 4 | memorijalno | Vukovarski vodotoranj — tišina, tempo, nenametljiv izlaz | Monument Hunter / CC BY-SA 4.0 |
| 5 | urbano | Gradska vrata osječke Tvrđe — uska dionica, formacija | Pudelek / CC BY-SA 4.0 |
| 9 | zatvoreno/sakralno | Unutrašnjost đakovačke katedrale — razmjeri i odjek | Pudelek / CC BY-SA 4.0 |
| 11 | zatvoreno/sakralno | Čazma — vanjski prostor kao mjesto čekanja i rezervne postaje | Pezonada / CC BY-SA 4.0 |
| 12 | priroda | Staza kroz trstik, Kopački rit — jednoredno kretanje | Antimuonium / CC BY-SA 4.0 |
| 14 | priroda | Papuk iz zraka — razmjeri područja i označene staze | Gpavic / javno vlasništvo |
| 15 | priroda / voda | Drvena šetnica nad vodom — kapacitet i rub | Misalalic / CC BY-SA 4.0 |

Fotografije stoje točno uz odlomak koji ih tumači: gradska vrata uz pravilo da se sadržaj zaustavlja
prije uske dionice, katedralna unutrašnjost uz zabranu da se akustika koristi kao izgovor za
preglasan govor, staza kroz trstik uz pravilo o nenapuštanju staze, a Papuk uz „PRAVILO PAPUKA".

---

## 3. Zapažanje o prijelomu

**Stranica 6 u dokumentu je prazna.** Provjerio sam izvornik — prazna je i ondje, dakle riječ je o
postojećem prijelomu stranice prije poglavlja „Terenski dosje", a ne o posljedici ove revizije.
Nisam ga dirao jer se prijelomi u Wordu i LibreOfficeu ne moraju prelamati jednako; **preporučujem
provjeru pri završnom prijelomu za v1.0.**

## 4. Preostalo za v1.0

Sve stavke revizijske matrice ostaju otvorene, uključujući novi redak za vizuale. Uz njih:

1. Razmotriti dopunu odlomka o Papuku zabranom logorovanja i kupanja te ovlašću čuvara prirode.
2. Ukloniti praznu stranicu pri završnom prijelomu (odjeljak 3).
3. Provesti terenski pilot u sva tri konteksta s dvije simulacije, kako traži i sama matrica.

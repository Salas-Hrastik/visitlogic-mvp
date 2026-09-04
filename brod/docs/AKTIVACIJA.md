# Prototip TZ Slavonski Brod — od prototipa do sjedišta na serveru TZ-a

Dokument opisuje (1) što je isporučeno u ovom projektu, (2) kako prototip
odmah pokazati naručitelju i (3) što konkretno treba za **aktivaciju na serveru
Turističke zajednice grada Slavonskog Broda**.

Postavljanje samog projekta — lokalno pokretanje, objava na Vercelu, izdvajanje
u samostalan repozitorij — opisano je u [`../README.md`](../README.md).

---

## 1. Što je isporučeno

| Putanja | Što je |
|---------|--------|
| `index.html` | Prototip web sjedišta — jedna samostalna datoteka (~2.900 linija, 188 KB) |
| `vercel.json` | `noindex`, `no-cache` i osnovna sigurnosna zaglavlja |
| `robots.txt` | `Disallow: /` — cijeli projekt izvan tražilica |
| `scripts/izdvoji-repozitorij.sh` | Izdvajanje u samostalan repozitorij, s poviješću |
| `PROCITAJME.txt` | Izvorna uputa autora prototipa |

### Jedina promjena na samom prototipu

U izvornoj datoteci `<title>`, Google Fonts `<link>`-ovi i cijeli `<style>` blok
nalazili su se **iza** `<body>`, a `</head>` je bio zatvoren odmah nakon `<meta>`
oznaka. Preglednici to toleriraju, ali stil se primjenjuje kasno (vidljiv bljesak
nestilizirane stranice) i validator javlja grešku. U `index.html` ti su blokovi
vraćeni u `<head>`.

**Sadržaj je inače bajt-za-bajt identičan izvorniku** — provjereno `diff`-om.
Render je testiran u headless Chromiumu: nema JS grešaka, svi ekrani se crtaju.

---

## 2. Kako prototip odmah pokazati naručitelju

Prototip je zaseban projekt s vlastitim URL-om — postavljanje je u
[`../README.md`](../README.md), a rezultat je npr.:

```
https://tz-slavonski-brod-prototip.vercel.app
```

To je dovoljno za sastanak s TZ-om: nema instalacije, radi na mobitelu, a
`noindex` + `robots.txt` sprječavaju da se pojavi u Googleu. Za prezentaciju
užem krugu uključite **Deployment Protection → Password Protection**.

Projekt je namjerno odvojen od valpovskog: prototip za Slavonski Brod ne
poslužuje se s domene TZ-a Valpovo.

### Prezentacijski savjet

Gornja crna traka („Prototip", prekidač Mobitel/Desktop, izbornik ekrana) namijenjena je
**vama**, ne naručitelju. Kad prototip predajete TZ-u na samostalno razgledavanje,
najavite čemu služi — inače je dio ljudi doživi kao dio dizajna sjedišta.

---

## 3. Ključna razlika: prototip nije web sjedište

Ovo treba jasno reći TZ-u prije nego se dogovori „aktivacija", jer inače nastaje
nesporazum oko opsega posla. Prototip **izgleda** kao gotovo sjedište, ali:

| Funkcija | U prototipu | Za produkciju treba |
|----------|-------------|---------------------|
| Sadržaj (događanja, smještaj, atrakcije) | Zapisan u JavaScriptu, demo podaci | CMS ili baza + uredničko sučelje |
| Obrazac upita smještaju | Validira polja, **ništa ne šalje** | Backend + slanje e-pošte + antispam |
| Newsletter prijava | Samo poruka na ekranu | Servis (Mailchimp/Brevo) + privola |
| „Pitaj Brod" (AI informator) | ~7 ključnih riječi, `if/else` u pregledniku | Pravi jezični model na serveru |
| Jezici HR/EN/DE | Prijevodi upisani u kod | Prijevodi kao dio CMS-a |
| Karta | Nacrtani SVG, nije prava karta | OSM/Leaflet ili Google Maps |
| Fotografije | Generirani SVG motivi | Fotografije destinacije s pravima korištenja |

**Preporuka za redoslijed:** prvo dogovoriti *sadržaj i tko ga održava*, tek
onda tehnologiju. Sjedište koje nitko ne ažurira izgleda gore od starog.

---

## 4. Tri puta aktivacije na serveru TZ-a

Prije odabira treba znati **što TZ danas ima**. Pitanja za njihovog IT-jevca ili
dosadašnjeg izvođača:

1. Tko drži domenu `tzgsb.hr` i tko ima pristup DNS zapisima?
2. Kakav je hosting — klasični (cPanel/Plesk, FTP) ili nešto drugo?
3. Radi li postojeće sjedište na WordPressu? Koja verzija?
4. Postoji li ugovor o održavanju i s kim?

### Put A — statički prototip na postojeći hosting (najbrže, za demo)

Ako TZ ima klasični hosting, prototip je jedna datoteka i ide izravno:

```
public_html/
└── prototip/
    ├── index.html      ← index.html iz ovog projekta
    └── .htaccess
```

`.htaccess` koji zaključava demo lozinkom i drži ga izvan tražilica:

```apache
Header set X-Robots-Tag "noindex, nofollow"
AuthType Basic
AuthName "Prototip TZ Slavonski Brod"
AuthUserFile /home/<korisnik>/.htpasswd
Require valid-user
```

Datoteku `.htpasswd` generira hosting kroz cPanel („Directory Privacy").
Rezultat: `https://tzgsb.hr/prototip/` — vidljivo samo onima kojima date pristup.

**Za što je dobro:** interna prezentacija, dogovor s Turističkim vijećem.
**Za što nije:** ovo i dalje nije sjedište — sadržaj se ne može uređivati.

### Put B — poddomena uz postojeće sjedište (preporučeno za razvoj)

Novo sjedište se gradi na `novo.tzgsb.hr` dok staro radi na `tzgsb.hr`.
Zamjena je onda jedna promjena DNS-a, bez rizika od pada u sezoni.

DNS zapis kod registrara domene:

```
novo    CNAME   cname.vercel-dns.com.        (ako se hosta na Vercelu)
novo    A       <IP adresa servera TZ-a>      (ako se hosta kod njih)
```

Propagacija do 24 h, obično 15–60 min. HTTPS certifikat: Let's Encrypt je
besplatan i automatski i na Vercelu i na svakom cPanel hostingu (AutoSSL).

**Kad se prelazi na `tzgsb.hr`:** obavezno 301 preusmjeravanja sa starih URL-ova
na nove, inače TZ gubi Google pozicije koje ima godinama. Popis starih URL-ova
izvucite iz Google Search Consolea prije gašenja.

### Put C — puna produkcija

Ovdje se odlučuje između dva pristupa:

| | WordPress | „Headless" (statički generator + CMS) |
|---|---|---|
| Uređivanje sadržaja | Poznato većini djelatnika | Treba kratka obuka |
| Hosting | Bilo koji hrvatski hosting | Vercel/Netlify (besplatna razina dostaje) |
| Sigurnost | Traži redovito ažuriranje | Gotovo bez napadne površine |
| Brzina | Ovisi o temi i dodacima | Vrlo brzo |
| Cijena održavanja | Niža ulazna, viša trajna | Viša ulazna, niža trajna |
| Rizik | Napušteni dodaci, ranjivosti | Ovisnost o izvođaču |

Za TZ bez stalnog IT-a **WordPress s dobro postavljenom temom obično je
realnija odluka** — jer ga mogu održavati i bez vas. Dizajn i logika iz ovog
prototipa prenose se u WP temu; prototip tada služi kao specifikacija.

---

## 5. Obveze koje se lako previde (a TZ je javno tijelo)

### Pristupačnost

Turističke zajednice su tijela javnog sektora, pa se na njih primjenjuje
**Zakon o pristupačnosti mrežnih stranica i programskih rješenja za pokretne
uređaje tijela javnog sektora (NN 17/19)**, koji provodi EU direktivu 2016/2102.
To znači:

- usklađenost s **EN 301 549 / WCAG 2.1 razina AA**
- objavljena **Izjava o pristupačnosti** s kontaktom za pritužbe
- povratna veza prema Povjereniku za informiranje

Prototip je u ovom pogledu dobro postavljen (`skip` link, `aria` oznake,
`sr` klasa za čitače ekrana, kontrasti, tamna tema, `min-height:46px` na
gumbima). To treba **zadržati pri prelasku u WordPress temu** — većina gotovih
tema to izgubi.

### Zaštita podataka

- **Google Fonts se učitava s Googleovog CDN-a.** Time se IP adresa posjetitelja
  šalje Googleu bez privole. Njemački sud (LG München I, 3 O 17493/20) presudio
  je da je to povreda GDPR-a, a AZOP-ova praksa ide u istom smjeru. **Rješenje:**
  skinuti Archivo i Public Sans i posluživati ih s vlastitog servera
  (`@font-face`). Trajanje: pola sata. Napravit ću ako želite.
- Obrazac upita traži ime, e-poštu i telefon → treba **izjava o privatnosti**,
  pravna osnova obrade i rok čuvanja.
- Prototip koristi `localStorage` („Moj plan"). To je funkcionalna pohrana i ne
  traži cookie banner, ali treba biti navedeno u izjavi o privatnosti.

### Sadržaj

- Fotografije: pisana dozvola autora ili kupljena licenca. Ovo je najčešći
  propust kod TZ-ova.
- Radna vremena i cijene: u prototipu piše da su demo. Prije objave svaki
  podatak treba potvrditi s objektom — netočno radno vrijeme je pritužba.
- Kontakt u prototipu (`+385 35 447 721`, `info@tzgsb.hr`) provjeriti kod TZ-a.

---

## 6. „Pitaj Brod" — što bi zapravo trebalo

Ovo je dio koji TZ najviše zanima, pa ga vrijedi razdvojiti od ostatka.

Prototip prepoznaje sedam tema (vikend, hrana, 2 sata, parking, vlak/bicikl,
tvrđava, smještaj) i na sve ostalo pošteno kaže da nema odgovor te upućuje na
Centar za posjetitelje. To je dobra demonstracija ponašanja, ali nije AI.

**Za pravu verziju već postoji provjeren obrazac** — turistički informator za
Valpovo, u repozitoriju `visitlogic-mvp` iz kojeg je ovaj projekt izdvojen:

| Sloj | Datoteka u valpovskom repozitoriju | Uloga |
|------|------------------------------|-------|
| Baza znanja | `api/_database.js` | Ručno održavan, provjeren sadržaj |
| Automatski sadržaj | `scripts/scrape-valpovo.js` → `api/_scraped_content.js` | Dnevno dohvaćanje događanja s gradskih stranica |
| Odgovaranje | `api/chat.js` | Odabir konteksta + jezični model |
| Sučelje | `voice.html`, `index.html` | Chat, glasovni unos |

Isti pristup za Slavonski Brod znači: baza znanja o Brodu, dnevno skrapiranje
događanja s `tzgsb.hr` i gradskih izvora, te odgovaranje uz **obavezno navođenje
izvora** — kao što prototip već radi kroz „sources".

Dvije stvari koje treba unaprijed dogovoriti s TZ-om:

1. **Trošak.** Poziv prema modelu se plaća po upitu. Za TZ-ov promet to je
   redovito nekoliko eura mjesečno, ali treba postaviti dnevni limit da
   automatizirani promet ne napravi račun.
2. **Odgovornost za odgovor.** Model može pogriješiti. Zato: odgovara samo iz
   vlastite baze, navodi izvor, i kad ne zna — kaže da ne zna i daje telefon.
   Prototip to već ispravno radi i tu logiku treba zadržati.

---

## 7. Popis za provjeru prije aktivacije

**Prije prezentacije TZ-u**
- [ ] Prototip dostupan na URL-u koji se otvara i na mobitelu
- [ ] Objašnjeno što traka „Prototip" znači i da su podaci demo
- [ ] Pripremljena razlika prototip / sjedište (poglavlje 3)

**Prije potpisa posla**
- [ ] Odgovori na četiri pitanja iz poglavlja 4
- [ ] Odluka WordPress ili headless
- [ ] Dogovoreno **tko u TZ-u održava sadržaj** i koliko sati mjesečno
- [ ] Riješena prava na fotografije

**Prije puštanja u rad**
- [ ] Google Fonts poslužen s vlastitog servera
- [ ] Izjava o pristupačnosti objavljena
- [ ] Izjava o privatnosti objavljena
- [ ] HTTPS aktivan, HTTP → HTTPS preusmjeren
- [ ] 301 preusmjeravanja sa starih URL-ova
- [ ] Obrasci stvarno šalju e-poštu (testirano na tri adrese)
- [ ] Svi kontakti, radna vremena i cijene provjereni kod izvora
- [ ] Google Search Console i analitika postavljeni
- [ ] Dogovoreno tko plaća domenu i hosting i kada ističu
- [ ] Sigurnosna kopija starog sjedišta prije zamjene

---

## 8. Što mogu napraviti sljedeće

Recite koje od ovoga treba i nastavljam:

1. ~~Odvojiti prototip u zaseban projekt~~ — napravljeno, vidi `../README.md`
2. Zamijeniti Google Fonts vlastito posluženim fontovima
3. Napisati nacrt Izjave o pristupačnosti i Izjave o privatnosti
4. Spojiti obrazac upita na stvarno slanje e-pošte
5. Zamijeniti „Pitaj Brod" pravim informatorom po uzoru na Valpovo
6. Izvući sadržaj iz JavaScripta u `JSON` — prvi korak prema CMS-u
7. Pripremiti ponudu s opsegom i procjenom sati za TZ

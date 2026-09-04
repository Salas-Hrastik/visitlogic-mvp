# Brod na Savi — prototip web sjedišta TZ grada Slavonskog Broda

Interaktivni prototip web sjedišta Turističke zajednice grada Slavonskog Broda.
Samostalan projekt: nema ovisnosti, nema koraka izgradnje, nema poslužiteljskog
dijela — jedna HTML datoteka koja se otvara dvoklikom ili poslužuje kao statička
stranica.

> **Ovo nije službeno sjedište TZ-a.** Nazivi mjesta, ustanova i manifestacija su
> stvarni; termini su primjeri, a smještajni i ugostiteljski objekti te cijene su
> demo podaci. Prototip se ne smije indeksirati niti objaviti kao javno sjedište.

---

## Sadržaj projekta

| Putanja | Što je |
|---------|--------|
| `index.html` | Cijeli prototip — 14 ekrana, HR/EN/DE, ~2.900 linija |
| `fonts/` | Archivo i Public Sans (woff2) + licence SIL OFL 1.1 |
| `vercel.json` | Zaglavlja: `noindex`, `no-cache`, osnovna sigurnosna zaglavlja |
| `robots.txt` | `Disallow: /` — cijeli projekt izvan tražilica |
| `docs/AKTIVACIJA.md` | Put od prototipa do sjedišta na serveru TZ-a |
| `docs/USKLADENOST-SA-STRATEGIJOM.md` | Provjera prototipa prema Strategiji (v1.0, 31. 8. 2026.) |
| `scripts/izdvoji-repozitorij.sh` | Izdvajanje mape u samostalan repozitorij |
| `PROCITAJME.txt` | Izvorna uputa autora prototipa |

## Pokretanje lokalno

Najjednostavnije — dvoklik na `index.html`. Sve radi i s `file://` protokolom.

Za poslužitelj (bliže produkciji, čisti URL-ovi):

```bash
python3 -m http.server 8080      # pa http://localhost:8080
# ili
npx --yes serve . -l 8080
```

Prototip ne šalje **nijedan** vanjski zahtjev — fontovi se poslužuju iz mape
`fonts/`, pa izgleda jednako i bez internetske veze.

## Što isprobati

- Gornja crna traka: prekidač **Mobitel / Desktop**, tamna tema, izbornik za skok
  na bilo koji od 14 ekrana, gumb **Što je ovo?**
- **Kalendar događanja** — filtri po datumu, tipu, cijeni i publici
- **Brodsko kolo → Pogledaj smještaj** — datumi se prenose u katalog
- **Obrazac upita** — probajte odlazak prije dolaska (validacija)
- Promjena jezika na **English** ili **Deutsch**
- **Pitaj Brod** — zadnje predloženo pitanje pokazuje što se događa kad
  informator nema odgovor

Traka „Prototip" na vrhu namijenjena je vama, ne naručitelju. Kad prototip
predajete TZ-u na samostalno razgledavanje, najavite čemu služi — inače je dio
ljudi doživi kao dio dizajna sjedišta.

---

## Objava na Vercelu kao zaseban projekt

Prototip trenutno živi u mapi `brod/` unutar repozitorija `visitlogic-mvp`
(valpovski chatbot), ali se **ne poslužuje s valpovske domene** — korijenski
`.vercelignore` ga isključuje iz tog deploya.

Za vlastiti URL, bez izdvajanja repozitorija:

1. Vercel → **Add New… → Project** → isti repozitorij `visitlogic-mvp`
2. **Root Directory** → `brod`
3. **Framework Preset** → `Other` (bez naredbe izgradnje, bez izlazne mape)
4. Deploy

Rezultat je npr. `https://tz-slavonski-brod-prototip.vercel.app` — odvojeno od
valpovskog projekta, s vlastitim postavkama i pristupima.

Ako prototip treba pokazati samo određenim ljudima, u postavkama projekta
uključite **Deployment Protection → Password Protection**. Za nižu razinu
zaključavanja poslužit će i `.htaccess` na klasičnom hostingu — opisano u
`docs/AKTIVACIJA.md`.

## Izdvajanje u samostalan repozitorij

Kad prototip treba potpuno odvojiti — primjerice zato što se predaje TZ-u ili
drugom izvođaču — mapa se izdvaja **s poviješću**:

```bash
bash brod/scripts/izdvoji-repozitorij.sh
```

Skripta stvara granu `brod-samostalno` čiji je korijen sadržaj mape `brod/`,
ništa ne gura na daljinski repozitorij i na kraju ispiše naredbe za `push` te
za uklanjanje mape iz valpovskog repozitorija.

---

## Dalje

Prototip **nije** web sjedište: obrasci ništa ne šalju, sadržaj je zapisan u
JavaScriptu, a „Pitaj Brod" prepoznaje sedam tema kroz `if/else` u pregledniku.
Što točno nedostaje za produkciju, koji su putovi aktivacije na serveru TZ-a i
koje obveze vrijede za TZ kao tijelo javnog sektora — u
[`docs/AKTIVACIJA.md`](docs/AKTIVACIJA.md).

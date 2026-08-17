# visitlogic-mvp — Turistički chatbot za grad Valpovo

## KRITIČNO ZA AI AGENTE — NE MODIFICIRAJ BEZ EKSPLICITNE UPUTE

Ovaj repozitorij je turistički chatbot za **grad Valpovo** (Slavonija, Hrvatska).

### Zaštićene datoteke

| Datoteka | Opis | Status |
|----------|------|--------|
| `api/chat.js` | **Valpovo** handler (~700 linija) | 🔒 NE ZAMJENJUJ |
| `api/_database.js` | Baza podataka za Valpovo | 🔒 NE MODIFICIRAJ bez upute |
| `voice.html` | Frontend chatbot UI za Valpovo | 🔒 NE MODIFICIRAJ bez upute |

### Pozadina projekta

Repozitorij je inicijalno kloniran iz Biograd-na-Moru prototioa (stari handler: ~72 linije, plaže, statički odgovori).
**Cijeli handler je prebrisan i zamijenjen Valpovo verzijom.**
Stara Biograd logika (plaže, `biograd_clean` database) ne postoji u aktivnoj verziji.

### api/chat.js — što se smije / ne smije

- ✅ Uređivanje postojeće logike (dodavanje kategorija, pre-gen blokova, system prompt)
- ✅ Dodavanje novih ključnih riječi u `getRelevantContext()`
- ❌ Zamjena cijelog fajla s Biograd/beach/old prototipom
- ❌ Spajanje s `biograd_clean` ili `beaches` bazom
- ❌ Brisanje Valpovo handlera i zamjena s 42-linijskim prototipom

### Prepoznaj ispravnu verziju

Ispravna `api/chat.js` počinje ovako:
```js
import OpenAI from "openai";
import { db } from "./_database.js";
```
i ima ~700 linija.

**Pogrešna (Biograd) verzija** ima ~42-72 linije i sadrži: `beaches`, `biograd`, statički odgovor "Greška u komunikaciji sa serverom".

Ako vidiš kratku verziju u repozitoriju — odmah vrati ispravnu s: `git checkout <zadnji ispravni commit> -- api/chat.js`

## Događanja (prošla / u tijeku / buduća)

Bot zna odgovoriti na upite o **prošlim, tekućim i budućim** događanjima. Tok podataka:

| Korak | Datoteka | Napomena |
|-------|----------|----------|
| 1. Dohvat | `scripts/scrape-valpovo.js` | dnevno via `.github/workflows/scrape-valpovo.yml` |
| 2. Pohrana | `api/_scraped_content.js` | AUTO-GENERATED — ne uređivati ručno |
| 3. Prikaz | `api/chat.js` | `klasificirajDogadanja()` + pre-gen blok |

### Izvori događanja

- **valpovo.hr** — Modern Events Calendar: `/wp-json/wp/v2/mec-events` daje popis (i prošlih)
  događaja, a datum se čita sa stranice događaja (`.mec-start-date-label`, npr. `"29. 08. 2026."`
  ili `"03. - 05. 07. 2026."`). Ovo je najpouzdaniji izvor datuma.
- **tz.valpovo.hr** — objave (`/wp-json/wp/v2/posts`); datum se izvlači iz teksta hrvatskim
  parserom (`parseDatesFromText`) — npr. "u subotu, 29. kolovoza 2026.", "24. i 25. srpnja",
  "od 22. do 28. lipnja".

Kod dupliranih naslova prednost ima `valpovo.hr` (strukturirani datum); TZ link se čuva kao `link_alt`.

### Ključno pravilo

`api/_scraped_content.js` sadrži **samo ISO datume** (`datum_od` / `datum_do`).
Status *prošlo / u tijeku / nadolazeće* računa se **u trenutku upita** u `api/chat.js`
(`klasificirajDogadanja()`) — nikad se ne zapisuje u skrapiranu datoteku, jer bi zastario
između dva pokretanja scrapera.

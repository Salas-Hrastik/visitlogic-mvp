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

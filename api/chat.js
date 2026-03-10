import OpenAI from "openai";
import { db } from "./_database.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ukloni IMAGE_URL polja iz konteksta — AI ih ne treba, samo povećavaju tokene
function stripImages(data) {
  if (Array.isArray(data)) return data.map(stripImages);
  if (data && typeof data === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(data)) {
      if (k === 'IMAGE_URL') continue;
      out[k] = stripImages(v);
    }
    return out;
  }
  return data;
}

const CATEGORY_CONTEXTS = {
  smjestaj:     (db) => ({ grad: db.grad, smjestaj: db.smjestaj }),
  gastronomija: (db) => ({ grad: db.grad, gastronomija: db.gastronomija }),
  dogadanja:    (db) => ({ grad: db.grad, dogadanja: db.dogadanja }),
  znamenitosti: (db) => ({ grad: db.grad, znamenitosti: db.znamenitosti }),
  sport:        (db) => ({ grad: db.grad, sport: db.sport }),
  kupovina:     (db) => ({ grad: db.grad, kupovina: db.kupovina }),
  opcenito:     (db) => ({ grad: db.grad, opcenito: db.opcenito }),
  benzinske:    (db) => ({ grad: db.grad, benzinske_stanice: db.usluge.benzinske_stanice }),
  frizeraji:    (db) => ({ grad: db.grad, frizeraji: db.usluge.frizeraji }),
  parking:      (db) => ({ grad: db.grad, parkiralista: db.usluge.parkiralista }),
  usluge:       (db) => ({ grad: db.grad, usluge: db.usluge }),
  priroda:      (db) => ({ grad: db.grad, priroda: db.priroda }),
  okolica:      (db) => ({ grad: db.grad, okolica: db.okolica }),
};

const MONTH_MAP = {
  'Siječanj':1,'Veljača':2,'Ožujak':3,'Travanj':4,'Svibanj':5,'Lipanj':6,
  'Srpanj':7,'Kolovoz':8,'Rujan':9,'Listopad':10,'Studeni':11,'Prosinac':12
};

function eventMaxMonth(vrijeme) {
  const months = (vrijeme || '').split('/').map(p => MONTH_MAP[p.trim()]).filter(Boolean);
  return months.length ? Math.max(...months) : 12;
}

// Vrati { context, category } — category se pamti i šalje nazad klijentu
function getRelevantContext(message, db, lastCategory) {
  const msg = message.toLowerCase();

  // HR + EN + DE ključne riječi
  if (msg.includes('povijest') || msg.includes('histori') || msg.includes('osnovan') || msg.includes('općenito') || msg.includes('o gradu') || msg.includes('o valpovu') || msg.includes('stanovic') || msg.includes('stanovništv') || msg.includes('naselje') || msg.includes('geografij') || msg.includes('gospodarsk') || msg.includes('industrij') || msg.includes('poznat') || msg.includes('zanimljiv') || msg.includes('iovallium') || msg.includes('prandau') || msg.includes('rimsk') || msg.includes('osmansk') || msg.includes('gradonačelnik') || msg.includes('udaljenost')
    // EN
    || msg.includes('history') || msg.includes('about') || msg.includes('general') || msg.includes('population') || msg.includes('founded') || msg.includes('tell me about') || msg.includes('what is valpovo') || msg.includes('economy') || msg.includes('industry') || msg.includes('famous')
    // DE
    || msg.includes('geschichte') || msg.includes('über') || msg.includes('einwohner') || msg.includes('gegründet') || msg.includes('wirtschaft'))
    return { context: CATEGORY_CONTEXTS.opcenito(db), category: 'opcenito' };

  if (msg.includes('smještaj') || msg.includes('smjestaj') || msg.includes('hotel') || msg.includes('noćen') || msg.includes('nocen') || msg.includes('apartman') || msg.includes('sobe') || msg.includes('soba') || msg.includes('sob ') || msg.includes('villa') || msg.includes('ruralni') || msg.includes('seoski') || msg.includes('seosk') || msg.includes('gospodarstv') || msg.includes('farma') || msg.includes('agro') || msg.includes('prenoćiš') || msg.includes('prenocis') || msg.includes('prenoćišt') || msg.includes('privatni smještaj') || msg.includes('iznajm')
    // EN
    || msg.includes('accommodation') || msg.includes('sleep') || msg.includes('stay') || msg.includes('room') || msg.includes('bed') || msg.includes('lodge') || msg.includes('hostel') || msg.includes('farm stay') || msg.includes('rural')
    // DE
    || msg.includes('unterkunft') || msg.includes('schlafen') || msg.includes('übernacht') || msg.includes('zimmer') || msg.includes('bauernhof'))
    return { context: CATEGORY_CONTEXTS.smjestaj(db), category: 'smjestaj' };

  if (msg.includes('jelo') || msg.includes('restoran') || msg.includes('hrana') || msg.includes('pizza') || msg.includes('burger') || msg.includes('jesti') || msg.includes('ručati') || msg.includes('ručak') || msg.includes('večerati') || msg.includes('večera') || msg.includes('doručak') || msg.includes('kafić') || msg.includes('kava') || msg.includes('bar') || msg.includes('ugostit') || msg.includes('radno vrij') || msg.includes('kada radi') || msg.includes('do kada rad') || msg.includes('od kada rad') || msg.includes('radi li') || msg.includes('je li otvor') || msg.includes('opening hours') || msg.includes('what time') || msg.includes('öffnungszeiten') || msg.includes('geöffnet')
    // EN
    || msg.includes('restaurant') || msg.includes('food') || msg.includes('eat') || msg.includes('dinner') || msg.includes('lunch') || msg.includes('breakfast') || msg.includes('cafe') || msg.includes('coffee') || msg.includes('drink') || msg.includes('where to eat') || msg.includes('place to eat')
    // DE
    || msg.includes('essen') || msg.includes('speise') || msg.includes('trinken') || msg.includes('café') || msg.includes('gaststätte') || msg.includes('mittagessen') || msg.includes('abendessen'))
    return { context: CATEGORY_CONTEXTS.gastronomija(db), category: 'gastronomija' };

  if (msg.includes('događ') || msg.includes('dogad') || msg.includes('festival') || msg.includes('manifestac') || msg.includes('karneval') || msg.includes('advent') || msg.includes('program') || msg.includes('što se dešava') || msg.includes('što se događa') || msg.includes('sto se desava') || msg.includes('slijede') || msg.includes('uskoro')
    // Specifične manifestacije valpovštine
    || msg.includes('fišijad') || msg.includes('fisijad') || msg.includes('matijafest') || msg.includes('rockaraj') || msg.includes('reunited') || msg.includes('vašar') || msg.includes('vasar') || msg.includes('ljeto valpov') || msg.includes('craft beer') || msg.includes('staza zdravlja') || msg.includes('katančić') || msg.includes('festival sira') || msg.includes('ribljeg paprikaša') || msg.includes('ribljeg paprikasa') || msg.includes('kuhanje fiš') || msg.includes('kuhanje fis')
    // EN
    || msg.includes('event') || msg.includes('events') || msg.includes('carnival') || msg.includes('celebration') || msg.includes('upcoming') || msg.includes('what\'s on')
    // DE
    || msg.includes('veranstaltung') || msg.includes('fest') || msg.includes('feier') || msg.includes('kommende'))
    return { context: CATEGORY_CONTEXTS.dogadanja(db), category: 'dogadanja' };

  if (msg.includes('znamenitost') || msg.includes('dvorac') || msg.includes('muzej') || msg.includes('kula') || msg.includes('katančić') || msg.includes('posjet') || msg.includes('vidjeti') || msg.includes('vidjet') || msg.includes('razgled') || msg.includes('što ima') || msg.includes('sto ima')
    // EN
    || msg.includes('attraction') || msg.includes('sightseeing') || msg.includes('castle') || msg.includes('museum') || msg.includes('monument') || msg.includes('visit') || msg.includes('landmark') || msg.includes('sight') || msg.includes('what to see') || msg.includes('things to see')
    // DE
    || msg.includes('sehenswürdigkeit') || msg.includes('burg') || msg.includes('schloss') || msg.includes('museum') || msg.includes('besichtigung') || msg.includes('was gibt es'))
    return { context: CATEGORY_CONTEXTS.znamenitosti(db), category: 'znamenitosti' };

  if (msg.includes('sport') || msg.includes('tenis') || msg.includes('nogomet') || msg.includes('futsal') || msg.includes('rukomet') || msg.includes('odbojka') || msg.includes('košark') || msg.includes('karate') || msg.includes('fitness') || msg.includes('teretana') || msg.includes('stadion') || msg.includes('klub') || msg.includes('sportska rekreacij')
    // EN
    || msg.includes('tennis') || msg.includes('football') || msg.includes('soccer') || msg.includes('handball') || msg.includes('volleyball') || msg.includes('basketball') || msg.includes('gym') || msg.includes('stadium') || msg.includes('sports club')
    // DE
    || msg.includes('tennis') || msg.includes('fußball') || msg.includes('handball') || msg.includes('volleyball') || msg.includes('basketball') || msg.includes('fitnessstudio') || msg.includes('stadion') || msg.includes('verein'))
    return { context: CATEGORY_CONTEXTS.sport(db), category: 'sport' };

  if (msg.includes('kupin') || msg.includes('kupovat') || msg.includes('shopping') || msg.includes('trgovin') || msg.includes('supermarket') || msg.includes('dućan') || msg.includes('suveniri') || msg.includes('market') || msg.includes('agropark')
    || msg.includes('cipel') || msg.includes('obuć') || msg.includes('odjeć') || msg.includes('moda') || msg.includes('haljin') || msg.includes('hlač') || msg.includes('košulj') || msg.includes('namještaj') || msg.includes('kozmetik') || msg.includes('drogerij') || msg.includes('med') || msg.includes('sir') || msg.includes('tržnic')
    // EN
    || msg.includes('shop') || msg.includes('store') || msg.includes('buy') || msg.includes('souvenir') || msg.includes('market') || msg.includes('mall') || msg.includes('grocery') || msg.includes('shoes') || msg.includes('clothes') || msg.includes('clothing') || msg.includes('fashion') || msg.includes('furniture') || msg.includes('cosmetics')
    // DE
    || msg.includes('einkaufen') || msg.includes('einkauf') || msg.includes('laden') || msg.includes('souvenir') || msg.includes('markt') || msg.includes('kaufen') || msg.includes('schuhe') || msg.includes('kleidung') || msg.includes('möbel'))
    return { context: CATEGORY_CONTEXTS.kupovina(db), category: 'kupovina' };

  if (msg.includes('benzin') || msg.includes('goriv') || msg.includes('pumpa')
    // EN
    || msg.includes('gas station') || msg.includes('petrol') || msg.includes('fuel')
    // DE
    || msg.includes('tankstelle') || msg.includes('benzin') || msg.includes('kraftstoff'))
    return { context: CATEGORY_CONTEXTS.benzinske(db), category: 'benzinske' };

  if (msg.includes('frizer') || msg.includes('brica') || msg.includes('kozmet') || msg.includes('salon') || msg.includes('barber')
    // EN
    || msg.includes('hairdresser') || msg.includes('haircut') || msg.includes('barber') || msg.includes('beauty salon')
    // DE
    || msg.includes('friseur') || msg.includes('frisör') || msg.includes('haarschnitt'))
    return { context: CATEGORY_CONTEXTS.frizeraji(db), category: 'frizeraji' };

  if (msg.includes('parking') || msg.includes('parkir')
    // EN (parking is same)
    // DE
    || msg.includes('parken') || msg.includes('parkplatz'))
    return { context: CATEGORY_CONTEXTS.parking(db), category: 'parking' };

  if (msg.includes('ljekar') || msg.includes('banka') || msg.includes('bankomat') || msg.includes('taksi') || msg.includes('taxi') || msg.includes('autobus') || msg.includes('uslug')
    // Auto servisi
    || msg.includes('auto servis') || msg.includes('autoservis') || msg.includes('servis auta') || msg.includes('popravak auta') || msg.includes('popravit auto') || msg.includes('popraviti auto') || msg.includes('mehanik') || msg.includes('automehanik') || msg.includes('vulkan') || msg.includes('vulkanizer') || msg.includes('autolimar') || msg.includes('karoser') || msg.includes('karlo servis') || msg.includes('galičić') || msg.includes('galicic') || msg.includes('valentić') || msg.includes('valentic') || msg.includes('autocentar')
    // EN
    || msg.includes('doctor') || msg.includes('pharmacy') || msg.includes('bank') || msg.includes('atm') || msg.includes('cash') || msg.includes('bus') || msg.includes('service') || msg.includes('post office') || msg.includes('car repair') || msg.includes('mechanic') || msg.includes('garage') || msg.includes('tyre') || msg.includes('tire')
    // DE
    || msg.includes('arzt') || msg.includes('apotheke') || msg.includes('bank') || msg.includes('geldautomat') || msg.includes('bus') || msg.includes('taxi') || msg.includes('post') || msg.includes('werkstatt') || msg.includes('kfz') || msg.includes('mechaniker') || msg.includes('reifenwechsel'))
    return { context: CATEGORY_CONTEXTS.usluge(db), category: 'usluge' };

  if (msg.includes('šetn') || msg.includes('bicikl') || msg.includes('perivoj') || msg.includes('park') || msg.includes('priroda') || msg.includes('ribolov') || msg.includes('drava') || msg.includes('šuma')
    // EN
    || msg.includes('walk') || msg.includes('hiking') || msg.includes('cycling') || msg.includes('nature') || msg.includes('fishing') || msg.includes('river') || msg.includes('forest') || msg.includes('outdoor') || msg.includes('picnic')
    // DE
    || msg.includes('wandern') || msg.includes('radfahren') || msg.includes('natur') || msg.includes('angeln') || msg.includes('fluss') || msg.includes('wald') || msg.includes('spazier'))
    return { context: CATEGORY_CONTEXTS.priroda(db), category: 'priroda' };

  if (msg.includes('izlet') || msg.includes('okolica') || msg.includes('blizin') || msg.includes('kopački') || msg.includes('osijek') || msg.includes('đakovo') || msg.includes('bizovac') || msg.includes('toplice') || msg.includes('vino') || msg.includes('baranj')
    // EN
    || msg.includes('trip') || msg.includes('excursion') || msg.includes('nearby') || msg.includes('surroundings') || msg.includes('day trip') || msg.includes('wine') || msg.includes('spa') || msg.includes('around valpovo')
    // DE
    || msg.includes('ausflug') || msg.includes('umgebung') || msg.includes('in der nähe') || msg.includes('wein') || msg.includes('therme'))
    return { context: CATEGORY_CONTEXTS.okolica(db), category: 'okolica' };

  // Nema ključnih riječi — koristi zadnju kategoriju razgovora ako postoji
  // matched: false → pre-gen se NE aktivira, ide na AI (npr. "kakvo će biti vrijeme?")
  if (lastCategory && CATEGORY_CONTEXTS[lastCategory])
    return { context: CATEGORY_CONTEXTS[lastCategory](db), category: lastCategory, matched: false };

  return { context: db, category: null, matched: false };
}

// Izvuci IMAGE_URL vrijednosti iz objekta/niza (rekurzivno), max N slika
function extractImages(obj, max = 4) {
  const urls = [];
  function walk(node) {
    if (!node || typeof node !== 'object' || urls.length >= max) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node.IMAGE_URL) urls.push(node.IMAGE_URL);
    for (const v of Object.values(node)) walk(v);
  }
  walk(obj);
  return urls.slice(0, max);
}

// Kontekstualni prijedlozi za sljedeće pitanje — ovisno o kategoriji
function getSuggestions(category) {
  const map = {
    smjestaj:     ['🍽️ Gdje ručati?', '🏛️ Što vidjeti?', '🅿️ Parkiranje?'],
    gastronomija: ['🏨 Smještaj u Valpovu?', '🏛️ Što vidjeti?', '📅 Događaji?'],
    dogadanja:    ['🏨 Smještaj za tu noć?', '🍽️ Gdje ručati?', '🏛️ Što vidjeti?'],
    znamenitosti: ['🍽️ Gdje ručati?', '🏨 Smještaj u Valpovu?', '📅 Događaji?'],
    sport:        ['🍽️ Gdje ručati?', '🌿 Priroda i šetnice?', '🏨 Smještaj?'],
    kupovina:     ['🍽️ Gdje ručati?', '🅿️ Parkiranje?', '🏛️ Što vidjeti?'],
    priroda:      ['🍽️ Gdje ručati?', '🚴 Sport i rekreacija?', '🏨 Smještaj?'],
    okolica:      ['🏨 Smještaj u Valpovu?', '🍽️ Gdje ručati?', '📅 Događaji?'],
    opcenito:     ['🏛️ Što vidjeti?', '🍽️ Gdje ručati?', '🏨 Smještaj?'],
    benzinske:    ['🅿️ Parkiranje?', '🍽️ Gdje ručati?', '🏨 Smještaj?'],
    parking:      ['🍽️ Gdje ručati?', '🏛️ Što vidjeti?', '🏨 Smještaj?'],
    usluge:       ['🍽️ Gdje ručati?', '🏨 Smještaj?', '🏛️ Što vidjeti?'],
    frizeraji:    ['🍽️ Gdje ručati?', '🏛️ Što vidjeti?', '🏨 Smještaj?'],
    priroda:      ['🍽️ Gdje ručati?', '🚴 Sport i rekreacija?', '🏨 Smještaj?'],
  };
  return map[category] || ['🏛️ Što vidjeti?', '🍽️ Gdje ručati?', '🏨 Smještaj?'];
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message, history, category: lastCategory, weather, inputMethod } = req.body;
    const isVoiceInput = inputMethod === 'voice';

    if (!message) {
      return res.status(400).json({ reply: "Poruka je prazna." });
    }

    // matched: true = routing je prepoznao ključne riječi → pre-gen se aktivira
    // matched: false = fallback na lastCategory (npr. nepovezano pitanje) → ide na AI
    const { context, category, matched = true } = getRelevantContext(message, db, lastCategory);

    // Vremenski upit — direktan odgovor bez AI (nema vremenskih podataka)
    const isWeatherQuery = ['prognoz', 'forecast', 'wetter', 'vremensku prognozu'].some(k => message.toLowerCase().includes(k))
      || (['kakvo', 'kako', 'hoće', 'hoce', 'biti', 'stupnjev', 'stupnja', 'temperatura'].filter(k => message.toLowerCase().includes(k)).length >= 2 && ['vrij', 'tempera', 'kišno', 'sunčano', 'oblačno'].some(k => message.toLowerCase().includes(k)));
    if (isWeatherQuery) {
      const weatherReply = `Nažalost, nemam pristup vremenskim podacima niti prognozi za buduće dane.\n\nZa točnu vremensku prognozu preporučujem:\n🌤️ [meteo.hr](https://meteo.hr) — Državni hidrometeorološki zavod\n🌡️ [Weather.com Valpovo](https://weather.com/hr-HR/weather/today/l/Valpovo)\n\nAko mi kažeš kakvo vrijeme očekuješ — ☀️ sunčano, 🌧️ kišno, ❄️ hladno — predložit ću aktivnosti i sadržaje koji odgovaraju!`;
      return res.status(200).json({ reply: weatherReply, category: lastCategory || null, suggestions: getSuggestions(lastCategory), images: [] });
    }

    // Konverzacijski/retoričko pitanje — kratki AI odgovor s preporukom, NE puni listing
    // Primjeri: "Što bi mi preporučio za ručak?", "Koji hotel preporučuješ?", "Savjetuješ li koji restoran?"
    const isRecommendationQuery = [
      'preporuč', 'savjetuješ', 'savjet', 'što bi', 'sto bi', 'koji bi', 'koja bi',
      'kakvo bi', 'kamo bi', 'gdje bi preporuč', 'predloži', 'predlažeš',
      // EN
      'recommend', 'suggest', 'advice', 'what would you', 'which would you', 'where would you',
      // DE
      'empfehl', 'vorschlag', 'was würdest', 'was empf'
    ].some(k => message.toLowerCase().includes(k));

    // Upiti za detalje o specifičnoj temi/osobi/objektu — preskoči pre-gen listing, pusti AI da odgovori detaljno
    // Primjeri: "zanima me više o Katančiću", "reci mi više o dvorcu", "detaljnije o MatijafesT-u"
    const isDetailQuery = [
      'zanima me više', 'zanima me detalj', 'reci mi više', 'recite mi više',
      'više o', 'više informacij', 'detaljn', 'tko je', 'što je to', 'sto je to',
      'što je bio', 'sto je bio', 'koji je to', 'koja je to', 'govori mi o',
      'ispričaj mi', 'ispricaj mi', 'objasni mi', 'o čemu se radi', 'o cemu se radi',
      // EN
      'tell me more', 'more about', 'details about', 'who is', 'what is', 'who was', 'what was', 'explain',
      // DE
      'erzähl mir mehr', 'mehr über', 'details über', 'wer ist', 'was ist', 'erkläre'
    ].some(k => message.toLowerCase().includes(k));

    // Događanja listing: filtriraj prošle i generiraj direktno bez AI
    // Ako korisnik pita za SPECIFIČNU manifestaciju po imenu → preskoči listing, pusti AI da odgovori konkretno
    const specificEventQuery = ['fišijad','fisijad','matijafest','rockaraj','reunited','vašar','vasar','ljeto valpov','craft beer','staza zdravlja','festival sira','ribljeg paprikaš','ribljeg paprikas','kuhanje fiš','kuhanje fis','katančić','katancic','matija petar','matiji petru'].some(k => message.toLowerCase().includes(k));
    if (category === 'dogadanja' && !specificEventQuery && !isRecommendationQuery && !isDetailQuery && matched) {
      const currentMonth = new Date().getMonth() + 1;
      const upcoming = db.dogadanja.filter(e => eventMaxMonth(e.vrijeme) >= currentMonth);
      let reply = upcoming.length
        ? `Predstojeće manifestacije u Valpovu (${new Date().getFullYear()}):\n\n`
        : 'Nema predstojećih manifestacija za ostatak ove godine.';
      for (const e of upcoming) {
        if (e.IMAGE_URL) reply += `[[IMG:${e.IMAGE_URL}]]`;
        reply += `**${e.naziv}**\n`;
        reply += `📅 ${e.vrijeme}\n`;
        reply += `${e.opis}\n`;
        reply += e.web ? `[Više informacija](${e.web})\n` : `[Više informacija na TZ Valpovo](https://tz.valpovo.hr/manifestacije/)\n`;
        reply += `[[CLR]]\n\n`;
      }
      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // Smještaj listing: generiraj direktno bez AI (sprječava hallucination)
    // matched: false = fallback (npr. vremenski upit) → NE aktiviraj pre-gen
    if (category === 'smjestaj' && !isRecommendationQuery && !isDetailQuery && matched) {
      const s = db.smjestaj;
      const msgL = message.toLowerCase();

      // Detektiraj specifičnu podkategoriju iz upita (bez međusobnih isključenja!)
      const wantsSobe      = msgL.includes('sob') || msgL.includes('room');
      const wantsHotel     = msgL.includes('hotel');
      const wantsApartman  = msgL.includes('apartman') || msgL.includes('studio');
      const wantsRuralni   = msgL.includes('ruralni') || msgL.includes('holiday') || msgL.includes('dvori') || msgL.includes('seoski') || msgL.includes('seosk') || msgL.includes('gospodarstv') || msgL.includes('farma') || msgL.includes('agro') || msgL.includes('rural') || msgL.includes('bauernhof');
      const wantsPrenociste= msgL.includes('prenoć') || msgL.includes('prenoc') || msgL.includes('noćiš') || msgL.includes('nocis');

      // Prikaži sve ako: nema nijednog filtera, ili ima 2+ tipova (korisnik traži pregled svih)
      const typeCount = [wantsSobe, wantsHotel, wantsApartman, wantsRuralni, wantsPrenociste].filter(Boolean).length;
      const showAll = typeCount === 0 || typeCount >= 2;

      const allSections = [
        { key: 'hoteli',           icon: '🏨', label: 'Hoteli',            show: showAll || wantsHotel },
        { key: 'ruralni_smjestaj', icon: '🌿', label: 'Ruralni smještaj',  show: showAll || wantsRuralni },
        { key: 'apartmani',        icon: '🏠', label: 'Apartmani',         show: showAll || wantsApartman },
        { key: 'prenocista',       icon: '🛏', label: 'Prenoćišta',        show: showAll || wantsPrenociste },
        { key: 'sobe',             icon: '🔑', label: 'Sobe',              show: showAll || wantsSobe },
      ];

      const activeSections = allSections.filter(sec => sec.show);

      // Dinamičan uvod ovisno o upitu
      let reply = '';
      if (wantsSobe)       reply = 'Evo dostupnih soba za iznajmljivanje u Valpovu:\n\n';
      else if (wantsHotel) reply = 'Evo hotela u Valpovu:\n\n';
      else if (wantsApartman) reply = 'Evo apartmana dostupnih za iznajmljivanje u Valpovu:\n\n';
      else if (wantsRuralni)  reply = 'Evo ruralnog smještaja u okolici Valpova:\n\n';
      else if (wantsPrenociste) reply = 'Evo prenoćišta u Valpovu:\n\n';
      else reply = 'Evo svih smještajnih opcija u Valpovu:\n\n';

      for (const { key, icon, label } of activeSections) {
        const items = s[key];
        if (!items?.length) continue;
        if (showAll) reply += `${icon} **${label}**\n\n`;
        for (const item of items) {
          if (item.IMAGE_URL) reply += `[[IMG:${item.IMAGE_URL}]]`;
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          reply += `[Otvori na karti](${item.maps_url})\n`;
          reply += item.web ? `[Više informacija](${item.web})\n` : `[Više informacija na TZ Valpovo](https://tz.valpovo.hr/smjestaj-u-valpovu/)\n`;
          reply += `[[CLR]]\n\n`;
        }
      }
      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // Znamenitosti listing: generiraj direktno bez AI
    // Specifični upit (dvorac, muzej, kula...) → pusti AI da odgovori detaljno
    const specificZnaQuery = ['dvorac','prandau','muzej','kula','kazalište','kazaliste','pivovara','konjušnice','konjusnice','pučka škola','pucka skola','memorijaln','centar kulture','katančić','katancic','fortuna'].some(k => message.toLowerCase().includes(k));
    if (category === 'znamenitosti' && !specificZnaQuery && !isRecommendationQuery && !isDetailQuery && matched) {
      const zna = db.znamenitosti || [];
      let reply = 'Valpovo krije niz kulturnih i povijesnih znamenitosti. Evo kompletnog pregleda:\n\n';
      for (const item of zna) {
        if (item.IMAGE_URL) reply += `[[IMG:${item.IMAGE_URL}]]`;
        reply += `**${item.naziv}**\n`;
        if (item.opis) reply += `${item.opis}\n`;
        if (item.radno_vrijeme) reply += `🕐 ${item.radno_vrijeme}\n`;
        if (item.adresa) reply += `📍 ${item.adresa}\n`;
        reply += `[Otvori na karti](${item.maps_url})\n`;
        reply += item.web ? `[Više informacija](${item.web})\n` : `[Više informacija na TZ Valpovo](https://tz.valpovo.hr/znamenitosti/)\n`;
        reply += `[[CLR]]\n\n`;
      }
      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // Gastronomija listing: generiraj direktno bez AI (eliminira hallucination restorana)
    // Ako korisnik pita za radno vrijeme, specifično mjesto ili daje preporuku → preskoči listing, pusti AI s kontekstom
    const radnoVrijemeQuery = ['radno vrij','kada radi','radi li','do kada rad','od kada rad','opening hours','what time','öffnungszeiten','geöffnet','otvoreno','zatvoreno'].some(k => message.toLowerCase().includes(k));
    const isGastroListing = category === 'gastronomija' && !radnoVrijemeQuery && !isRecommendationQuery && !isDetailQuery && matched;
    if (isGastroListing) {
      const gastro = db.gastronomija || [];

      // Pomoćna funkcija za maps_url — koristi polje ili generira iz adrese/naziva
      const mapsUrl = (item) =>
        item.maps_url ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.naziv + ' Valpovo')}`;

      // Grupiraj po tipu
      const restorani = gastro.filter(g =>
        /restoran|hotel.*restoran/i.test(g.naziv)
      );
      const brzaHrana = gastro.filter(g =>
        /burger|pizza|pizzeria|brze prehrane|gurman/i.test(g.naziv)
      );
      const caffeBarovi = gastro.filter(g =>
        !restorani.includes(g) && !brzaHrana.includes(g)
      );

      // Odredi što prikazati na temelju namjere upita
      const wantsDining = ['ručati','ručak','večerati','večera','jesti','objedovati',
        'lunch','dinner','eat','speisen','mittagessen','abendessen'].some(k => msgLower.includes(k));
      const wantsCafe   = ['kafić','kava','kavana','caffe','café','bar','kafe',
        'coffee','café','kaffee'].some(k => msgLower.includes(k));

      const showRestorani   = !wantsCafe;   // skrivaj restorane samo ako traži samo cafe
      const showBrzaHrana   = !wantsCafe;
      const showCaffeBarovi = !wantsDining; // skrivaj caffe barove samo ako traži samo restoran

      let reply = wantsDining
        ? 'Restorani i mjesta za objedovanje u Valpovu:\n\n'
        : wantsCafe
          ? 'Caffe barovi i kavane u Valpovu:\n\n'
          : 'Valpovo ima bogatu ugostiteljsku ponudu — od tradicijskih slavonskih restorana do caffe barova. Evo pregleda:\n\n';

      if (restorani.length && showRestorani) {
        reply += '🍽️ **Restorani**\n\n';
        for (const item of restorani) {
          if (item.IMAGE_URL) reply += `[[IMG:${item.IMAGE_URL}]]`;
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          reply += `[Otvori na karti](${mapsUrl(item)})\n`;
          if (item.web) reply += `[Više informacija](${item.web})\n`;
          reply += `[[CLR]]\n\n`;
        }
      }

      if (brzaHrana.length && showBrzaHrana) {
        reply += '🍕 **Brza hrana i pizzerije**\n\n';
        for (const item of brzaHrana) {
          if (item.IMAGE_URL) reply += `[[IMG:${item.IMAGE_URL}]]`;
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          reply += `[Otvori na karti](${mapsUrl(item)})\n`;
          if (item.web) reply += `[Više informacija](${item.web})\n`;
          reply += `[[CLR]]\n\n`;
        }
      }

      if (caffeBarovi.length && showCaffeBarovi) {
        reply += '☕ **Caffe barovi i kavane**\n\n';
        for (const item of caffeBarovi) {
          if (item.IMAGE_URL) reply += `[[IMG:${item.IMAGE_URL}]]`;
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          reply += `[Otvori na karti](${mapsUrl(item)})\n`;
          if (item.web) reply += `[Više informacija](${item.web})\n`;
          reply += `[[CLR]]\n\n`;
        }
      }

      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // Sport listing: generiraj direktno bez AI (opći upit o sportu/klubovima)
    const isSportListing = category === 'sport' && !isRecommendationQuery && !isDetailQuery && matched;
    if (isSportListing) {
      const s = db.sport;
      const sportEmoji = {
        'Nogomet': '⚽', 'Futsal (malonogometni)': '⚽', 'Rukomet': '🤾', 'Odbojka': '🏐',
        'Košarka': '🏀', 'Tenis': '🎾', 'Stolni tenis': '🏓', 'Karate': '🥋',
        'Savate (francuski boks)': '🥊', 'Šah': '♟️', 'Sportski ribolov': '🎣'
      };
      let reply = 'Sportski klubovi i sadržaji u Valpovu:\n\n';
      if (s?.klubovi?.length) {
        reply += '**🏆 Sportski klubovi**\n\n';
        for (const k of s.klubovi) {
          const emoji = sportEmoji[k.sport] || '🏅';
          reply += `${emoji} **${k.naziv}**\n`;
          if (k.opis) reply += `${k.opis}\n`;
          if (k.maps_url) reply += `[Otvori na karti](${k.maps_url})\n`;
          if (k.web) reply += `[Više informacija](${k.web})\n`;
          reply += '\n';
        }
      }
      if (s?.objekti?.length) {
        reply += '**🏟️ Sportski objekti**\n\n';
        for (const o of s.objekti) {
          reply += `**${o.naziv}**\n`;
          if (o.opis) reply += `${o.opis}\n`;
          if (o.maps_url) reply += `[Otvori na karti](${o.maps_url})\n`;
          if (o.web) reply += `[Više informacija](${o.web})\n`;
          reply += '\n';
        }
      }
      if (s?.rekreacija?.length) {
        reply += '**🚴 Rekreacija i aktivni odmor**\n\n';
        for (const r of s.rekreacija) {
          reply += `**${r.naziv}**\n`;
          if (r.opis) reply += `${r.opis}\n`;
          if (r.maps_url) reply += `[Otvori na karti](${r.maps_url})\n`;
          reply += '\n';
        }
      }
      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // Okolica listing: generiraj direktno bez AI samo kad korisnik traži opći popis izleta
    // (sadrži 'izlet') — specifična pitanja (vinske ceste, Kopački rit...) idu na AI
    const msgLower = message.toLowerCase();
    const isOkolicaListing = category === 'okolica' && msgLower.includes('izlet') && !isRecommendationQuery && !isDetailQuery && matched;
    if (isOkolicaListing) {
      const izleti = db.okolica?.izleti || [];
      let reply = 'Preporučeni izleti iz Valpova — od najbližeg prema daljem:\n\n';
      for (const item of izleti) {
        reply += `**${item.naziv}**\n`;
        if (item.udaljenost) reply += `📍 ${item.udaljenost}\n`;
        if (item.opis)       reply += `${item.opis}\n`;
        if (item.cijena)     reply += `💶 ${item.cijena}\n`;
        reply += `[Otvori na karti](${item.maps_url})\n`;
        if (item.web)        reply += `[Više informacija](${item.web})\n`;
        reply += '\n';
      }
      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // === USLUGE PRE-GEN ===
    // Zdravstvo, banke, auto servisi, taksi, benzinske, frizeraji, parking
    // Sprječava AI haluciniranje naziva institucija koje NE postoje u Valpovu
    const isUslugeCategory = ['usluge','benzinske','frizeraji','parking'].includes(category);
    if (isUslugeCategory && !isRecommendationQuery && !isDetailQuery && matched) {
      const u = db.usluge;
      const ml = msgLower;
      let reply = '';

      if (ml.includes('ljekar') || ml.includes('apoteka') || ml.includes('ljekarn') ||
          ml.includes('zdravst') || ml.includes('doktor') || ml.includes('liječnik') ||
          ml.includes('hitna') || ml.includes('doctor') || ml.includes('pharmacy') || ml.includes('farmac')) {
        reply = '🏥 Zdravstvene ustanove i ljekarne u Valpovu:\n\n';
        for (const item of u.zdravstvo || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          const murl = item.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.naziv + ' Valpovo')}`;
          reply += `[Otvori na karti](${murl})\n\n`;
        }

      } else if (ml.includes('bankomat') || ml.includes('atm') || ml.includes('gotovina') || ml.includes('cash')) {
        reply = '🏧 Bankomati u Valpovu:\n\n';
        for (const item of u.bankomati || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          reply += `[Otvori na karti](${item.maps_url})\n\n`;
        }

      } else if (ml.includes('banka') || ml.includes('banke') || ml.includes('pošta') ||
                 ml.includes('posta') || ml.includes('bank') || ml.includes('post office')) {
        reply = '🏦 Banke i pošta u Valpovu:\n\n';
        for (const item of u.banke_i_posta || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          if (item.radno_vrijeme) reply += `🕐 ${item.radno_vrijeme}\n`;
          if (item.maps_url) reply += `[Otvori na karti](${item.maps_url})\n`;
          reply += '\n';
        }

      } else if (ml.includes('auto') || ml.includes('servis') || ml.includes('mehanik') ||
                 ml.includes('popravak') || ml.includes('vulkan') || ml.includes('autocentar') ||
                 ml.includes('car repair') || ml.includes('mechanic') || ml.includes('werkstatt')) {
        reply = '🔧 Auto servisi u Valpovu:\n\n';
        for (const item of u.auto_servisi || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          const murl = item.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.naziv + ' Valpovo')}`;
          reply += `[Otvori na karti](${murl})\n\n`;
        }

      } else if (ml.includes('taksi') || ml.includes('taxi') || ml.includes('cab')) {
        reply = '🚕 Taksi prijevoz iz/do Valpova:\n\n';
        for (const item of u.taksi || []) {
          reply += `**${item.naziv}**\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          reply += '\n';
        }

      } else if (ml.includes('autobus') || ml.includes('kolodvor') || ml.includes('vozni red')) {
        reply = '🚌 Autobusni prijevoz iz/do Valpova:\n\n';
        for (const item of u.autobusni_prijevoz || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          if (item.maps_url) reply += `[Otvori na karti](${item.maps_url})\n`;
          reply += '\n';
        }

      } else if (category === 'benzinske' || ml.includes('benzin') || ml.includes('goriv') || ml.includes('pumpa')) {
        reply = '⛽ Benzinske stanice u Valpovu:\n\n';
        for (const item of u.benzinske_stanice || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          reply += `[Otvori na karti](${item.maps_url})\n\n`;
        }

      } else if (category === 'frizeraji' || ml.includes('frizer') || ml.includes('kozmet') ||
                 ml.includes('barber') || ml.includes('brica')) {
        reply = '💈 Frizeraji i kozmetički saloni u Valpovu:\n\n';
        for (const item of u.frizeraji || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          reply += `[Otvori na karti](${item.maps_url})\n\n`;
        }

      } else if (category === 'parking' || ml.includes('parking') || ml.includes('parkir')) {
        reply = '🅿️ Parkirališta u Valpovu (sva besplatna):\n\n';
        for (const item of u.parkiralista || []) {
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          reply += `[Otvori na karti](${item.maps_url})\n\n`;
        }

      } else {
        // Opći pregled svih usluga
        reply = 'Pregled usluga dostupnih u Valpovu:\n\n';
        reply += '🏥 **Zdravstvo:** Dom zdravlja (📞 194 Hitna), Ljekarna Srce (📞 031 651 350), Ljekarna Kalenić (📞 031 650 290)\n\n';
        reply += '🏦 **Banke:** Slatinska banka, OTP banka, HPB, PBZ · 📮 Hrvatska pošta\n\n';
        reply += '🏧 **Bankomati:** HPB (24/7), Slatinska, OTP, PBZ\n\n';
        reply += '⛽ **Benzinske:** INA, Petrol, Euro Petrol/NTL\n\n';
        reply += '🔧 **Auto servisi:** Autocentar Ivica, Galičić, Valentić, Dabo, Karlo servis\n\n';
        reply += '🚕 **Taksi:** Panda 📞 099 666 000 9 · Goran 📞 +385 95 310 3100\n\n';
        reply += '🚌 **Autobus:** Kolodvor Valpovo — 22 linije/dan prema Osijeku\n\n';
        reply += '💈 **Frizeraji:** Salon Erika, Salon Iris, Beauty, Barbershop\n\n';
        reply += '🅿️ **Parkiranje:** Sve besplatno — uz dvorac, Trg Tomislava, STOP SHOP\n\n';
        reply += 'Pitajte za detalje o bilo kojoj kategoriji!';
      }

      if (reply) {
        return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: [] });
      }
    }

    // Datum i godišnje doba (server-side, uvijek točno)
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();
    const months = ['siječnja','veljače','ožujka','travnja','svibnja','lipnja',
                    'srpnja','kolovoza','rujna','listopada','studenog','prosinca'];
    const dateStr = `${day}. ${months[month - 1]} ${year}.`;

    function getSeason(m, d) {
      if ((m === 3 && d >= 21) || m === 4 || m === 5 || (m === 6 && d <= 20)) return 'proljeće';
      if ((m === 6 && d >= 21) || m === 7 || m === 8 || (m === 9 && d <= 22)) return 'ljeto';
      if ((m === 9 && d >= 23) || m === 10 || m === 11 || (m === 12 && d <= 21)) return 'jesen';
      return 'zima';
    }
    const season = getSeason(month, day);
    // Prijelazni opis za kraj zime / početak proljeća (1.-20. ožujka)
    const seasonDisplay = (month === 3 && day < 21)
      ? 'kraj zime / početak proljeća'
      : (month === 12 && day >= 22) || month === 1 || month === 2
        ? 'zima'
        : season;

    const weatherLine = weather?.temperature !== undefined
      ? `${weather.temperature}°C, vjetar ${weather.windspeed} km/h`
      : '';

    const systemPrompt = `
KONTEKST TRENUTNOG TRENUTKA:
- Datum: ${dateStr}
- Godišnje doba: ${seasonDisplay}
${weatherLine ? `- Trenutno vrijeme u Valpovu: ${weatherLine}` : ''}
VAŽNO — VREMENSKI KONTEKST:
- Preporuke uvijek usmjeri prema SADAŠNJOSTI i BUDUĆNOSTI, nikad prema prošlim događajima
- Odaberi aktivnosti primjerene stvarnom godišnjem dobu i temperaturi: u proljeće/ljeto → šetnje, biciklizam, rijeka, izleti; u jesen → vinska sela, berba; u zimu → toplice, unutarnji sadržaji
- Kraj zime / početak proljeća (veljača–ožujak): sunčaniji dani su idealni za prve šetnje i izlete, ne predlažu se zimski sportovi
- Ako korisnik pita što se uskoro događa ili koji su predstojeći događaji — prikaži samo nadolazeće manifestacije (koje još nisu prošle)

KRITIČNO PRAVILO — JEZIK I PISMO: Uvijek odgovaraj ISKLJUČIVO na jeziku kojim je napisano korisnikovo pitanje. Ovo je apsolutni prioritet koji se nikad ne smije zanemariti.
- Pitanje na engleskom → cijeli odgovor na engleskom, uključujući labele linkova ([Open on map], [More information])
- Pitanje na njemačkom → cijeli odgovor na njemačkom ([Auf der Karte öffnen], [Mehr Informationen])
- Pitanje na talijanskom → cijeli odgovor na talijanskom ([Apri sulla mappa], [Più informazioni])
- Pitanje na hrvatskom → odgovor na hrvatskom ([Otvori na karti], [Više informacija])
- Za bilo koji drugi jezik → odgovaraj na tom jeziku
APSOLUTNA ZABRANA ĆIRILICE: Bez obzira na jezik — NIKAD ne koristi ćirilično pismo. Uvijek latinica. Nepromjenjivo pravilo.
${isVoiceInput ? `GLASOVNI UNOS — POSEBNA PRAVILA:
- Korisnik je postavio pitanje glasom (speech-to-text). Odgovor mora biti u latiničnom pismu.
- Piši kraće i jasnije rečenice — odgovor će se čitati naglas (TTS).
- Izbjegavaj složene markdown strukture — preferiraj kratke paragrafe.
- Ne koristi tablice. Emoji su OK.` : ''}
Podatke iz baze prevedi na jezik korisnika. Nazive mjesta, ulica i institucija ostavi u izvornom obliku.

Ti si digitalni turistički informator grada Valpova.

Za svaku lokaciju, restoran ili smještaj koristi TOČNO ovu strukturu (labele linkova na jeziku korisnika):

**Naziv**
Kratki opis.
[Otvori na karti](Google Maps URL)
[Više informacija](URL web stranice)

PRAVILA FORMATIRANJA:
- UVOD: Prije listinga napiši 1-2 kratke kontekstualne rečenice koje govore SAMO opći kontekst (npr. "U Valpovu postoji smještaj za svaki ukus. Evo pregleda:"). STROGO ZABRANJENO: u uvodu opisivati konkretne stavke, hotele, restorane ili lokacije koje dolaze u listingu — to je DUPLIKACIJA. Opisi, adrese i linkovi dolaze ISKLJUČIVO u strukturiranom listingu. Pogrešno: "Preporučujem Hotel X koji je moderan... Evo više: **Hotel X** Moderan hotel..." — Ispravno: "U Valpovu imate nekoliko smještajnih opcija. Evo pregleda:" pa listing.
- NIKAD ne koristi ### ili ## naslove
- NIKAD ne uključuj slike niti ![]() sintaksu
- Za "Otvori na karti" koristi polje maps_url iz baze (svaka lokacija ga ima)
- Svaki unos odijeli praznim redom
- Ako lokacija nema web u bazi, umjesto "Web: nije dostupno" napiši aktivan link: [Više informacija na TZ Valpovo](https://tz.valpovo.hr)
- NIKAD ne izmišljaj URL-ove koji nisu u bazi — koristi SAMO URL adrese iz polja "web" u bazi podataka

PRAVILA ZA BROJ REZULTATA:
- Za kategoriju SMJEŠTAJ: prikaži SVE opcije, grupirane po tipu (Hoteli, Apartmani, Prenoćišta, Sobe, Ruralni smještaj). Za svaku lokaciju samo: naziv, kratki opis (ako postoji), [Otvori na karti] i [Više informacija].
- Za kategoriju SPORT (opći upit): prikaži SVE klubove grupirane po sportu, pa objekte i rekreaciju. Koristi emoji po sportu: ⚽ Nogomet, 🎾 Tenis, 🤾 Rukomet, 🏐 Odbojka, 🥊 Borilački, ♟️ Šah, 🎣 Ribolov, 💪 Fitness itd.
- Za kategoriju KUPOVINA — OPĆI upit: prikaži sve u logičnom redoslijedu — prvo 🏬 Trgovački centri (s popisom trgovina unutra), zatim 🛒 Supermarketi, 🏪 Specijalizirane trgovine, 🎁 Lokalni proizvodi i suveniri, 🥬 Tržnica. Za svaku stavku napiši naziv, opis i [Otvori na karti]. Za STOP SHOP navedi popis svih trgovina unutra. KUPOVINA — VAŽNO: NIKAD ne prikazuj "Više informacija" web linkove za trgovine i trgovačke centre (web stranice se ne mogu prikazati) — prikaži SAMO [Otvori na karti] link za svaku lokaciju.
- Za kategoriju KUPOVINA — SPECIFIČNI upit (npr. cipele, odjeća, namještaj, kozmetika): prikaži SAMO relevantne prodavaonice. Primjeri: cipele/obuća → Deichmann (u STOP SHOP), Borovo obuća; odjeća/moda → PEPCO, Takko Fashion, KiK, MANA; namještaj → Prima namještaj, JYSK; kozmetika → dm, BIPA. NIKAD ne prikazuj nesrodne prodavaonice (npr. mesnice za upit o cipelama). NIKAD ne prikazuj web linkove za kupovinu — samo [Otvori na karti].
- Za kategoriju OPĆENITO / O GRADU: odgovaraj slobodnim tekstom koristeći podatke iz baze. Struktura ovisno o pitanju — za opći upit o gradu daj: osnovni podaci → kratka povijest → naselja → gospodarske aktivnosti → zanimljivosti. NE koristi tablice, koristi boldane naslove sekcija i kratke paragrafe.
- Za kategoriju PRIRODA (opći upit): prikaži sve sadržaje grupirane: 🚶 Šetnice i parkovi, 🚴 Biciklizam, 🎣 Ribolov. Za svaki unos: naziv, opis. Gdje postoji maps_url — dodaj [Otvori na karti].
- Za kategoriju OKOLICA — SPECIFIČNO pitanje (npr. "vinske ceste", "Kopački rit", "toplice", "Baranja"): odgovaraj SAMO o traženoj temi — ne listaj sve destinacije. Navedi udaljenost, opis i [Više informacija](web) samo za relevantne unose.
- Za kategoriju OKOLICA — OPĆI upit ("što ima u okolici", "preporuči izlet"): prikaži sve destinacije s udaljenošću, kratkim opisom i cijenom (ako postoji). Koristi emoji 📍. Za svaku dodaj [Više informacija](web). Grupiraj po udaljenosti: bliže → dalje.
- Za sve ostale kategorije: prikaži MAKSIMALNO 5 lokacija po odgovoru
- Ako ih ima više od prikazanih (N > 0), na kraju dodaj: "Ima još [N] rezultata — pitajte za više!" — AKO NEMA VIŠE: NIŠTA NE DODAJ. ZABRANJENA fraza "Ima još 0 rezultata" — nikad je ne koristi.
- Ako korisnik traži "još" ili "više" — prikaži sljedećih 5 koje NISU već navedene
- Nikad ne ponavljaj iste lokacije u istom razgovoru

RADNO VRIJEME: Mnogi unosi u bazi imaju polje "radno_vrijeme". Kad korisnik pita kada nešto radi, je li otvoreno, do kada radi i slično:
- Ako postoji "radno_vrijeme" u bazi → prikaži ga jasno (emoji 🕐 ispred)
- Ako NE postoji → reci "Za aktualno radno vrijeme preporučujemo provjeru na [Google Maps](https://www.google.com/maps/search/?api=1&query=NAZIV+Valpovo) ili kontakt s mjestom." — NIKAD ne izmišljaj radno vrijeme!

TRENUTNO VRIJEME vs. PROGNOZA — VAŽNA RAZLIKA:
- IMAŠ podatak o TRENUTNOJ temperaturi i vjetru u Valpovu (vidljivo gore u kontekstu). Slobodno koristi te podatke kada predlaješ aktivnosti! Npr: "Uz ${weatherLine || 'ovakvo vrijeme'} idealno je za šetnju perivojem..." ili slično.
- NEMAŠ vremensku prognozu za buduće dane (sutra, prekosutra, sljedeći tjedan). Za prognozu uvijek uputi na meteo.hr.
- Kada korisnik pita "što raditi po ovakvom vremenu / uz sunce / po kiši / po hladnoći" → predloži aktivnosti prikladne tom vremenu koristeći trenutnu temperaturu iz konteksta.
- Kada korisnik pita "kakvo će biti vrijeme sutra/prekosutra/za N dana" → kratko reci da nemaš prognozu i uputi na [meteo.hr](https://meteo.hr) ili [Weather.com Valpovo](https://weather.com/hr-HR/weather/today/l/Valpovo).

GOOGLE MAPS ZA DETALJE KOJI NEDOSTAJU: Ako korisnik pita za jelovnik, menu, ponudu jela, cijene ili druge detalje o restoranu ili ugostiteljskom objektu koji nisu u bazi — uputi ga na Google Maps gdje može vidjeti slike, recenzije i ažurirane informacije: [Pogledaj na Google Maps](https://www.google.com/maps/search/?api=1&query=NAZIV+Valpovo). Zamijeni NAZIV s točnim nazivom objekta. Ovo vrijedi za sve kategorije — smještaj, sport, znamenitosti — kad detalji nedostaju u bazi, Google Maps je prvi izbor za aktualne informacije.

PRAVILO: AKO PODATAK NIJE U BAZI — odgovori iskreno: "Trenutno nemam te podatke. Za više informacija obratite se Turističkoj zajednici Valpovo: [tz.valpovo.hr](https://tz.valpovo.hr) ili tel. 031 651 256." NIKAD ne izmišljaj podatke koji nisu u bazi.

Baza podataka:
${JSON.stringify(stripImages(context))}
`;

    const historyMessages = Array.isArray(history)
      ? history.slice(-6).map(m => ({ role: m.role, content: m.content }))
      : [];

    // SSE streaming — tekst se prikazuje čim stignu prvi tokeni
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: message }
      ],
      temperature: 0.3,
      max_tokens: category === 'opcenito' ? 900 : 500,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) res.write(`data: ${JSON.stringify({ t: content })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true, category: category || null, suggestions: getSuggestions(category), images: extractImages(context) })}\n\n`);
    res.end();

  } catch (error) {

    console.error("CHAT ERROR:", error);
    try {
      res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
      res.end();
    } catch {
      res.status(500).json({ reply: "Došlo je do greške na serveru." });
    }

  }

}

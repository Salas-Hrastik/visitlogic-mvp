import OpenAI from "openai";
import { db } from "./_database.js";
import { scrapedContent } from "./_scraped_content.js";

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

// Gradi sekciju s auto-skrapanim sadržajem (novosti, aktualne manifestacije)
function buildScrapedSection() {
  const s = scrapedContent;
  if (!s || (!s.novosti_tz?.length && !s.novosti_grad?.length && !s.manifestacije_aktualne?.length)) {
    return '';
  }
  const lines = ['\nAKTUALNI SADRŽAJ (automatski dohvaćen s web stranica grada):'];
  if (s.meta?.zadnje_azuriranje) {
    lines.push(`Zadnje ažuriranje: ${s.meta.zadnje_azuriranje.substring(0, 10)}`);
  }
  if (s.novosti_tz?.length) {
    lines.push('\nNajnovije vijesti — Turistička zajednica Valpovo:');
    s.novosti_tz.forEach(n => {
      lines.push(`• [${n.datum || ''}] ${n.naslov}${n.kratki_opis ? ' — ' + n.kratki_opis : ''}`);
    });
  }
  if (s.novosti_grad?.length) {
    lines.push('\nNajnovije vijesti — Grad Valpovo:');
    s.novosti_grad.forEach(n => {
      lines.push(`• [${n.datum || ''}] ${n.naslov}${n.kratki_opis ? ' — ' + n.kratki_opis : ''}`);
    });
  }
  if (s.manifestacije_aktualne?.length) {
    lines.push('\nAktualne manifestacije (s datumima):');
    s.manifestacije_aktualne.forEach(m => {
      lines.push(`• ${m.naziv}${m.datum ? ' (' + m.datum + ')' : ''}${m.opis ? ' — ' + m.opis : ''}`);
    });
  }
  return lines.join('\n');
}

const CATEGORY_CONTEXTS = {
  smjestaj:     (db) => ({ grad: db.grad, smjestaj: db.smjestaj }),
  gastronomija: (db) => ({ grad: db.grad, gastronomija: db.gastronomija, lokalna_kuhinja: db.lokalna_kuhinja }),
  dogadanja:    (db) => ({ grad: db.grad, dogadanja: db.dogadanja }),
  znamenitosti: (db) => ({ grad: db.grad, znamenitosti: db.znamenitosti }),
  sport:        (db) => ({ grad: db.grad, sport: db.sport }),
  kupovina:     (db) => ({ grad: db.grad, kupovina: db.kupovina }),
  opcenito:     (db) => ({ grad: db.grad, opcenito: db.opcenito, lokalna_kuhinja: db.lokalna_kuhinja }),
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
function eventMinMonth(vrijeme) {
  const months = (vrijeme || '').split('/').map(p => MONTH_MAP[p.trim()]).filter(Boolean);
  return months.length ? Math.min(...months) : 1;
}

// ─── LANGUAGE DETECTION ───────────────────────────────────────────────────
function detectLang(msg) {
  const words = msg.toLowerCase().split(/[\s,?.!;:()\-]+/);
  const has = (list) => list.some(w => words.includes(w));
  if (has(['what','where','how','which','when','is','are','can','do','have','show','find','tell','give','any','some','the','and','but','not','open','map','near','best','visit','see','eat','drink','stay','sleep','book','ticket','price','time','hour']))
    return 'en';
  if (has(['was','wo','wie','welche','wann','ist','sind','kann','haben','zeig','gibt','bitte','ich','ein','eine','der','die','das','und','oder','nicht','hier','mit','für','von','nach','beim','zum','zur']))
    return 'de';
  if (has(['cosa','dove','come','quale','quando','sono','può','mostra','dimmi','voglio','cerco','un','una','il','la','lo','gli','le','che','non','con','per','da','nel','nel']))
    return 'it';
  return 'hr';
}

const TR = {
  hr: {
    map:       'Otvori na karti',
    more:      'Više informacija',
    tzMore:    'Više informacija na TZ Valpovo',
    web:       'Web stranica',
    inValp:    'u Valpovu',
    free:      'Besplatno',
    contact:   'Kontakt',
    upcoming:  'Predstojeće manifestacije u Valpovu',
    noEvents:  'Trenutno nema predstojećih manifestacija. Pratite TZ Valpovo za najave!',
    allAccom:  'Evo svih smještajnih opcija u Valpovu:',
    hotels:    'Hoteli',
    rural:     'Ruralni smještaj',
    apts:      'Apartmani',
    pensions:  'Prenoćišta',
    rooms:     'Sobe',
    dining:    'Restorani i mjesta za objedovanje u Valpovu:',
    cafes:     'Caffe barovi i kavane u Valpovu:',
    allGastro: 'Valpovo ima bogatu ugostiteljsku ponudu — od tradicijskih slavonskih restorana do caffe barova. Evo pregleda:',
    rests:     'Restorani',
    fastfood:  'Brza hrana i pizzerije',
    cafesH:    'Caffe barovi i kavane',
    health:    '🏥 Zdravstvene ustanove i ljekarne u Valpovu:',
    atm:       '🏧 Bankomati u Valpovu:',
    banks:     '🏦 Banke i pošta u Valpovu:',
    autoServ:  '🔧 Auto servisi u Valpovu:',
    taxi:      '🚕 Taksi prijevoz iz/do Valpova:',
    bus:       '🚌 Autobusni prijevoz iz/do Valpova:',
    fuel:      '⛽ Benzinske stanice u Valpovu:',
    barbers:   '💈 Frizeraji i kozmetički saloni u Valpovu:',
    parking:   '🅿️ Parkirališta u Valpovu (sva besplatna):',
    svcOverview: 'Pregled usluga dostupnih u Valpovu:',
    askMore:   'Pitajte za detalje o bilo kojoj kategoriji!',
    excursions: 'Preporučeni izleti iz Valpova — od najbližeg prema daljem:',
  },
  en: {
    map:       'Open on map',
    more:      'More information',
    tzMore:    'More information at TZ Valpovo',
    web:       'Website',
    inValp:    'in Valpovo',
    free:      'Free',
    contact:   'Contact',
    upcoming:  'Upcoming events in Valpovo',
    noEvents:  'No upcoming events at this time. Follow TZ Valpovo for announcements!',
    allAccom:  'Here are all accommodation options in Valpovo:',
    hotels:    'Hotels',
    rural:     'Rural accommodation',
    apts:      'Apartments',
    pensions:  'Guesthouses',
    rooms:     'Rooms',
    dining:    'Restaurants and dining in Valpovo:',
    cafes:     'Cafés and coffee bars in Valpovo:',
    allGastro: 'Valpovo has a rich culinary offer — from traditional Slavonian restaurants to cafés. Here is an overview:',
    rests:     'Restaurants',
    fastfood:  'Fast food & pizzerias',
    cafesH:    'Cafés & coffee bars',
    health:    '🏥 Healthcare & pharmacies in Valpovo:',
    atm:       '🏧 ATMs in Valpovo:',
    banks:     '🏦 Banks & post office in Valpovo:',
    autoServ:  '🔧 Car repair & auto services in Valpovo:',
    taxi:      '🚕 Taxi services to/from Valpovo:',
    bus:       '🚌 Bus transport to/from Valpovo:',
    fuel:      '⛽ Petrol stations in Valpovo:',
    barbers:   '💈 Hairdressers & beauty salons in Valpovo:',
    parking:   '🅿️ Parking in Valpovo (all free):',
    svcOverview: 'Services available in Valpovo:',
    askMore:   'Ask for details on any category!',
    excursions: 'Recommended day trips from Valpovo — nearest to farthest:',
  },
  de: {
    map:       'Auf der Karte öffnen',
    more:      'Mehr Informationen',
    tzMore:    'Mehr Informationen – TZ Valpovo',
    web:       'Webseite',
    inValp:    'in Valpovo',
    free:      'Kostenlos',
    contact:   'Kontakt',
    upcoming:  'Bevorstehende Veranstaltungen in Valpovo',
    noEvents:  'Derzeit keine bevorstehenden Veranstaltungen. Folgen Sie TZ Valpovo für Ankündigungen!',
    allAccom:  'Hier sind alle Unterkunftsmöglichkeiten in Valpovo:',
    hotels:    'Hotels',
    rural:     'Ländliche Unterkunft',
    apts:      'Apartments',
    pensions:  'Pensionen',
    rooms:     'Zimmer',
    dining:    'Restaurants und Gastronomie in Valpovo:',
    cafes:     'Cafés und Kaffeebars in Valpovo:',
    allGastro: 'Valpovo bietet ein reiches kulinarisches Angebot — von traditionellen slawonischen Restaurants bis zu Cafés. Hier ein Überblick:',
    rests:     'Restaurants',
    fastfood:  'Schnellimbiss & Pizzerien',
    cafesH:    'Cafés & Kaffeebars',
    health:    '🏥 Gesundheit & Apotheken in Valpovo:',
    atm:       '🏧 Geldautomaten in Valpovo:',
    banks:     '🏦 Banken & Post in Valpovo:',
    autoServ:  '🔧 Autowerkstätten in Valpovo:',
    taxi:      '🚕 Taxiservice nach/von Valpovo:',
    bus:       '🚌 Busverbindungen nach/von Valpovo:',
    fuel:      '⛽ Tankstellen in Valpovo:',
    barbers:   '💈 Friseursalons & Kosmetik in Valpovo:',
    parking:   '🅿️ Parkplätze in Valpovo (alle kostenlos):',
    svcOverview: 'Verfügbare Dienstleistungen in Valpovo:',
    askMore:   'Fragen Sie nach Details zu einer beliebigen Kategorie!',
    excursions: 'Empfohlene Ausflüge ab Valpovo — vom nächsten zum weitesten:',
  },
  it: {
    map:       'Apri sulla mappa',
    more:      'Più informazioni',
    tzMore:    'Più informazioni – TZ Valpovo',
    web:       'Sito web',
    inValp:    'a Valpovo',
    free:      'Gratuito',
    contact:   'Contatto',
    upcoming:  'Prossimi eventi a Valpovo',
    noEvents:  'Al momento non ci sono eventi imminenti. Segui TZ Valpovo per gli annunci!',
    allAccom:  'Ecco tutte le opzioni di alloggio a Valpovo:',
    hotels:    'Hotel',
    rural:     'Alloggio rurale',
    apts:      'Appartamenti',
    pensions:  'Pensioni',
    rooms:     'Camere',
    dining:    'Ristoranti e ristorazione a Valpovo:',
    cafes:     'Caffè e bar a Valpovo:',
    allGastro: 'Valpovo offre una ricca offerta culinaria — dai tradizionali ristoranti slavoni ai caffè. Ecco una panoramica:',
    rests:     'Ristoranti',
    fastfood:  'Fast food e pizzerie',
    cafesH:    'Caffè e bar',
    health:    '🏥 Servizi sanitari e farmacie a Valpovo:',
    atm:       '🏧 Bancomat a Valpovo:',
    banks:     '🏦 Banche e posta a Valpovo:',
    autoServ:  '🔧 Officine e servizi auto a Valpovo:',
    taxi:      '🚕 Servizio taxi da/per Valpovo:',
    bus:       '🚌 Trasporto in autobus da/per Valpovo:',
    fuel:      '⛽ Stazioni di servizio a Valpovo:',
    barbers:   '💈 Parrucchieri e centri estetici a Valpovo:',
    parking:   '🅿️ Parcheggi a Valpovo (tutti gratuiti):',
    svcOverview: 'Servizi disponibili a Valpovo:',
    askMore:   'Chiedi dettagli su qualsiasi categoria!',
    excursions: 'Gite consigliate da Valpovo — dalla più vicina alla più lontana:',
  },
};

// Vrati { context, category } — category se pamti i šalje nazad klijentu
function getRelevantContext(message, db, lastCategory) {
  const msg = message.toLowerCase();

  // HR + EN + DE ključne riječi
  if (msg.includes('povijest') || msg.includes('histori') || msg.includes('osnovan') || msg.includes('općenito') || msg.includes('o gradu') || msg.includes('o valpovu') || msg.includes('stanovic') || msg.includes('stanovništv') || msg.includes('naselje') || msg.includes('geografij') || msg.includes('gospodarsk') || msg.includes('industrij') || msg.includes('poznat') || msg.includes('zanimljiv') || msg.includes('iovallium') || msg.includes('prandau') || msg.includes('rimsk') || msg.includes('osmansk') || msg.includes('gradonačelnik') || msg.includes('udaljenost')
    // Lokalna industrija i brendovi
    || msg.includes('valko') || msg.includes('valpovka') || msg.includes('stočna hrana') || msg.includes('stocna hrana') || msg.includes('tvornic') || msg.includes('industrijska proizvod') || msg.includes('prva industrijska') || msg.includes('kolači iz') || msg.includes('kolaci iz') || msg.includes('pivovara') || msg.includes('krmn')
    // Poljoprivreda
    || msg.includes('poljoprivred') || msg.includes('ratarstvo') || msg.includes('stočarstvo') || msg.includes('stocarstvo') || msg.includes('kukuruz') || msg.includes('pšenica') || msg.includes('psenica') || msg.includes('suncokret') || msg.includes('šećerna repa') || msg.includes('secerna repa') || msg.includes('soja') || msg.includes('voćnjak') || msg.includes('vocnjak') || msg.includes('uzgoj')
    // EN
    || msg.includes('history') || msg.includes('about') || msg.includes('general') || msg.includes('population') || msg.includes('founded') || msg.includes('tell me about') || msg.includes('what is valpovo') || msg.includes('economy') || msg.includes('industry') || msg.includes('famous') || msg.includes('agriculture') || msg.includes('farming') || msg.includes('crops')
    // DE
    || msg.includes('geschichte') || msg.includes('über') || msg.includes('einwohner') || msg.includes('gegründet') || msg.includes('wirtschaft') || msg.includes('landwirtschaft') || msg.includes('anbau'))
    return { context: CATEGORY_CONTEXTS.opcenito(db), category: 'opcenito' };

  if (msg.includes('smještaj') || msg.includes('smjestaj') || msg.includes('hotel') || msg.includes('noćen') || msg.includes('nocen') || msg.includes('apartman') || msg.includes('sobe') || msg.includes('soba') || msg.includes('sob ') || msg.includes('villa') || msg.includes('ruralni') || msg.includes('seoski') || msg.includes('seosk') || msg.includes('gospodarstv') || msg.includes('farma') || msg.includes('agro') || msg.includes('prenoćiš') || msg.includes('prenocis') || msg.includes('prenoćišt') || msg.includes('privatni smještaj') || msg.includes('iznajm')
    // EN
    || msg.includes('accommodation') || msg.includes('sleep') || msg.includes('stay') || msg.includes('room') || msg.includes('bed') || msg.includes('lodge') || msg.includes('hostel') || msg.includes('farm stay') || msg.includes('rural')
    // DE
    || msg.includes('unterkunft') || msg.includes('schlafen') || msg.includes('übernacht') || msg.includes('zimmer') || msg.includes('bauernhof'))
    return { context: CATEGORY_CONTEXTS.smjestaj(db), category: 'smjestaj' };

  if (msg.includes('jelo') || msg.includes('restoran') || msg.includes('hrana') || msg.includes('pizza') || msg.includes('burger') || msg.includes('jesti') || msg.includes('ručati') || msg.includes('ručak') || msg.includes('večer') || msg.includes('objedovati') || msg.includes('doručak') || msg.includes('kafi') || msg.includes('kav') || msg.includes('bar') || msg.includes('ugostit') || msg.includes('popiti') || msg.includes('napit') || msg.includes('radno vrij') || msg.includes('kada radi') || msg.includes('do kada rad') || msg.includes('od kada rad') || msg.includes('radi li') || msg.includes('je li otvor') || msg.includes('opening hours') || msg.includes('what time') || msg.includes('öffnungszeiten') || msg.includes('geöffnet')
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
    || msg.includes('šišanj') || msg.includes('sisanj') || msg.includes('šiša') || msg.includes('frizur')
    // EN
    || msg.includes('hairdresser') || msg.includes('haircut') || msg.includes('beauty salon')
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

    const { message, history, category: lastCategory, weather, inputMethod, voiceLang } = req.body;
    const isVoiceInput = inputMethod === 'voice';
    // effectiveMessage se može prepend-ati s constraintima za recommendation upite
    let effectiveMessage = message;

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

    // Normalizirani upit — definiran OVDJE, dostupan svim pre-gen blokovima ispod
    const msgLower = message.toLowerCase();
    // voiceLang = Whisper-detektirani jezik (najpouzdaniji) — text detekcija je fallback
    const lang = voiceLang || detectLang(message);
    const t = TR[lang] || TR.hr;

    // ── KONVERZACIJSKI NAČIN (SUSTAVNO RJEŠENJE) ──────────────────────────
    // Ako razgovor ima history (≥2 poruke = 1 razmjena) I upit nije
    // eksplicitni zahtjev za listanjem → AI vodi slobodni razgovor.
    // Pre-gen blokovi (koji prikazuju liste objekata) se preskakaju.
    // AI prima puni history + bazu → razumije kontekst i odgovara prirodno.
    const isDirectListingRequest = [
      // HR — eksplicitni zahtjevi za listanjem/popisom
      'koji postoje', 'koji ima', 'što postoji', 'sto postoji',
      'što ima u', 'sto ima u', 'prikaži', 'prikazi', 'nabroji',
      'sve restorane', 'sve hotele', 'svi restorani', 'sva smještaj',
      'lista ', 'popis ', 'pregled svih', 'pregled smještaj',
      'gdje ručati', 'gdje jesti', 'gdje spavati', 'gdje kupiti',
      'koji smještaj', 'koji restorani', 'koji kafići', 'koji klubovi',
      'što se događa', 'koji festivali', 'koji izleti',
      // EN
      'show me all', 'list all', 'what are the', 'show all', 'all restaurants',
      'all hotels', 'where to eat', 'where to stay', 'what events',
      // DE
      'zeig mir alle', 'alle restaurants', 'alle hotels', 'was gibt es',
    ].some(k => msgLower.includes(k));

    const conversationHistory = Array.isArray(history) ? history : [];
    // Konverzacijski način: history ima poruke I nije direktni zahtjev za listanjem
    const isConversationalMode = conversationHistory.length >= 2 && !isDirectListingRequest;

    // Opća pitanja o kulturi, receptima, savjetima, prirodi, putovanju —
    // preskačemo SVE pre-gen blokove i pustimo AI da odgovori slobodnim znanjem
    const isGeneralKnowledgeQuery = [
      // Recepti i kuhanje
      'kako se priprema', 'kako se kuha', 'kako se radi', 'kako se pravi',
      'kako napravit', 'kako skuhat', 'recept', 'recepti', 'sastojci', 'sastojak',
      'how to make', 'how to cook', 'how to prepare', 'recipe', 'ingredients',
      'wie macht man', 'wie kocht man', 'rezept', 'zutaten',
      // Kulturna i opća pitanja
      'kultura', 'tradicija', 'običaj', 'folklor', 'porijeklo', 'odakle dolazi',
      'što znači naziv', 'legenda', 'predaja', 'zašto se zove',
      'culture', 'tradition', 'custom', 'folklore', 'origin', 'legend',
      'kultur', 'brauchtum', 'ursprung',
      // Putovanje i praktični savjeti
      'kako doći', 'kako stići', 'kojim putem', 'kojim prijevozom',
      'how to get', 'how far', 'how to reach', 'directions',
      'wie kommt man', 'wie weit', 'wie lange dauert',
      // Hrana i pića — sastojci, jela, regionalni nazivi
      'slavonij', 'slavonsk', 'baranjsk', 'baranj', 'dravsk', 'dunavsk', 'posavsk', 'podravsk',
      'kulen', 'fiš', 'paprikaš', 'paprikas', 'čobanac', 'cobanac', 'šaranček',
      'medovač', 'rakija', 'domaće vino', 'domaći sir', 'autohtoni',
      'šaran', 'saran', 'som ', 'štuka', 'riblj', 'riba', 'luc',
      'krumpir', 'rajčic', 'mrkva', 'paprika', 'luk', 'češnjak', 'ulje', 'maslin',
      'varivo', 'gulaš', 'gulas', 'maneštra', 'juha', 'temeljac',
      'način pripreme', 'način kuhanja', 'regionalni', 'tradicionaln',
      'fish stew', 'slavonian', 'typical food', 'local food',
      // Reakcije i ispravci u razgovoru (konverzacijski kontekst)
      'nije to', 'to nije', 'nije dobar', 'nije pravi', 'nije točno', 'pogrešno',
      'drugi recept', 'bolji recept', 'pravi recept', 'što misliš', 'zar nema',
      'ima li još', 'ne slažem', 'ali zar', 'pa to je', 'pa nije',
      // Klima, priroda, geografija
      'klima', 'podneblje', 'godišnja doba', 'best time to visit',
      'beste reisezeit', 'wann besuchen',
      // Valuta, jezik, prehrana
      'valuta', 'plaćanje', 'govore li', 'koji jezik', 'currency', 'payment',
      'vegetar', 'vegan', 'bezgluten', 'alergij', 'vegetarian',
    ].some(k => msgLower.includes(k));

    // ═══════════════════════════════════════════════════════════════════
    // FAQ PRE-GEN: Tipična posjetiteljska pitanja (bez AI, bez halucinacije)
    // Odgovara PRIJE category pre-genova — ključne riječi su dovoljno specifične
    // ═══════════════════════════════════════════════════════════════════
    {
      const ml = msgLower;
      let faqReply = null;

      // 1. TURISTIČKA ZAJEDNICA / INFO PUNKT
      if (!faqReply && (ml.includes('turistič') || ml.includes('info centar') || ml.includes('info punkt') ||
          ml.includes('tourist info') || ml.includes('turistinfo') || ml.includes('tz valpov') ||
          ml.includes('turistični ured') || ml.includes('turistički ured'))) {
        faqReply =
          '🏢 **Turistička zajednica Grada Valpova**\n\n' +
          '📍 Trg kralja Tomislava 2, 31550 Valpovo\n' +
          '📞 +385 31 656 200\n' +
          '✉️ tzgvalpovo@gmail.com\n' +
          '[Otvori na karti](https://www.google.com/maps/search/?api=1&query=Turisticka+zajednica+Valpovo)\n' +
          '[Više informacija](https://tz.valpovo.hr)\n\n' +
          '🗺️ [Virtualna šetnja Valpovom](https://tz.valpovo.hr/2025/01/17/virtualna-setnja-valpovo-gdje-najbolje-pocinje/)';
      }

      // 2. BESPLATNO — što je besplatno u Valpovu
      if (!faqReply && (ml.includes('besplatno') || ml.includes('besplatn') || ml.includes('bez naplate') ||
          ml.includes('bez plaćanja') || ml.includes('što ne košta') || ml.includes('sto ne kosta') ||
          (ml.includes('free') && (ml.includes('valpov') || ml.includes('što') || ml.includes('sto'))))) {
        faqReply =
          '🎁 Besplatni sadržaji u Valpovu:\n\n' +
          '🌳 **Perivoj dvorca Prandau-Normann** — Engleski perivoj, aleje starih stabala, šetnja uz rječicu Karašicu. Otvoreno cijele godine.\n' +
          '[Otvori na karti](https://www.google.com/maps/dir/?api=1&destination=45.6589474,18.4153698)\n\n' +
          '🚴 **Biciklistička staza uz rijeku Dravu** (EuroVelo 13/6) — ~2 km od centra, panoramska vožnja uz nasip.\n\n' +
          '🚶 **Šetnja centrom** — Trg kralja Tomislava, fasade, crkve i povijesni objekti.\n\n' +
          '🅿️ **Parkiranje** — Sva parkirališta u Valpovu su besplatna.\n\n' +
          '🎣 **Ribolov** — Pristup rijekama besplatan (ribolovna dozvola se kupuje kod lokalnih udruga).\n\n' +
          'ℹ️ Za ulaznice u Muzej Valpovštine i Katančićev vremeplov obratite se TZ: 📞 +385 31 656 200';
      }

      // 3. ZA DJECU / OBITELJ
      if (!faqReply && (ml.includes('djec') || ml.includes('dijete') || ml.includes('beba') ||
          ml.includes('obitelj') || ml.includes('obiteljs') || ml.includes('kids') ||
          ml.includes('children') || ml.includes('family') || ml.includes('kinder') ||
          ml.includes('klinci') || ml.includes('malom djetetu') || ml.includes('s djecom'))) {
        faqReply =
          '👨‍👩‍👧 Valpovo s djecom i obitelju:\n\n' +
          '🌳 **Perivoj dvorca** — Sigurna, besplatna šetnja za sve uzraste.\n\n' +
          '🏛️ **Katančićev vremeplov** — Edukacijsko-interpretacijski centar, interaktivno za djecu.\n' +
          '🕐 Pon 07:00–19:00 | Uto–Pet 07:00–15:00\n\n' +
          '🎭 **Godišnji festivali za djecu:**\n' +
          '• Dječji gradski karneval (veljača) — maskiranje i zabava\n' +
          '• Uskrs u Valpovu (ožujak/travanj) — radionice, potraga za pisanicama\n' +
          '• MatijafesT (svibanj) — edukativni festival za mlade\n\n' +
          '🎾 **Sportski klubovi za djecu:** Teniska škola, Karate klub, Savate (boks)\n\n' +
          '💧 **U blizini (9 km): [Bizovačke toplice](https://www.bizovacke-toplice.hr)** — Aquapark s toboganima, idealno za obitelji!';
      }

      // 4. KOLIKO DUGO / PLAN POSJETA / TRAJANJE
      if (!faqReply && (ml.includes('koliko dugo') || ml.includes('koliko vremena') || ml.includes('koliko sati') ||
          ml.includes('how long') || ml.includes('wie lange') || ml.includes('plan posjeta') ||
          ml.includes('vikend plan') || ml.includes('jednodnevni') ||
          (ml.includes('koliko') && (ml.includes('sati') || ml.includes('dana'))))) {
        faqReply =
          '🗺️ Preporučeni plan obilaska Valpova:\n\n' +
          '⏱️ **Poludnevni posjet (3–4 sata):**\n' +
          '✅ Perivoj i Dvorac Prandau-Normann\n' +
          '✅ Katančićev vremeplov\n' +
          '✅ Šetnja centrom — Trg i okolica\n' +
          '✅ Kava u lokalnom caffe baru\n\n' +
          '☀️ **Cijeli dan (6–8 sati):**\n' +
          '✅ Sve gore + Muzej Valpovštine + ručak u restoranu\n' +
          '✅ Biciklistička staza uz Dravu\n' +
          '✅ Razgledavanje svih znamenitosti\n\n' +
          '🏕️ **Vikend u Valpovu:**\n' +
          '✅ Sve gore + Bizovačke toplice (9 km) ili Kopački rit (45 km)\n\n' +
          '💡 Za pregled programa i događanja: [tz.valpovo.hr](https://tz.valpovo.hr)';
      }

      // 5. NA KIŠU / LOŠE VRIJEME / INDOOR
      if (!faqReply && (ml.includes('kiša') || ml.includes('kišni') || ml.includes('kišno') ||
          ml.includes('loše vrij') || ml.includes('lose vrij') || ml.includes('lose vreme') ||
          ml.includes('rainy') || ml.includes('rain day') || ml.includes('unutra') ||
          ml.includes('indoor') || ml.includes('zatvoreno') || ml.includes('shelter'))) {
        faqReply =
          '🌧️ Što raditi na kišu u Valpovu:\n\n' +
          '🏛️ **Muzej Valpovštine** (unutar dvorca)\n' +
          '🕐 Pon, Čet 16:00–19:00 | Uto–Pet 10:00–12:00\n' +
          '[Otvori na karti](https://www.google.com/maps/search/?api=1&query=Muzej+Valpovstine)\n\n' +
          '📚 **Katančićev vremeplov** — Edukacijski centar\n' +
          '🕐 Pon 07:00–19:00 | Uto–Pet 07:00–15:00\n\n' +
          '☕ **Caffe barovi** — Forum, Prandau, Gradska kavana, Space\n\n' +
          '🏬 **STOP SHOP Valpovo** — 11 trgovina u zatvorenom\n' +
          '[Otvori na karti](https://www.google.com/maps/search/?api=1&query=STOP+SHOP+Valpovo)\n\n' +
          '💧 **Bizovačke toplice (9 km)** — Zatvoreni bazeni i saune, savršeni za kišni dan!\n' +
          '[Više informacija](https://www.bizovacke-toplice.hr)';
      }

      // 6. SUVENIRI / POKLONI / LOKALNI PROIZVODI
      if (!faqReply && (ml.includes('suvenir') || ml.includes('souvenir') || ml.includes('poklon') ||
          ml.includes('gift') || ml.includes('majica') || ml.includes('šalica') ||
          ml.includes('salica') || ml.includes('lokalni proizvod') || ml.includes('kulen') ||
          ml.includes('suvenirnic'))) {
        faqReply =
          '🎁 Suveniri i lokalni proizvodi iz Valpova:\n\n' +
          '🏛️ **Suvenirnica Valpovo (Katančićev vremeplov)**\n' +
          '📍 Trg kralja Tomislava, Valpovo\n' +
          'Majice, duksevi, šalice, ruksaci i magneti s motivima Valpova i M.P. Katančića — do 25€\n' +
          '📧 suvenirivalpova@gmail.com\n' +
          '[Otvori na karti](https://www.google.com/maps/search/?api=1&query=Katancic+centar+Valpovo)\n' +
          '[Naruči online](https://suvenirnica.valpovo.hr/)\n\n' +
          '🌿 **Agropark — Valpovačka zelena tržnica**\n' +
          'Lokalni OPG-ovi: med, sirevi, domaće voće i povrće, sezonski proizvodi\n' +
          '🕐 Pon–Sub 07:30–11:30\n\n' +
          '💡 Najtraženiji suvenir: majica ili šalica s motivom dvorca i domaća medovača.';
      }

      // 7. ULAZNICE / CIJENE (opći upit — ne za specifičnu lokaciju)
      if (!faqReply && (ml.includes('ulaznic') || ml.includes('cijena ulaz') || ml.includes('koliko košta ulaz') ||
          ml.includes('koliko kosta ulaz') || ml.includes('naplaćuje li se ulaz') || ml.includes('ticket price') ||
          ml.includes('admission fee') || ml.includes('eintrittspr') ||
          (ml.includes('koliko košta') && !ml.includes('toplice') && !ml.includes('restoran') && !ml.includes('hotel')))) {
        faqReply =
          '💰 Ulaznice i cijene u Valpovu:\n\n' +
          '🌳 **Perivoj dvorca Prandau-Normann** — **Besplatno**, otvoreno cijele godine\n\n' +
          '🏛️ **Muzej Valpovštine** (unutar dvorca)\n' +
          'Za aktualne cijene i radno vrijeme obratite se Turističkoj zajednici:\n' +
          '📞 +385 31 656 200 | [tz.valpovo.hr](https://tz.valpovo.hr)\n\n' +
          '📚 **Katančićev vremeplov** — za informacije o cijenama: 📞 +385 31 656 200\n\n' +
          '**Izleti u okolici:**\n' +
          '💧 Bizovačke toplice (9 km): od 10€ odrasli / od 7€ djeca\n' +
          '🦢 Kopački rit (45 km): 3€ ulaz / 13€ s vožnjom brodom';
      }

      // 8. VIRTUALNA ŠETNJA / ONLINE
      if (!faqReply && (ml.includes('virtualna') || ml.includes('virtual') || ml.includes('360') ||
          ml.includes('online šetn') || ml.includes('online setn'))) {
        faqReply =
          '🌐 Virtualna šetnja Valpovom:\n\n' +
          'Istražite Valpovo iz udobnosti svog doma — ulice, dvorac i perivoj u 360°!\n\n' +
          '[🗺️ Otvorite virtualnu šetnju](https://tz.valpovo.hr/2025/01/17/virtualna-setnja-valpovo-gdje-najbolje-pocinje/)\n\n' +
          'Više sadržaja, galerija i informacija: [tz.valpovo.hr](https://tz.valpovo.hr)';
      }

      // 9. PRISTUPAČNOST / KOLICA / INVALIDI
      if (!faqReply && (ml.includes('invalid') || ml.includes('pristupačn') || ml.includes('pristupacn') ||
          ml.includes('kolica') || ml.includes('wheelchair') || ml.includes('accessible') ||
          ml.includes('hendikep') || ml.includes('handikap') || ml.includes('disability'))) {
        faqReply =
          '♿ Pristupačnost u Valpovu:\n\n' +
          '✅ **Perivoj dvorca** — Ravni tereni, pogodno za kolica\n' +
          '✅ **STOP SHOP** — Moderni trgovački centar, potpuno pristupačan\n' +
          '✅ **Konzum Maxi, Plodine** — Pristupačan ulaz i hodnici\n\n' +
          'Za detalje o pristupačnosti muzeja, dvoraca i sportskih dvorana:\n' +
          '📞 **+385 31 656 200**\n' +
          '✉️ tzgvalpovo@gmail.com\n' +
          '[tz.valpovo.hr](https://tz.valpovo.hr)';
      }

      // 10. KONTAKT / OPĆE INFORMACIJE (fallback za generička "info" pitanja)
      if (!faqReply && (ml.includes('kontakt') || ml.includes('contact') || ml.includes('telefon tz') ||
          ml.includes('email tz') || ml.includes('info o valpovu') || ml.includes('informacije o valpov'))) {
        faqReply =
          'ℹ️ Kontakt i informacije o Valpovu:\n\n' +
          '🏢 **Turistička zajednica Grada Valpova**\n' +
          '📍 Trg kralja Tomislava 2, 31550 Valpovo\n' +
          '📞 +385 31 656 200\n' +
          '✉️ tzgvalpovo@gmail.com\n' +
          '[Više informacija](https://tz.valpovo.hr)\n\n' +
          '🌐 [Virtualna šetnja](https://tz.valpovo.hr/2025/01/17/virtualna-setnja-valpovo-gdje-najbolje-pocinje/)';
      }

      if (faqReply) {
        return res.status(200).json({
          reply: faqReply,
          category: category || 'opcenito',
          suggestions: getSuggestions(category || 'opcenito'),
          images: []
        });
      }
    }
    // ═══════════════════════════════════════════════════════════════════

    // Događanja listing: filtriraj prošle i generiraj direktno bez AI
    // Ako korisnik pita za SPECIFIČNU manifestaciju po imenu → preskoči listing, pusti AI da odgovori konkretno
    const specificEventQuery = ['fišijad','fisijad','matijafest','rockaraj','reunited','vašar','vasar','ljeto valpov','craft beer','staza zdravlja','festival sira','ribljeg paprikaš','ribljeg paprikas','kuhanje fiš','kuhanje fis','katančić','katancic','matija petar','matiji petru'].some(k => msgLower.includes(k));
    // ── NOVOSTI pre-gen blok (skrapani sadržaj s thumbnailima) ─────────────
    const wantsNovosti = ['novosti', 'vijesti', 'aktualnost', 'što je novo', 'sto je novo',
      'što se nedavno', 'što se zadnje', 'news', 'aktualno', 'najnovije']
      .some(k => msgLower.includes(k));

    if (wantsNovosti && !isConversationalMode && !isGeneralKnowledgeQuery && scrapedContent?.novosti_tz?.length) {
      const ts = scrapedContent.meta?.zadnje_azuriranje?.substring(0, 10) || '';
      let reply = `📰 Najnovije vijesti iz Valpova${ts ? ` (ažurirano ${ts})` : ''}:\n\n`;

      for (const n of scrapedContent.novosti_tz.slice(0, 6)) {
        if (n.IMAGE_URL) reply += `[[IMG:${n.IMAGE_URL}]]`;
        reply += `**${n.naslov}**\n`;
        if (n.datum) reply += `📅 ${n.datum}\n`;
        if (n.kratki_opis) reply += `${n.kratki_opis.substring(0, 180)}...\n`;
        reply += `[Pročitaj više](${n.link})\n`;
        reply += `[[CLR]]\n\n`;
      }

      if (scrapedContent.novosti_grad?.length) {
        reply += `**Vijesti Grada Valpova:**\n`;
        for (const n of scrapedContent.novosti_grad.slice(0, 3)) {
          reply += `• **${n.naslov}**${n.datum ? ` (${n.datum})` : ''} — [Pročitaj](${n.link})\n`;
        }
      }

      return res.status(200).json({ reply, category: 'dogadanja', suggestions: getSuggestions('dogadanja') });
    }

    if (category === 'dogadanja' && !specificEventQuery && !isRecommendationQuery && !isDetailQuery && !isGeneralKnowledgeQuery && !isConversationalMode && matched) {
      const currentMonth = new Date().getMonth() + 1;
      const currentDay   = new Date().getDate();
      const monthNames   = ['siječnju','veljači','ožujku','travnju','svibnju','lipnju',
                            'srpnju','kolovozu','rujnu','listopadu','studenom','prosincu'];

      // Sve predstojeće (kraj ove godine)
      const upcoming = db.dogadanja.filter(e => eventMaxMonth(e.vrijeme) >= currentMonth);
      // Samo ovomjesečne (max >= trenutni I min <= trenutni)
      const thisMonthEvents = upcoming.filter(e => eventMinMonth(e.vrijeme) <= currentMonth);

      // Detektira preciznost upita
      const wantsThisWeek = ['ovaj tjedan','ovog tjedna','ovaj vikend','ovog vikenda',
        'this week','diese woche','danas','today','večeras','tonight','sutra','tomorrow']
        .some(k => msgLower.includes(k));
      const wantsThisMonth = !wantsThisWeek && ['ovaj mjese','ovog mjese','this month',
        'diesen monat','u ovom mjes'].some(k => msgLower.includes(k));

      const helper = (e) => {
        let s = '';
        if (e.IMAGE_URL) s += `[[IMG:${e.IMAGE_URL}]]`;
        s += `**${e.naziv}**\n`;
        s += `📅 ${e.vrijeme}\n`;
        s += `${e.opis}\n`;
        s += e.web ? `[${t.more}](${e.web})\n` : `[${t.tzMore}](https://tz.valpovo.hr/manifestacije/)\n`;
        s += `[[CLR]]\n\n`;
        return s;
      };

      let reply = '';

      if (wantsThisWeek || wantsThisMonth) {
        // Precizni upit: ovaj tjedan / ovaj mjesec
        if (thisMonthEvents.length > 0) {
          reply = wantsThisWeek
            ? `🗓️ Evo što se zbiva u Valpovu ovaj tjedan / ovog vikenda (${currentDay}. ${monthNames[currentMonth - 1]}):\n\n`
            : `🗓️ Manifestacije u Valpovu ovog mjeseca (${monthNames[currentMonth - 1]}):\n\n`;
          for (const e of thisMonthEvents) reply += helper(e);
          const next = upcoming.find(e => !thisMonthEvents.includes(e));
          if (next) reply += `\n📌 Sljedeća nadolazeća: **${next.naziv}** — 📅 ${next.vrijeme}`;
        } else {
          // Nema ništa ovaj tjedan/mjesec
          reply = wantsThisWeek
            ? `🗓️ Ovog tjedna (${currentDay}. ${monthNames[currentMonth - 1]}) u Valpovu nema planiranih manifestacija.\n\n`
            : `🗓️ U ${monthNames[currentMonth - 1]} u Valpovu nema planiranih manifestacija.\n\n`;
          if (upcoming.length > 0) {
            reply += `Sljedeće nadolazeće manifestacije:\n\n`;
            for (const e of upcoming.slice(0, 2)) reply += helper(e);
          }
        }
      } else {
        // Opći upit — prikaži sljedećih MAX 5, ostatak najavi
        const MAX_SHOWN = 5;
        const shown = upcoming.slice(0, MAX_SHOWN);
        if (shown.length) {
          reply = `${t.upcoming}:\n\n`;
          for (const e of shown) reply += helper(e);
          if (upcoming.length > MAX_SHOWN) {
            const rest = upcoming.slice(MAX_SHOWN).map(e => `${e.naziv} (${e.vrijeme})`).join(', ');
            reply += `📌 I još ${upcoming.length - MAX_SHOWN}: ${rest}\n`;
          }
        } else {
          reply = `${t.noEvents} [tz.valpovo.hr](https://tz.valpovo.hr/manifestacije/)`;
        }
      }

      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // Smještaj listing: generiraj direktno bez AI (sprječava hallucination)
    // matched: false = fallback (npr. vremenski upit) → NE aktiviraj pre-gen
    if (category === 'smjestaj' && !isRecommendationQuery && !isDetailQuery && !isGeneralKnowledgeQuery && !isConversationalMode && matched) {
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
        { key: 'hoteli',           icon: '🏨', label: t.hotels,   show: showAll || wantsHotel },
        { key: 'ruralni_smjestaj', icon: '🌿', label: t.rural,    show: showAll || wantsRuralni },
        { key: 'apartmani',        icon: '🏠', label: t.apts,     show: showAll || wantsApartman },
        { key: 'prenocista',       icon: '🛏', label: t.pensions, show: showAll || wantsPrenociste },
        { key: 'sobe',             icon: '🔑', label: t.rooms,    show: showAll || wantsSobe },
      ];

      const activeSections = allSections.filter(sec => sec.show);

      // Dinamičan uvod ovisno o upitu (showAll ima prioritet)
      let reply = '';
      if (showAll)              reply = `${t.allAccom}\n\n`;
      else if (wantsSobe)      reply = `${t.rooms} ${t.inValp}:\n\n`;
      else if (wantsHotel)     reply = `${t.hotels} ${t.inValp}:\n\n`;
      else if (wantsApartman)  reply = `${t.apts} ${t.inValp}:\n\n`;
      else if (wantsRuralni)   reply = `${t.rural} ${t.inValp}:\n\n`;
      else if (wantsPrenociste) reply = `${t.pensions} ${t.inValp}:\n\n`;

      for (const { key, icon, label } of activeSections) {
        const items = s[key];
        if (!items?.length) continue;
        if (showAll) reply += `${icon} **${label}**\n\n`;
        for (const item of items) {
          if (item.IMAGE_URL) reply += `[[IMG:${item.IMAGE_URL}]]`;
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          reply += `[${t.map}](${item.maps_url})\n`;
          reply += item.web ? `[${t.more}](${item.web})\n` : `[${t.tzMore}](https://tz.valpovo.hr/smjestaj-u-valpovu/)\n`;
          reply += `[[CLR]]\n\n`;
        }
      }
      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // Znamenitosti listing: generiraj direktno bez AI
    // Specifični upit (dvorac, muzej, kula...) → pusti AI da odgovori detaljno
    const specificZnaQuery = ['dvorac','prandau','muzej','kula','kazalište','kazaliste','pivovara','konjušnice','konjusnice','pučka škola','pucka skola','memorijaln','centar kulture','katančić','katancic','fortuna'].some(k => message.toLowerCase().includes(k));
    if (category === 'znamenitosti' && !specificZnaQuery && !isRecommendationQuery && !isDetailQuery && !isGeneralKnowledgeQuery && !isConversationalMode && matched) {
      const zna = db.znamenitosti || [];
      let reply = 'Valpovo krije niz kulturnih i povijesnih znamenitosti. Evo kompletnog pregleda:\n\n';
      for (const item of zna) {
        if (item.IMAGE_URL) reply += `[[IMG:${item.IMAGE_URL}]]`;
        reply += `**${item.naziv}**\n`;
        if (item.opis) reply += `${item.opis}\n`;
        if (item.radno_vrijeme) reply += `🕐 ${item.radno_vrijeme}\n`;
        if (item.adresa) reply += `📍 ${item.adresa}\n`;
        reply += `[${t.map}](${item.maps_url})\n`;
        reply += item.web ? `[${t.more}](${item.web})\n` : `[${t.tzMore}](https://tz.valpovo.hr/znamenitosti/)\n`;
        reply += `[[CLR]]\n\n`;
      }
      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // Gastronomija listing: generiraj direktno bez AI (eliminira hallucination restorana)
    // Ako korisnik pita za radno vrijeme ili specifičan detalj → preskoči listing, pusti AI s kontekstom
    // NAPOMENA: isRecommendationQuery se više NE preskače — pre-gen sprječava halucinaciju čak i za preporuke
    const radnoVrijemeQuery = ['radno vrij','kada radi','radi li','do kada rad','od kada rad','opening hours','what time','öffnungszeiten','geöffnet','otvoreno','zatvoreno'].some(k => message.toLowerCase().includes(k));
    const isGastroListing = category === 'gastronomija' && !radnoVrijemeQuery && !isDetailQuery && !isGeneralKnowledgeQuery && !isConversationalMode && matched;
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
      const wantsDining = ['restoran','ručati','ručak','večerati','večera','večer','jesti','objedovati',
        'pizza','burger','hrana','restaurant','lunch','dinner','eat','food',
        'speisen','mittagessen','abendessen','gaststätte'].some(k => msgLower.includes(k));
      // Café detekcija — sve kao zasebne riječi da ne matchamo 'baranjski', 'kavo' (uzvik)...
      const wantsCafe = /\b(bar|kava|kave|kavu|kavom|kafić|kafic|kafiću|kafica|caffe|café|kafe|coffee|kaffee)\b/i.test(message)
        || msgLower.includes('popiti') || msgLower.includes('napit');

      if (isRecommendationQuery) {
        // AI preporučuje jela i atmosferu, ali MORA koristiti samo stvarne objekte iz baze
        // → prepend constraint liste u effectiveMessage; listing se NE vraća, ide na AI streaming
        const pool = wantsCafe ? caffeBarovi : [...restorani, ...brzaHrana];
        const poolList = pool.map(g =>
          `- ${g.naziv}${g.opis ? ': ' + g.opis : ''}${g.adresa ? ' | ' + g.adresa : ''}`
        ).join('\n');
        const langNames = { hr:'Croatian', en:'English', de:'German', it:'Italian', fr:'French', es:'Spanish' };
        const replyLang = langNames[lang] || 'Croatian';
        effectiveMessage = `[CONSTRAINT: recommend ONLY from these real places in Valpovo, do not invent others. Reply in ${replyLang}.]\n${poolList}\n\nUser question: ${message}`;
        // Nema return — pada kroz na AI streaming ispod

      } else {
        // Standardni listing: prikaži sve objekte grupirane po tipu
        const showAll_gastro = (wantsDining && wantsCafe) || (!wantsDining && !wantsCafe);
        const showRestorani   = showAll_gastro || wantsDining;
        const showBrzaHrana   = showAll_gastro || wantsDining;
        const showCaffeBarovi = showAll_gastro || wantsCafe;

        let reply = showAll_gastro
          ? `${t.allGastro}\n\n`
          : wantsDining
            ? `${t.dining}\n\n`
            : `${t.cafes}\n\n`;

        if (restorani.length && showRestorani) {
          reply += `🍽️ **${t.rests}**\n\n`;
          for (const item of restorani) {
            if (item.IMAGE_URL) reply += `[[IMG:${item.IMAGE_URL}]]`;
            reply += `**${item.naziv}**\n`;
            if (item.opis) reply += `${item.opis}\n`;
            if (item.adresa) reply += `📍 ${item.adresa}\n`;
            if (item.telefon) reply += `📞 ${item.telefon}\n`;
            reply += `[${t.map}](${mapsUrl(item)})\n`;
            if (item.web) reply += `[${t.more}](${item.web})\n`;
            reply += `[[CLR]]\n\n`;
          }
        }
        if (brzaHrana.length && showBrzaHrana) {
          reply += `🍕 **${t.fastfood}**\n\n`;
          for (const item of brzaHrana) {
            if (item.IMAGE_URL) reply += `[[IMG:${item.IMAGE_URL}]]`;
            reply += `**${item.naziv}**\n`;
            if (item.opis) reply += `${item.opis}\n`;
            if (item.adresa) reply += `📍 ${item.adresa}\n`;
            reply += `[${t.map}](${mapsUrl(item)})\n`;
            if (item.web) reply += `[${t.more}](${item.web})\n`;
            reply += `[[CLR]]\n\n`;
          }
        }
        if (caffeBarovi.length && showCaffeBarovi) {
          reply += `☕ **${t.cafesH}**\n\n`;
          for (const item of caffeBarovi) {
            if (item.IMAGE_URL) reply += `[[IMG:${item.IMAGE_URL}]]`;
            reply += `**${item.naziv}**\n`;
            if (item.opis) reply += `${item.opis}\n`;
            reply += `[${t.map}](${mapsUrl(item)})\n`;
            if (item.web) reply += `[${t.more}](${item.web})\n`;
            reply += `[[CLR]]\n\n`;
          }
        }

        return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
      }
    }

    // Sport listing: generiraj direktno bez AI (opći upit o sportu/klubovima)
    const isSportListing = category === 'sport' && !isRecommendationQuery && !isDetailQuery && !isGeneralKnowledgeQuery && !isConversationalMode && matched;
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
          if (k.maps_url) reply += `[${t.map}](${k.maps_url})\n`;
          if (k.web) reply += `[${t.more}](${k.web})\n`;
          reply += '\n';
        }
      }
      if (s?.objekti?.length) {
        reply += '**🏟️ Sportski objekti**\n\n';
        for (const o of s.objekti) {
          reply += `**${o.naziv}**\n`;
          if (o.opis) reply += `${o.opis}\n`;
          if (o.maps_url) reply += `[${t.map}](${o.maps_url})\n`;
          if (o.web) reply += `[${t.more}](${o.web})\n`;
          reply += '\n';
        }
      }
      if (s?.rekreacija?.length) {
        reply += '**🚴 Rekreacija i aktivni odmor**\n\n';
        for (const r of s.rekreacija) {
          reply += `**${r.naziv}**\n`;
          if (r.opis) reply += `${r.opis}\n`;
          if (r.maps_url) reply += `[${t.map}](${r.maps_url})\n`;
          reply += '\n';
        }
      }
      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // Okolica listing: generiraj direktno bez AI samo kad korisnik traži opći popis izleta
    // (sadrži 'izlet') — specifična pitanja (vinske ceste, Kopački rit...) idu na AI
    const isOkolicaListing = category === 'okolica' && msgLower.includes('izlet') && !isRecommendationQuery && !isDetailQuery && !isGeneralKnowledgeQuery && !isConversationalMode && matched;
    if (isOkolicaListing) {
      const izleti = db.okolica?.izleti || [];
      let reply = `${t.excursions}\n\n`;
      for (const item of izleti) {
        reply += `**${item.naziv}**\n`;
        if (item.udaljenost) reply += `📍 ${item.udaljenost}\n`;
        if (item.opis)       reply += `${item.opis}\n`;
        if (item.cijena)     reply += `💶 ${item.cijena}\n`;
        reply += `[${t.map}](${item.maps_url})\n`;
        if (item.web)        reply += `[${t.more}](${item.web})\n`;
        reply += '\n';
      }
      return res.status(200).json({ reply, category, suggestions: getSuggestions(category), images: extractImages(context) });
    }

    // === USLUGE PRE-GEN ===
    // Zdravstvo, banke, auto servisi, taksi, benzinske, frizeraji, parking
    // Sprječava AI haluciniranje naziva institucija koje NE postoje u Valpovu
    const isUslugeCategory = ['usluge','benzinske','frizeraji','parking'].includes(category);
    if (isUslugeCategory && !isRecommendationQuery && !isDetailQuery && !isGeneralKnowledgeQuery && !isConversationalMode && matched) {
      const u = db.usluge;
      const ml = msgLower;
      let reply = '';

      if (ml.includes('ljekar') || ml.includes('apoteka') || ml.includes('ljekarn') ||
          ml.includes('zdravst') || ml.includes('doktor') || ml.includes('liječnik') ||
          ml.includes('hitna') || ml.includes('doctor') || ml.includes('pharmacy') || ml.includes('farmac')) {
        reply = `${t.health}\n\n`;
        for (const item of u.zdravstvo || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          const murl = item.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.naziv + ' Valpovo')}`;
          reply += `[${t.map}](${murl})\n\n`;
        }

      } else if (ml.includes('bankomat') || ml.includes('atm') || ml.includes('gotovina') || ml.includes('cash')) {
        reply = `${t.atm}\n\n`;
        for (const item of u.bankomati || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          reply += `[${t.map}](${item.maps_url})\n\n`;
        }

      } else if (ml.includes('banka') || ml.includes('banke') || ml.includes('pošta') ||
                 ml.includes('posta') || ml.includes('bank') || ml.includes('post office')) {
        reply = `${t.banks}\n\n`;
        for (const item of u.banke_i_posta || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          if (item.radno_vrijeme) reply += `🕐 ${item.radno_vrijeme}\n`;
          if (item.maps_url) reply += `[${t.map}](${item.maps_url})\n`;
          reply += '\n';
        }

      } else if (ml.includes('auto') || ml.includes('servis') || ml.includes('mehanik') ||
                 ml.includes('popravak') || ml.includes('vulkan') || ml.includes('autocentar') ||
                 ml.includes('car repair') || ml.includes('mechanic') || ml.includes('werkstatt')) {
        reply = `${t.autoServ}\n\n`;
        for (const item of u.auto_servisi || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          const murl = item.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.naziv + ' Valpovo')}`;
          reply += `[${t.map}](${murl})\n\n`;
        }

      } else if (ml.includes('taksi') || ml.includes('taxi') || ml.includes('cab')) {
        reply = `${t.taxi}\n\n`;
        for (const item of u.taksi || []) {
          reply += `**${item.naziv}**\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          reply += '\n';
        }

      } else if (ml.includes('autobus') || ml.includes('kolodvor') || ml.includes('vozni red')) {
        reply = `${t.bus}\n\n`;
        for (const item of u.autobusni_prijevoz || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          if (item.maps_url) reply += `[${t.map}](${item.maps_url})\n`;
          reply += '\n';
        }

      } else if (category === 'benzinske' || ml.includes('benzin') || ml.includes('goriv') || ml.includes('pumpa')) {
        reply = `${t.fuel}\n\n`;
        for (const item of u.benzinske_stanice || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          reply += `[${t.map}](${item.maps_url})\n\n`;
        }

      } else if (category === 'frizeraji' || ml.includes('frizer') || ml.includes('kozmet') ||
                 ml.includes('barber') || ml.includes('brica') ||
                 ml.includes('šišanj') || ml.includes('sisanj') || ml.includes('šiša') || ml.includes('frizur')) {
        reply = `${t.barbers}\n\n`;
        for (const item of u.frizeraji || []) {
          reply += `**${item.naziv}**\n`;
          if (item.adresa) reply += `📍 ${item.adresa}\n`;
          if (item.telefon) reply += `📞 ${item.telefon}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          reply += `[${t.map}](${item.maps_url})\n\n`;
        }
        reply += `\nℹ️ U Valpovu djeluje ukupno ~20 frizerskih salona. Za kompletnu listu s radnim vremenima posjetite [Google Maps](https://www.google.com/maps/search/frizerski+salon+Valpovo).\n`;

      } else if (category === 'parking' || ml.includes('parking') || ml.includes('parkir')) {
        reply = `${t.parking}\n\n`;
        for (const item of u.parkiralista || []) {
          reply += `**${item.naziv}**\n`;
          if (item.opis) reply += `${item.opis}\n`;
          if (item.napomena) reply += `ℹ️ ${item.napomena}\n`;
          reply += `[${t.map}](${item.maps_url})\n\n`;
        }

      } else {
        // Opći pregled svih usluga
        reply = `${t.svcOverview}\n\n`;
        reply += '🏥 **Zdravstvo:** Dom zdravlja (📞 194 Hitna), Ljekarna Srce (📞 031 651 350), Ljekarna Kalenić (📞 031 650 290)\n\n';
        reply += '🏦 **Banke:** Slatinska banka, OTP banka, HPB, PBZ · 📮 Hrvatska pošta\n\n';
        reply += '🏧 **Bankomati:** HPB (24/7), Slatinska, OTP, PBZ\n\n';
        reply += '⛽ **Benzinske:** INA, Petrol, Euro Petrol/NTL\n\n';
        reply += '🔧 **Auto servisi:** Autocentar Ivica, Galičić, Valentić, Dabo, Karlo servis\n\n';
        reply += '🚕 **Taksi:** Panda 📞 099 666 000 9 · Goran 📞 +385 95 310 3100\n\n';
        reply += '🚌 **Autobus:** Kolodvor Valpovo — 22 linije/dan prema Osijeku\n\n';
        reply += '💈 **Frizeraji:** Salon Erika, Salon Iris, Beauty, Barbershop\n\n';
        reply += '🅿️ **Parkiranje:** Sve besplatno — uz dvorac, Trg Tomislava, STOP SHOP\n\n';
        reply += `${t.askMore}`;
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
🚫 APSOLUTNA ZABRANA ĆIRILICE — NEPROMJENJIVO PRAVILO BR. 1:
Bez iznimke, bez obzira na jezik korisnika — NIKAD ne koristi ćirilično pismo (а б в г д... кирилица).
Uvijek isključivo latinično pismo (a b c č ć d đ...). Čak i ako korisnik piše ćirilicom — odgovaraj latiničnim pismom.
Ovo pravilo ima VIŠI prioritet od svih ostalih pravila u ovom promptu.
${isVoiceInput ? `\n🎤 GLASOVNI UNOS — DODATNA PRAVILA (inputMethod=voice):
- Korisnik govori glasom — transkripcija može imati greške u dijakritičkim znakovima.
- Odgovor MORA biti isključivo latiničnim pismom — bit će čitan naglas (TTS sinteza).
- Piši kratke, jasne rečenice. Izbjegavaj složene markdown strukture.
- Emojiiji su OK, tablice NE.` : ''}
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

═══════════════════════════════════════════
OSNOVNA LOGIKA — DVA NAČINA RADA
═══════════════════════════════════════════

NAČIN 1 — LOKALNA BAZA (strogi mod):
Primjenjuje se kada korisnik pita o KONKRETNIM VALPOVAČKIM OBJEKTIMA:
• restorani, kafići, smještaj, hoteli, apartmani
• znamenitosti, muzeji, dvorci, crkve
• trgovine, servisi, apoteke, liječnici, pošta, banke
• sportski klubovi i objekti u Valpovu
• adrese, radno vrijeme, cijene, kontakti, telefoni
• događanja i manifestacije u Valpovu

PRAVILA NAČINA 1:
→ Koristi ISKLJUČIVO podatke iz baze podataka. Ništa više.
→ NIKAD ne izmišljaj nazive, adrese, telefonske brojeve, web stranice.
→ NIKAD ne navodi objekte koji NISU u bazi — čak i ako "znaš" da postoje.
→ Ako objekt nije u bazi: "Trenutno nemam te podatke u bazi. Za aktualne informacije obratite se Turističkoj zajednici Valpovo: [tz.valpovo.hr](https://tz.valpovo.hr) ili tel. 031 651 256."

───────────────────────────────────────────
NAČIN 2 — OPĆE ZNANJE (slobodni mod):
Primjenjuje se za SVA OPĆA PITANJA koja nisu vezana uz konkretne valpovačke objekte:
• recepti i priprema jela: fiš paprikaš, kulen, čobanac, sarma, šaran na žaru...
• slavonska i baranjska gastronomija: sastojci, tradicija, priprema, razlike (dravski/baranjski/dunavski fiš...)
• povijest, kultura i tradicija: Slavonije, Baranje, Đakova, Osijeka, Vukovara, regije općenito
• priroda i ekologija: Kopački rit, Drava, Dunav, Baranjske šume, zaštićene vrste
• vinski putovi, gastro rute, izleti, agroturizam u regiji
• geografija i udaljenosti: koliko je daleko Osijek, Đakovo, Baranjsko Petrovo Selo, Beč...
• putovanje i prijevoz: kako doći u Valpovo, vlakovi, autobusi, autocesta
• jezik, običaji, folklor, nošnje, glazba, fešta
• opća pitanja o vremenu, aktivnostima, preporuke za region
• razgovorni kontekst — reakcije na prethodne odgovore, follow-up pitanja

PRAVILA NAČINA 2:
→ Odgovaraj kao iskusan poznavatelj SLAVONIJE, BARANJE i kontinentalne Hrvatske.
→ Geografski kontekst: Slavonija + Baranja + kontinentalna Hrvatska (ne samo Valpovo).
→ Koristi svoje opće znanje bez ograničenja — davaj precizne, korisne i informativne odgovore.
→ NIKAD ne reci "nemam te podatke" za opće znanje — to je AI znanje, ne lokalna baza.
→ NIKAD ne listaš valpovačke objekte kada je pitanje opće prirode.
→ Za recepte: navedi točne sastojke i postupak. Za baranjski fiš — BEZ krumpira, BEZ mrkve, BEZ rajčice, BEZ maslinovog ulja.
→ Slobodno usporedi, preporuči, objasni razlike (npr. dravski vs. baranjski fiš paprikaš).
→ Možeš vezati odgovor uz Valpovo i regiju kada je prirodno (npr. "U ovom dijelu Slavonije...").

═══════════════════════════════════════════

NIKAD ne izmišljaj nazive, adrese, telefonske brojeve lokalnih valpovačkih objekata koji nisu u bazi.

Baza podataka:
${JSON.stringify(stripImages(context))}
${buildScrapedSection()}
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
        { role: "user", content: effectiveMessage }
      ],
      temperature: isRecommendationQuery ? 0.5 : 0.3,
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

    console.error("CHAT ERROR:", error.message, error.stack);

    if (!res.headersSent) {
      // Greška se dogodila PRIJE SSE headera — vrati čisti JSON koji frontend može parsirati
      return res.status(500).json({ error: 'Greška servera', details: error.message });
    }

    // Greška se dogodila TIJEKOM SSE streaminga — pošalji error frame i završi stream
    try {
      res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
      res.end();
    } catch { /* stream već završen */ }

  }

}

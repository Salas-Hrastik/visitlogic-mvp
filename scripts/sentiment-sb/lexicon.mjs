/**
 * Hrvatski leksikon sentimenta + taksonomija + geo-filtar.
 *
 * VAZNO: ovo je leksicki MVP klasifikator - u specifikaciji (pogl. 5.2) naveden
 * kao PRICUVA, ne kao preporuceni pristup. Preporuceni pristup je model iz
 * obitelji BERTic fino podesen na oznacenom skupu. Leksikon ovdje postoji da bi
 * prva iteracija bila stvarna i provjerljiva, a ne da bi zamijenio model.
 * Njegova tocnost NIJE izmjerena - svaki rezultat nosi tu ogradu.
 *
 * Podudaranje je po korijenu rijeci (prefiks), jer hrvatski ima bogatu fleksiju.
 */

// --- polaritet: korijen -> tezina (-1..1) ---
export const POZITIVNO = {
  'izvrsn':0.9,  'izvrsno':0.9,  'odlicn':0.9,  'sjajn':0.8,  'fantasti':0.9,
  'savrsen':0.9,  'vrhunsk':0.9,  'predivn':0.85,  'prekrasn':0.85,  'divn':0.8,
  'lijep':0.6,  'ljepot':0.6,  'ugodn':0.6,  'srdacn':0.7,  'ljubazn':0.75,
  'gostoljub':0.8,  'toplin':0.6,  'prijatelj':0.5,  'pohval':0.7,  'nagrad':0.6,
  'priznanj':0.6,  'uspjeh':0.7,  'uspjesn':0.7,  'pobjed':0.7,  'prvak':0.7,
  'zlatn':0.6,  'rekord':0.5,  'napred':0.6,  'obnovlj':0.6,  'uredjen':0.6,
  'ulaganj':0.4,  'investicij':0.4,  'otvoren':0.35,  'besplatn':0.5,  'popust':0.4,
  'povoljn':0.5,  'kvalitetn':0.7,  'bogat':0.4,  'raznovrs':0.5,  'zanimljiv':0.55,
  'atraktivn':0.6,  'popularn':0.5,  'omiljen':0.6,  'preporu':0.7,  'zadovolj':0.7,
  'radost':0.7,  'veselj':0.7,  'ponos':0.6,  'zahval':0.7,  'podrsk':0.5,
  'pomo':0.4,  'suradnj':0.4,  'sigurn':0.5,  'cist':0.6,  'uredn':0.6,
  'ukusn':0.85,  'domac':0.45,  'autenti':0.6,  'vrijedn':0.5,  'korist':0.4,
  'unaprij':0.5,  'poboljs':0.6,  'rijesen':0.6,  'zavrsen':0.4,  'povecan':0.35,
  'rekonstrukcij':0.35,  'sanacij':0.3,  'donacij':0.5,  'volonter':0.5,  'tradicij':0.35
};

export const NEGATIVNO = {
  'lose':-0.8,  'losij':-0.7,  'uzasn':-0.95,  'katastrof':-0.95,  'grozn':-0.9,
  'ocajn':-0.9,  'sramot':-0.9,  'skandal':-0.85,  'afer':-0.7,  'korupcij':-0.85,
  'kriminal':-0.8,  'krad':-0.8,  'prijevar':-0.8,  'problem':-0.55,  'poteskoc':-0.5,
  'kriz':-0.7,  'propad':-0.8,  'propust':-0.6,  'zanemar':-0.65,  'zapusten':-0.75,
  'rusevin':-0.7,  'devastir':-0.8,  'unisten':-0.8,  'ostecen':-0.6,  'kvar':-0.55,
  'prljav':-0.8,  'smrad':-0.85,  'smece':-0.6,  'otpad':-0.35,  'zagadj':-0.75,
  'guzv':-0.5,  'zastoj':-0.5,  'nesre':-0.8,  'sudar':-0.7,  'ozlije':-0.75,
  'poginu':-0.95,  'smrt':-0.9,  'pozar':-0.75,  'poplav':-0.75,  'stet':-0.65,
  'opasn':-0.7,  'rizik':-0.45,  'nasilj':-0.85,  'napad':-0.8,  'pljack':-0.8,
  'uhic':-0.5,  'prekrsaj':-0.5,  'prosvjed':-0.5,  'nezadovolj':-0.8,  'pritu':-0.7,
  'prigovor':-0.6,  'zalb':-0.6,  'kritik':-0.55,  'svad':-0.55,  'sukob':-0.7,
  'optuz':-0.6,  'istrag':-0.45,  'poskup':-0.7,  'preskup':-0.85,  'nedostat':-0.6,
  'manjak':-0.6,  'zatvor':-0.5,  'ukid':-0.6,  'otkaz':-0.7,  'nezaposlen':-0.7,
  'iseljav':-0.8,  'odlaz':-0.4,  'smanjen':-0.4,  'kasnj':-0.55,  'odgod':-0.5,
  'blokad':-0.6,  'neuredn':-0.7,  'neugodn':-0.65,  'neljubazn':-0.85,  'cekanj':-0.5,
  'rupa':-0.6,  'ostecenj':-0.6,  'poplavljen':-0.75,  'zarasl':-0.65,  'mrak':-0.5,
  'upozor':-0.4,  'zabrin':-0.6,  'strah':-0.7,  'tuzn':-0.7,  'razocaran':-0.85
};

// --- pojacivaci i umanjivaci ---
export const POJACIVACI = { 'vrlo':1.5,'jako':1.5,'izuzetno':1.8,'iznimno':1.8,'potpuno':1.6,'apsolutno':1.8,'izrazito':1.6,'posebno':1.3,'najvis':1.5,'previse':1.4,'strasno':1.7,'uzasno':1.7 };
export const UMANJIVACI = { 'malo':0.6,'donekle':0.6,'pomalo':0.6,'relativno':0.7,'uglavnom':0.8,'djelomicno':0.6,'ponekad':0.7 };
export const NEGACIJE = ['ne','nije','nisu','nema','nikad','nikada','nista','niti','bez','ni'];

// --- ironija: obrasci koji snizavaju pouzdanost (spec. 3.4) ---
export const IRONIJA_OBRASCI = [
  /\bbas\s+(super|sjajno|odlicno|krasno)\b/i,
  /\bsvaka\s+cast\b.{0,40}\b(ali|samo|osim)\b/i,
  /\bnaravno\s+da\b.{0,30}\bne\b/i,
  /"[^"]{3,30}"/,
  /\bkao\s+i\s+uvijek\b/i
];

// --- taksonomija L1 (spec. 3.2) ---
export const KATEGORIJE = {
  G: { naziv:'Gastronomija', kljucne:['restoran','kavan','kafi','bistro','konob','pizzer','slastic','pekar','jelovnik','gastro','kuhinj','kuhar','ugostitelj','ugostiteljsk','jelo','jela','obrok','kulen','cvarc','sarma','fiseku','degustacij','vinarij','pivovar'] },
  S: { naziv:'Smještaj', kljucne:['hotel','hostel','apartman','prenoc','nocenj','kampiral','kamp','smjestaj','recepcij','turisticki apartman','kuca za odmor','gostiju','gostima','turista','turisti'] },
  A: { naziv:'Atrakcije i baština', kljucne:['tvrdjav','muzej','galerij','spomenik','bastin','izlozb','knjiznic','brlic','mazuranic','korzo','setnic','sava','park','kazalis','kultur','samostan','poloj','franjevac','znamenit','arheolos'] },
  D: { naziv:'Događanja', kljucne:['festival','manifestacij','koncert','sajam','priredb','dogadjanj','nastup','proslav','brodsko kolo','karneval','turnir','utakmic','natjecanj','smotr','recital','predstav','obljetnic','izlozba'] },
  K: { naziv:'Komunalno i javni prostor', kljucne:['komunal','cistoc','smece','otpad','zelenil','kosnj','rasvjet','odvoz','deponij','kanalizacij','vodovod','plocnik','fontan','javne povrsin','uredjenj okolisa'] },
  P: { naziv:'Promet i parking', kljucne:['prometn','parking','parkir','kolnik','semafor','autobus','kolodvor','vlakom','zeljeznic','biciklist','mostu','granicni prijelaz','kamion','obilaznic','autocest','rekonstrukcij ceste','prometa'] },
  B: { naziv:'Sigurnost', kljucne:['policij','sigurnost','nesrec','sudar','kradj','proval','napada','tucnjav','nasilj','vatrogas','hitna pomoc','ozlijed','poginu','pozar','kriminal','uhicen'] },
  I: { naziv:'Informacije i pristupačnost', kljucne:['turisticka zajednic','turisticki ured','signalizacij','pristupacn','invalid','rampa','turisticki vodic','radno vrijeme','info pult'] },
  O: { naziv:'Opći gradski sentiment', kljucne:['gradonacelnik','gradsko vijec','proracun','zaposljav','poduzetnik','skole','vrtic','bolnic','zdravstv','stanovnistv','iseljav','demografij','gradska uprav','izbori','eu fond','investicij'] }
};

// --- geo-filtar (spec. 3.1) ---
// GRAD: objava se doista odnosi na grad Slavonski Brod.
export const GEO_GRAD = ['slavonski brod','slavonskom brodu','slavonskog broda','slavonskim brodom','slavonskobrodsk','brodjan','tvrdjava brod','brodska tvrdjav','muzej brodskog posavlja','marsonia','poloj','brodski korzo'];
// ZUPANIJA: sire podrucje - NIJE grad; iskljucuje se iz gradskih indeksa.
export const GEO_ZUPANIJA = ['brodsko-posavsk','brodsko posavsk','brodskog posavlja','brodsko posavlje','zupanij','bpz','opcin','opcine','dan opcine'];
// NEGATIVNO: drugi "Brodovi" i susjedni gradovi.
export const GEO_NEGATIVNO = ['bosanski brod','brod na kupi','brod moravic','brodu na kupi','slavonski samac','nova gradisk','gradisk','zupanj','djakov','osijek','vinkovc','pozeg','virovitic','andrijevc','klokocevik','kopanic','oriovac','sibinj','garcin','bebrin','podcrkavlj','trnjan','zadubravlj','sapc','vrpolj','brodski stupnik','nova kapel','petrovo sel','okucan','lipik','pakrac','slobodnic','gornja vrb','donja vrb','bukovlj','gundinc','velika kopanic'];
export const GEO_POZITIVNO = GEO_GRAD;

/** Ukloni dijakritiku i normaliziraj za podudaranje po korijenu. */
export function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/č|ć/g,'c').replace(/ž/g,'z').replace(/š/g,'s').replace(/đ/g,'dj')
    .replace(/\s+/g,' ')
    .trim();
}

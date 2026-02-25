// ── INTEGRATED DATABASE (Complete Verified Data from valpovo_sadrzaji.json) ──
const db = {
    "grad": {
        "naziv": "Valpovo",
        "opis": "Valpovo je grad u Osječko-baranjskoj županiji, smješten uz rijeku Karašicu, poznat po dvorcu Prandau-Normann, bogatoj kulturnoj baštini i toploj slavonskoj gostoljubivosti.",
        "adresa_tz": "Trg kralja Tomislava 2, 31550 Valpovo",
        "telefon": "+385 31 656 200",
        "email": "tzgvalpovo@gmail.com",
        "web": "https://tz.valpovo.hr"
    },
    "naselja": [
        { "naziv": "Nard", "opis": "Naselje uz Dravu, poznato po kupalištu." },
        { "naziv": "Šag", "opis": "Malo naselje jugozapadno od Valpova." },
        { "naziv": "Ladimirevci", "opis": "Selo zapadno od Valpova." },
        { "naziv": "Marijančaci", "opis": "Naselje između Valpova i Belišća." },
        { "naziv": "Harkanovci", "opis": "Selo sjeverozapadno od Valpova." },
        { "naziv": "Veliškovci", "opis": "Naselje zapadno od grada." },
        { "naziv": "Marjanski", "opis": "Manje selo u sastavu Grada Valpova." },
        { "naziv": "Zelčin", "opis": "Naseljeno mjesto u blizini Valpova." },
        { "naziv": "Ivanovci Valpovački", "opis": "Naselje istočno od grada." }
    ],
    "znamenitosti": [
        { "id": 1, "naziv": "Dvorac Prandau-Normann i perivoj", "opis": "Barokni dvorac iz 18. st. sa srednjovjekovnom kulom iz 15. st.", "adresa": "Ul. Dvorac Norman-Prandau 1", "koordinate": { "lat": 45.6589, "lng": 18.4154 }, "ocjena": 4.7, "web": "https://tz.valpovo.hr/znamenitosti/dvorac-i-perivoj/" },
        { "id": 2, "naziv": "Muzej Valpovštine", "opis": "Smješten u dvorcu. Stalna izložba o povijesti, arheologiji i etnografiji.", "adresa": "Ul. Dvorac Norman-Prandau", "koordinate": { "lat": 45.6594, "lng": 18.4154 }, "ocjena": 4.5, "web": "https://tz.valpovo.hr/znamenitosti/muzej-valpovstine" },
        { "id": 3, "naziv": "Prandauovo kazalište", "opis": "Najstarija sačuvana kazališna zgrada u kontinentalnoj Hrvatskoj (1809).", "web": "https://tz.valpovo.hr/znamenitosti//prandauovo-kazaliste/" },
        { "id": 4, "naziv": "Srednjovjekovna kula", "opis": "Najstariji dio dvorca.", "web": "https://tz.valpovo.hr/znamenitosti/srednjovjekovna-kula" },
        { "id": 5, "naziv": "Hotel Fortuna", "opis": "Jedno od tri najstarija sačuvana svratišta u SI Hrvatskoj (1807).", "web": "https://tz.valpovo.hr/znamenitosti/hotel-fortuna" },
        { "id": 6, "naziv": "Pivovara Valpovo", "opis": "Industrijska baština iz 19. st.", "web": "https://tz.valpovo.hr/znamenitosti/pivovara-valpovo" },
        { "id": 7, "naziv": "Centar kulture M.P. Katančić", "web": "https://tz.valpovo.hr/znamenitosti/centar-kulture-matija-petar-katancic-valpovo" },
        { "id": 8, "naziv": "Memorijalni centar Matije Petra Katančića", "web": "https://tz.valpovo.hr/znamenitosti/memorijalni-centar-matije-petra-katancica/" },
        { "id": 9, "naziv": "Edukacijsko-interpretacijski centar (Suvenirnica)", "web": "https://tz.valpovo.hr/znamenitosti/edukacijsko-interpretacijski-centar-matije-petra-katancica-suvenirnica-grada-valpova/" },
        { "id": 10, "naziv": "Crkva Bezgrješnog Začeća BDM", "adresa": "Trg kralja Tomislava 12", "koordinate": { "lat": 45.6593, "lng": 18.4182 }, "ocjena": 4.7 },
        { "id": 11, "naziv": "Kapela Sv. Roka", "opis": "Uz kapelu je Podunavsko-švapski spomen-obilježje.", "adresa": "Strossmayerova 48", "koordinate": { "lat": 45.6670, "lng": 18.4149 } },
        { "id": 12, "naziv": "Srpska pravoslavna crkva Sv. Georgija", "adresa": "Osječka ul. 21" }
    ],
    "gastronomija": [
        { "id": 1, "naziv": "Restoran Jovalija", "adresa": "Ul. Ive Lole Ribara 1", "ocjena": 4.9, "opis": "Vrhunski restoran slavonske kuhinje poznat po domaćem kulenu, čobancu i svježoj ribi iz Drave. Rustikalni interijer s autentičnim slavonskim ugođajem.", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-jovalija/", "radno_vrijeme": { "svaki_dan": "09:00 - 22:00" } },
        { "id": 2, "naziv": "Hotel & Restoran Park Valpovo", "adresa": "Ul. Ive Lole Ribara 10", "ocjena": 4.7, "opis": "Elegantni restoran u sklopu hotela uz dvorac. Nudi međunarodnu i slavonsku kuhinju, idealan za svečane prilike i poslovne ručkove.", "web": "https://tz.valpovo.hr/ugostiteljstvo/restoran-park/", "radno_vrijeme": { "pon-sub": "10:00 - 22:00", "ned": "11:00 - 16:00" } },
        { "id": 3, "naziv": "PIGment", "adresa": "Trg kralja Tomislava 7", "ocjena": 5.0, "opis": "Popularni burger bar u samom centru grada. Craft burgeri od domaćeg mesa s kreativnim dodacima. Mladenačka atmosfera.", "radno_vrijeme": { "čet": "17:00-22:00", "pet-sub": "17:00-00:00", "ned": "17:00-22:00" } },
        { "id": 4, "naziv": "RasoPaso", "adresa": "Strossmayerova ul. 2", "ocjena": 4.4, "opis": "Obiteljski restoran s raznovrsnim jelovnikom – od pizze i tjestenine do tradicionalnih slavonskih jela. Terasa za lijepe dane.", "radno_vrijeme": { "uto-ned": "10:00-22:00" } },
        { "id": 5, "naziv": "Bar i Pizzeria HEX", "adresa": "Trg kralja Tomislava 18", "ocjena": 4.7, "opis": "Pivnica i pizzerija na glavnom trgu. Širok izbor pizza, sendviča i pića. Idealno za opušteno druženje.", "web": "https://tz.valpovo.hr/ugostiteljstvo/bar-i-pizzeria-hex-valpovo/" },
        { "id": 6, "naziv": "Gurman", "adresa": "Ul. Augusta Šenoe 107", "ocjena": 4.0, "opis": "Restoran s ponudom gotovih jela i dnevnog menija. Pristupačne cijene, domaća kuhinja." },
        { "id": 7, "naziv": "Fast Food Vesperas", "adresa": "Ul. Zrinsko Frankopanska 48", "ocjena": 4.9, "opis": "Omiljeni fast food u Valpovu – ćevapi, pljeskavice, pomfrit. Brza usluga i odlični obroci za van." }
    ],
    "kavane": [
        { "id": 1, "naziv": "Gradska kavana Valpovo", "opis": "Kultna kavana u centru grada, mjesto okupljanja Valpovčana. Kava, kolači, kokteli.", "web": "https://tz.valpovo.hr/ugostiteljstvo/gradska-kavana-valpovo/" },
        { "id": 2, "naziv": "Gradska kavana Katančić", "opis": "Moderna kavana s ugodnim ambijentom u blizini dvorca. Širok izbor toplih i hladnih napitaka.", "web": "https://tz.valpovo.hr/ugostiteljstvo/gradska-kavana-katancic/" }
    ],
    "manifestacije": [
        { "id": "MAN-001", "naziv": "Dječji gradski karneval Valpovo", "vrijeme": "14. veljače 2026.", "datum_iso": "2026-02-14", "opis": "32. izdanje šarene karnevalske povorke djece ulicama Valpova. Maske, plesovi, glazba i zabava za najmlađe – tradicionalna manifestacija koja otvara godinu.", "url": "https://tz.valpovo.hr/2026/02/05/32-djecji-gradski-karneval-u-valpovu/" },
        { "id": "MAN-002", "naziv": "Uskrs u Valpovu", "vrijeme": "28.-29. ožujka 2026.", "datum_iso": "2026-03-28", "opis": "Tradicionalni etno i eko sajam na Trgu kralja Tomislava. Izložba pisanica, domaćih proizvoda, radionice za djecu i bogat kulturni program.", "url": "https://tz.valpovo.hr/manifestacije/uskrs-u-valpovu/" },
        { "id": "MAN-003", "naziv": "Dan Grada / Zlatno sijelo", "vrijeme": "Svibanj 2026.", "datum_iso": "2026-05-15", "opis": "Svečana proslava Dana Grada Valpova s kulturno-umjetničkim programom, smotrom folklora 'Zlatno sijelo', izložbama i sportskim natjecanjima.", "url": "https://tz.valpovo.hr/category/dan-grada-valpova/" },
        { "id": "MAN-004", "naziv": "Ljeto valpovačko", "vrijeme": "22.-28. lipnja 2026.", "datum_iso": "2026-06-22", "opis": "54. izdanje najstarije smotre amaterskog stvaralaštva u Slavoniji. Tjedan dana kazališnih predstava, koncerata, izložbi i radionica u dvorištu dvorca Prandau-Normann.", "url": "https://tz.valpovo.hr/manifestacije/ljeto-valpovacko/" },
        { "id": "MAN-005", "naziv": "Rock'a'raj festival", "vrijeme": "Srpanj 2026.", "datum_iso": "2026-07-15", "opis": "Cjelodnevni rock festival ispred dvorca Prandau-Normann. Nastupaju domaći i regionalni rock bendovi na sceni okruženoj srednjovjekovnim zidinama.", "url": "https://tz.valpovo.hr/manifestacije/rockaraj-festival/" },
        { "id": "MAN-006", "naziv": "Valpovačko turističko ljeto", "vrijeme": "Srpanj-Kolovoz 2026.", "datum_iso": "2026-07-01", "opis": "Dva mjeseca ljetnih kulturnih i zabavnih programa na otvorenom – koncerti, filmske projekcije, sportska natjecanja i dječje radionice.", "url": "https://tz.valpovo.hr/category/valpovacko-turisticko-ljeto/" },
        { "id": "MAN-007", "naziv": "Greenroom festival", "vrijeme": "Srpanj 2026.", "datum_iso": "2026-07-20", "opis": "Festival elektronske glazbe u zelenoj oazi valpovačkog perivoja. DJ nastupi, light show i ljetna atmosfera.", "url": "https://tz.valpovo.hr/category/greenroom-festival/" },
        { "id": "MAN-008", "naziv": "Reunited festival", "vrijeme": "Kolovoz 2026.", "datum_iso": "2026-08-10", "opis": "Glazbeni festival koji okuplja domaće i regionalne izvođače raznih žanrova. Ugođaj ljetne fešte u dvorištu dvorca.", "url": "https://tz.valpovo.hr/category/reunited-festival/" },
        { "id": "MAN-009", "naziv": "Valpovo Craft Beer Fest", "vrijeme": "Rujan 2026.", "datum_iso": "2026-09-15", "opis": "Dvodnevni festival craft piva s degustacijama više od 30 vrsta piva domaćih pivovara, uz street food, live glazbu i DJ-eve.", "url": "https://tz.valpovo.hr/manifestacije/craft-beer-festival/" },
        { "id": "MAN-010", "naziv": "Advent u Valpovu", "vrijeme": "Studeni-Prosinac 2026.", "datum_iso": "2026-11-28", "opis": "Čarobni adventski sajam na Trgu kralja Tomislava – adventsko seoceto s drvenim kućicama, kuhanim vinom, kobasicama, koncertima, jaslicama i dočekom Nove godine.", "url": "https://tz.valpovo.hr/category/advent-u-valpovu/" },
        { "id": "MAN-011", "naziv": "Noć muzeja", "vrijeme": "Siječanj 2027.", "datum_iso": "2027-01-29", "opis": "Poseban noćni program u Muzeju Valpovštine – vodstva, predavanja, izložbe i radionice otvorene do kasno u noć, besplatan ulaz.", "url": "https://tz.valpovo.hr/2026/01/26/noc-muzeja-2026-u-muzeju-valpovstine/" }
    ],
    "smjestaj": [
        { "id": 1, "naziv": "Hotel & Restoran Park Valpovo", "tip": "Hotel", "adresa": "Dvorac 1", "telefon": "+385 31 651 844", "web": "https://tz.valpovo.hr/smjestaj-u-valpovu/hotel-restoran-park-valpovo/" },
        { "id": 2, "naziv": "Hotel Villa Valpovo", "tip": "Hotel", "adresa": "Bana Josipa Jelačića 1", "telefon": "031 651 960", "web": "http://www.villa-valpovo.hr" },
        { "id": 3, "naziv": "Apartman Tea Valpovo", "tip": "Apartman", "adresa": "Učka 57", "telefon": "091/913-0596" },
        { "id": 4, "naziv": "Valpovački dvori", "tip": "Ruralni smještaj", "adresa": "Matije Gupca 95", "telefon": "098/722-234", "web": "http://sobe-valpovo.com/" },
        { "id": 5, "naziv": "M&S prenoćište", "tip": "Prenoćište", "adresa": "Trg kralja Tomislava 6", "telefon": "031/652-066" },
        { "id": 6, "naziv": "Sobe Čičak", "tip": "Privatne sobe", "adresa": "Bana Ivana Mažuranića 10", "telefon": "095/900-1307" },
        { "id": 7, "naziv": "Prenoćište Setnik", "tip": "Prenoćište", "adresa": "Osječka 48", "telefon": "031/652-719" },
        { "id": 9, "naziv": "Soba Draft Room", "adresa": "Franje Tuđmana 1-3", "telefon": "+385 98 281 183" },
        { "id": 10, "naziv": "Apartman Ana 1", "adresa": "Ivana Gundulića 23", "telefon": "098/979-5773" },
        { "id": 11, "naziv": "Apartmani Nives i Lea", "adresa": "Ivana Gorana Kovačića 25", "telefon": "091/488-8202" },
        { "id": 12, "naziv": "Studio apartman M", "adresa": "Kralja Petra Krešimira IV br. 6", "telefon": "099/838-4766" },
        { "id": 13, "naziv": "Soba VaLux", "adresa": "Dobriše Cesarića 58", "telefon": "+385 91 923 7472" },
        { "id": 15, "naziv": "Apartman Centar Valpovo", "adresa": "Osječka ulica br. 6", "telefon": "099/244-3708" }
    ],
    "priroda": [
        { "id": 1, "naziv": "Rijeka Karašica", "opis": "Protječe kroz grad, idealna za šetnje i ribolov.", "koordinate": { "lat": 45.659, "lng": 18.418 } },
        { "id": 2, "naziv": "Rijeka Drava", "opis": "Kupanje (Nard), ribolov i rekreacija (Nehaj, Labov).", "koordinate": { "lat": 45.672, "lng": 18.448 } },
        { "id": 3, "naziv": "Perivoj dvorca Prandau-Normann", "opis": "Oko 100 vrsta drveća, dječje igralište, sprave za vježbanje.", "koordinate": { "lat": 45.6574, "lng": 18.4157 }, "ocjena": 4.7 },
        { "id": 4, "naziv": "Vikend naselje Nehaj", "opis": "Plaže, ribolov, Forest Glam za proslave.", "koordinate": { "lat": 45.6415, "lng": 18.5123 }, "ocjena": 5.0, "aktivnosti": ["ribolov", "kupanje", "roštilj", "Forest Glam"] },
        { "id": 5, "naziv": "Vikend naselje Labov", "opis": "Mirna oaza za ribolov uz Dravu.", "koordinate": { "lat": 45.638, "lng": 18.430 } }
    ],
    "usluge": {
        "autoservisi": [
            { "id": "SER-001", "naziv": "Valentić", "adresa": "Ul. Nikole Tesle 30", "koordinate": { "lat": 45.6572, "lng": 18.4254 }, "ocjena": 4.9, "radno_vrijeme": { "pon-pet": "08:00-16:00", "sub": "08:00-12:00" } },
            { "id": "SER-002", "naziv": "Autoservis Galičić", "adresa": "Sunčana ul. 21", "koordinate": { "lat": 45.6526, "lng": 18.4275 }, "ocjena": 4.7, "radno_vrijeme": { "pon-pet": "07:00-15:00" } },
            { "id": "SER-003", "naziv": "Autoservis Ružić", "adresa": "Ul. Nikole Tesle 28", "koordinate": { "lat": 45.6572, "lng": 18.4252 }, "ocjena": 4.8, "radno_vrijeme": { "pon-pet": "07:00-15:00" } },
            { "id": "SER-004", "naziv": "Autocentar Ivica", "adresa": "Sunčana ul. 20", "koordinate": { "lat": 45.6525, "lng": 18.4272 }, "ocjena": 4.6 },
            { "id": "SER-005", "naziv": "Karlo servis", "adresa": "Ul. Ivana Gundulića 12", "koordinate": { "lat": 45.6604, "lng": 18.4230 }, "ocjena": 3.5 },
            { "id": "SER-006", "naziv": "KARLO SERVIS (Jelačića)", "adresa": "Ul. bana J. Jelačića 55", "koordinate": { "lat": 45.6533, "lng": 18.4314 }, "ocjena": 3.2 },
            { "id": "SER-007", "naziv": "DABO", "adresa": "Florijanova ul. 15", "koordinate": { "lat": 45.6606, "lng": 18.4132 }, "ocjena": 5.0, "radno_vrijeme": { "pon-pet": "08:00-16:00", "sub": "08:00-12:00" } }
        ],
        "frizerski_saloni": [
            { "id": "FRI-001", "naziv": "Frizerski salon Đurđica", "adresa": "Ul. Nikole Tesle 39", "koordinate": { "lat": 45.6579, "lng": 18.4255 }, "ocjena": 4.9, "radno_vrijeme": { "pon-sri": "13:00-20:00", "čet-sub": "08:00-14:00" } },
            { "id": "FRI-002", "naziv": "Frizerski salon Viva", "adresa": "Vijenac 107 brigade HV 3", "koordinate": { "lat": 45.6584, "lng": 18.4181 }, "ocjena": 4.7, "radno_vrijeme": { "pon-pet": "09:00-20:00", "sub": "08:00-13:00" } },
            { "id": "FRI-003", "naziv": "Black frizerski salon", "adresa": "Braće Radić 16", "koordinate": { "lat": 45.6586, "lng": 18.4204 }, "ocjena": 4.9, "radno_vrijeme": { "pon-pet": "09:00-19:00", "sub": "08:00-13:00" } },
            { "id": "FRI-004", "naziv": "Frizerski salon Mitian", "adresa": "Vijenac 107 brigade HV br. 1", "koordinate": { "lat": 45.6583, "lng": 18.4185 }, "ocjena": 5.0, "radno_vrijeme": { "pon-pet": "08:00-20:00", "sub": "08:00-13:00" } },
            { "id": "FRI-005", "naziv": "Mega Look", "adresa": "Ul. Matije Gupca 42", "koordinate": { "lat": 45.6618, "lng": 18.4145 }, "ocjena": 4.9, "radno_vrijeme": { "pon/sri/pet": "13:00-20:00", "uto/čet": "09:00-16:00", "sub": "08:00-13:00" } },
            { "id": "FRI-006", "naziv": "Studio Reina", "adresa": "Osječka ul. 14C", "koordinate": { "lat": 45.6568, "lng": 18.4203 }, "ocjena": 5.0, "opis": "Frizerski i beauty salon, govore engleski." },
            { "id": "FRI-007", "naziv": "Frizerski salon COOL", "adresa": "Osječka ul. 44", "koordinate": { "lat": 45.6559, "lng": 18.4230 }, "ocjena": 5.0, "radno_vrijeme": { "pon/sri/pet": "13:00-19:00", "uto/čet": "09:00-16:00", "sub": "08:00-13:00" } },
            { "id": "FRI-008", "naziv": "Frizerski salon Picasso", "adresa": "Kolodvorska ul. 4", "koordinate": { "lat": 45.6608, "lng": 18.4189 }, "ocjena": 5.0 },
            { "id": "FRI-009", "naziv": "Mira frizerski salon", "adresa": "J.J. Strossmayera 8", "koordinate": { "lat": 45.6602, "lng": 18.4183 }, "ocjena": 4.7, "radno_vrijeme": { "pon-pet": "08:00-16:00", "sub": "08:00-13:00" } },
            { "id": "FRI-010", "naziv": "Barbershop Industry", "adresa": "J.J. Strossmayera 8", "koordinate": { "lat": 45.6602, "lng": 18.4183 }, "ocjena": 4.8, "radno_vrijeme": { "pon/sri/pet": "09:00-16:00", "uto/čet": "13:00-20:00", "sub": "08:00-13:00" } }
        ],
        "zdravstvo": [
            { "id": "ZDR-001", "naziv": "Dom zdravlja Valpovo", "adresa": "Ul. kralja Petra Krešimira IV 1", "koordinate": { "lat": 45.6617, "lng": 18.4167 }, "ocjena": 4.5, "opis": "Liječničke ordinacije opće i obiteljske medicine, stomatologija, laboratorij." }
        ],
        "ljekarne": [
            { "id": "LJK-001", "naziv": "Centralna ljekarna Valpovo", "adresa": "Osječka ul. 3", "koordinate": { "lat": 45.6578, "lng": 18.4191 }, "ocjena": 4.6, "radno_vrijeme": { "pon-pet": "07:00-20:00", "sub": "08:00-13:00" } }
        ],
        "posta": [
            { "id": "POS-001", "naziv": "HP - Hrvatska pošta", "adresa": "Osječka ul. 2", "koordinate": { "lat": 45.6575, "lng": 18.4187 }, "ocjena": 3.2, "radno_vrijeme": { "pon-pet": "08:00-18:00", "sub": "08:00-13:00" } }
        ],
        "banke_i_bankomati": [
            { "id": "BNK-001", "naziv": "PBZ banka", "adresa": "Ul. kralja Petra Krešimira IV 2", "koordinate": { "lat": 45.6602, "lng": 18.4171 }, "ocjena": 3.4, "radno_vrijeme": { "pon-pet": "08:00-19:00" } },
            { "id": "BNK-002", "naziv": "Slatinska banka", "adresa": "Trg kralja Tomislava", "koordinate": { "lat": 45.6589, "lng": 18.4176 }, "ocjena": 4.5, "radno_vrijeme": { "pon-pet": "08:30-16:00" } },
            { "id": "BNK-003", "naziv": "OTP bankomat", "adresa": "Vijenac 107. brigade HV 1", "koordinate": { "lat": 45.6580, "lng": 18.4183 }, "ocjena": 4.3, "radno_vrijeme": { "svaki_dan": "0-24h" } },
            { "id": "BNK-004", "naziv": "Zagrebačka banka bankomat", "adresa": "Ul. Braće Radić 1A", "koordinate": { "lat": 45.6582, "lng": 18.4187 }, "radno_vrijeme": { "svaki_dan": "0-24h" } },
            { "id": "BNK-005", "naziv": "RaiffeisenBANK ATM", "adresa": "Osječka ul. 12", "koordinate": { "lat": 45.6571, "lng": 18.4200 }, "radno_vrijeme": { "svaki_dan": "0-24h" } },
            { "id": "BNK-006", "naziv": "HPB bankomat", "adresa": "Trg kralja Tomislava 17", "koordinate": { "lat": 45.6582, "lng": 18.4180 }, "ocjena": 5.0, "radno_vrijeme": { "pon-pet": "08:00-19:00" } },
            { "id": "BNK-007", "naziv": "Bankomat Slatinske banke", "adresa": "Trg kralja Tomislava 6", "koordinate": { "lat": 45.6589, "lng": 18.4176 }, "radno_vrijeme": { "svaki_dan": "0-24h" } }
        ],
        "benzinske_postaje": [
            { "id": "BEN-001", "naziv": "Petrol (Bizovačka)", "adresa": "Bizovačka 6", "koordinate": { "lat": 45.6486, "lng": 18.4223 }, "ocjena": 4.5, "radno_vrijeme": { "pon-sub": "06:00-21:00", "ned": "08:00-20:00" } },
            { "id": "BEN-002", "naziv": "Petrol (Strossmayerova)", "adresa": "J.J. Strossmayera 85a", "koordinate": { "lat": 45.6713, "lng": 18.4138 }, "ocjena": 4.3, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } },
            { "id": "BEN-003", "naziv": "INA (Bana Jelačića)", "adresa": "Ul. bana J. Jelačića 30", "koordinate": { "lat": 45.6524, "lng": 18.4318 }, "ocjena": 4.6, "radno_vrijeme": { "svaki_dan": "06:00-22:00" } },
            { "id": "BEN-004", "naziv": "INA (Ive Lole Ribara)", "adresa": "Ul. Ive Lole Ribara 61", "koordinate": { "lat": 45.6504, "lng": 18.4183 }, "ocjena": 4.3, "radno_vrijeme": { "pon-sub": "07:00-19:00" } }
        ],
        "sport_i_fitness": [
            { "id": "SPO-001", "naziv": "SC Ružić", "adresa": "Ul. Nikole Tesle 28", "koordinate": { "lat": 45.6572, "lng": 18.4252 }, "ocjena": 4.7, "radno_vrijeme": { "pon-sub": "08:00-22:00" } },
            { "id": "SPO-002", "naziv": "StrongFit", "adresa": "Starovalpovački put 1", "koordinate": { "lat": 45.6651, "lng": 18.4219 }, "ocjena": 5.0, "radno_vrijeme": { "pon-pet": "08:00-11:00 / 16:00-21:00" } },
            { "id": "SPO-003", "naziv": "Sportska dvorana Valpovo", "adresa": "Ul. Franje Tuđmana 4", "koordinate": { "lat": 45.6599, "lng": 18.4193 }, "ocjena": 4.5 }
        ],
        "trgovine": [
            { "id": "SHP-001", "naziv": "STOP SHOP Valpovo", "adresa": "Bana Josipa Jelačića", "koordinate": { "lat": 45.6511, "lng": 18.4350 }, "ocjena": 4.4, "radno_vrijeme": { "pon-sub": "09:00-21:00" } },
            { "id": "SHP-002", "naziv": "Plodine", "adresa": "Bizovačka ul. 10", "koordinate": { "lat": 45.6502, "lng": 18.4200 }, "ocjena": 4.0, "radno_vrijeme": { "svaki_dan": "07:00-21:00" } },
            { "id": "SHP-003", "naziv": "Centar tehnike Valpovo", "adresa": "Osječka ul. 6", "koordinate": { "lat": 45.6573, "lng": 18.4190 }, "ocjena": 4.5, "radno_vrijeme": { "pon-pet": "08:00-20:00", "sub": "08:00-13:00" } }
        ]
    },
    "korisne_informacije": {
        "kontakt_tz": {
            "naziv": "TZ Grada Valpova",
            "adresa": "Trg kralja Tomislava 2, 31550 Valpovo",
            "telefoni": ["+385 31 656 200", "+385 99 782 3200", "+385 91 579 3527"],
            "emails": ["tzgvalpovo@gmail.com", "eduard.lackovic@tz.valpovo.hr", "nikola.abramic@tz.valpovo.hr"],
            "web": "https://tz.valpovo.hr",
            "instagram": "https://www.instagram.com/visitvalpovo/",
            "facebook": "https://www.facebook.com/visitvalpovo"
        }
    }
};

// ── HELPERS ─────────────────────────────────────────────────────────────────
async function fetchWeather() {
    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=45.6609&longitude=18.4186&current_weather=true";
        const r = await fetch(url);
        if (!r.ok) return null;
        const d = await r.json();
        return d.current_weather || null;
    } catch (e) { return null; }
}

function getSeason(month) {
    if (month >= 3 && month <= 5) return "proljeće";
    if (month >= 6 && month <= 8) return "ljeto";
    if (month >= 9 && month <= 11) return "jesen";
    return "zima";
}

// ── PROMPT ──────────────────────────────────────────────────────────────────
function buildSystemPrompt(db, weather, season, hour, isWeekend) {
    const weatherNote = weather ? `\nTRENUTNO U VALPOVU: ${weather.temperature}°C, ${weather.windspeed} km/h.` : "";

    const fmt = (item) => {
        let s = `- ${item.naziv}: ${item.opis || ""}`;
        if (item.adresa) s += ` | Adresa: ${item.adresa}`;
        if (item.telefon) s += ` | Tel: ${item.telefon}`;
        if (item.url) s += ` | Info: ${item.url}`;
        if (item.web) s += ` | Web: ${item.web}`;
        if (item.ocjena) s += ` | Ocjena: ${item.ocjena}⭐`;
        if (item.radno_vrijeme) s += ` | Radno vrijeme: ${JSON.stringify(item.radno_vrijeme)}`;
        if (item.koordinate) s += ` | GPS: ${item.koordinate.lat}, ${item.koordinate.lng}`;
        return s;
    };

    const fmtNaselje = (item) => `- ${item.naziv}: ${item.opis || ""}`;

    // Filter manifestacije: only upcoming events
    const today = new Date().toISOString().slice(0, 10);
    const upcomingEvents = (db.manifestacije || []).filter(m => !m.datum_iso || m.datum_iso >= today);

    const strings = {
        znamenitosti: (db.znamenitosti || []).map(fmt).join("\n"),
        gastronomija: (db.gastronomija || []).map(fmt).join("\n"),
        kavane: (db.kavane || []).map(fmt).join("\n"),
        priroda: (db.priroda || []).map(fmt).join("\n"),
        smjestaj: (db.smjestaj || []).map(fmt).join("\n"),
        manifestacije: upcomingEvents.map(fmt).join("\n"),
        naselja: (db.naselja || []).map(fmtNaselje).join("\n"),
        usluge: Object.entries(db.usluge || {}).map(([k, v]) => `\n--- ${k.toUpperCase().replace(/_/g, ' ')} ---\n` + v.map(fmt).join("\n")).join("\n")
    };

    const tz = db.korisne_informacije?.kontakt_tz || {};
    const tzTel = (tz.telefoni || []).join(", ");
    const tzEmail = (tz.emails || [])[0] || "";

    return `--- LANGUAGE RULE (PRIORITET #1) ---
1. DETECT user language. 
2. ALWAYS respond in the SAME language as the user (English, German, etc.).
3. TRANSLATE all local data (descriptions, names, terms) from the database below into the user's language.

--- PRAVILO ZA JEZIK (PRIORITET #1) ---
1. PREPOZNAJ jezik korisnika.
2. UVIJEK odgovaraj na ISTOM jeziku koji korisnik koristi (Engleski, Njemački, itd.).
3. PREVEDI sve lokalne podatke iz baze podataka (opise, nazive, termine) na jezik korisnika.

Digitalni turistički informator grada Valpova. Profesionalan i koristan. ${weatherNote}

STROGA PRAVILA FORMATIRANJA (OBAVEZNO POŠTUJ):

1. IKONE: Koristi ispravne ikone (🏛️ znamenitosti, 🍽️ gastronomija, 🌊 priroda, 🛌 smještaj, 🚗 autoservisi, 💇 frizeri, 🏥 zdravstvo, 💊 ljekarne, 🏧 banke, ⛽ benzinske, 🏋️ sport, 🛒 trgovine, 📬 pošta, 🎉 manifestacije).

2. TELEFON: Ako IMAŠ telefonski broj u bazi, prikaži ga sa 📞 ikonom. NIKADA ne stavljaj adresu iza 📞 ikone – to je SAMO za telefonske brojeve!

3. GOOGLE MAPS: Za svaki objekt OBAVEZNO generiraj Google Maps link u formatu:
   [Otvori na karti](https://www.google.com/maps/search/?api=1&query=NAZIV+OBJEKTA+Valpovo)
   VAŽNO: NE stavljaj 📍 emoji u tekst linka! CSS automatski dodaje ikonu. Piši SAMO "Otvori na karti".

4. KADA DAŠ GOOGLE MAPS LINK:
   - NE prikazuj sirove GPS koordinate (npr. "45.6589, 18.4154") – Maps link je dovoljan!
   - NE stavljaj nikakve ikone (🌐 ili 📍) ispred [Otvori na karti] linka.

5. PRIKAZ INFORMACIJA (REDOSLIJED):
   a) 📛 Naziv s ikonom kategorije
   b) Dovoljno dug opis (2-3 rečenice minimum!)
   c) 📞 Telefon (AKO GA IMA u bazi)
   d) 🌐 Web: URL (OBAVEZNO prikaži specifične linkove tipa "tz.valpovo.hr/znamenitosti/..." – sakrij samo osnovni "https://tz.valpovo.hr" bez ikakvog nastavka!)
   e) [Otvori na karti](Google Maps link) – UVIJEK na kraju, bez teksta ispred.

6. NASELJA GRADA VALPOVA: Kad korisnik pita za "okolna naselja", "prigradska naselja" ili "dijelove grada", odgovori ISKLJUČIVO s naseljima iz baze (Nard, Šag, Ladimirevci, Marijančaci, Harkanovci, Veliškovci, Marjanski, Zelčin, Ivanovci Valpovački). NIKADA ne spominji Osijek, Slavonski Brod ili druge gradove – to su zasebni gradovi, NE naselja Valpova!

7. KAVANE: Kavane su ZASEBNA kategorija od gastronomije (restorana). Kad korisnik pita za kafiće ili kavane, prikaži podatke iz kategorije KAVANE. Kad pita za restorane ili hranu, prikaži GASTRONOMIJU.

SMART FLOWS:
- SMJEŠTAJ: Pitaj vrstu (Hotel/Apartman/Sobe/Prenoćište) → pitaj preference → daj 3 opcije.
- MANIFESTACIJE: Prikazuj SAMO nadolazeće manifestacije (koje još nisu prošle). Danas je ${today}. Izlistaj kronološki s 🎉 ikonom, TOČNIM DATUMOM i opisom.

BAZA PODATAKA:
ZNAMENITOSTI:
${strings.znamenitosti}

NADOLAZEĆE MANIFESTACIJE (KALENDAR 2026):
${strings.manifestacije}

PRIRODA:
${strings.priroda}

GASTRONOMIJA (RESTORANI I FAST FOOD):
${strings.gastronomija}

KAVANE:
${strings.kavane}

USLUGE:
${strings.usluge}

SMJEŠTAJ:
${strings.smjestaj}

NASELJA GRADA VALPOVA:
${strings.naselja}

KONTAKT TZ: ${tz.naziv || "TZ Valpovo"} | Tel: ${tzTel} | Email: ${tzEmail} | Web: ${tz.web || ""}
`;
}

// ── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { message, history = [] } = req.body;
        if (!message) return res.status(400).json({ error: "Nedostaje poruka." });

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return res.status(500).json({ error: "API ključ nije postavljen." });

        const weather = await fetchWeather();
        const now = new Date();
        const systemPrompt = buildSystemPrompt(db, weather, getSeason(now.getUTCMonth() + 1), now.getUTCHours() + 1, [0, 5, 6].includes(now.getUTCDay()));

        const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey.trim()}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history.slice(-6).map(m => {
                        let role = m.role;
                        if (role === "model") role = "assistant";
                        if (!["system", "assistant", "user", "function", "tool", "developer"].includes(role)) role = "user";
                        return { role, content: m.content };
                    }),
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await apiResponse.json();
        if (!apiResponse.ok) return res.status(apiResponse.status).json({ error: "Greška OpenAI servisa", details: data.error?.message });
        if (!data.choices || data.choices.length === 0) return res.status(502).json({ error: "Prazan AI odgovor." });
        return res.status(200).json({ reply: data.choices[0].message.content });

    } catch (e) {
        console.error("API Handler Error:", e);
        return res.status(500).json({
            reply: "Problem s povezivanjem: " + e.message,
            error: "Sistemska pogreška",
            details: e.message
        });
    }
}

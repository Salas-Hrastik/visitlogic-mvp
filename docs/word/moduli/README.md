# Ilustriranje kanonskoga udžbenika K2

Lanac se pokreće nad *provjerenom* kanonskom datotekom (`nova.docx`), redom:

```bash
unzip -q nova.docx -d un && find un -type l -delete
python3 inject5.py        # Modul 5: 3 sheme + 12 fotografija
python3 swap.py           # Modul 1: 3 sheme -> parovi fotografija; Modul 2: Foto 2.x
python3 inject3467.py     # Moduli 3, 4, 6, 7: 29 fotografija
(cd un && zip -Xrq ../K2-ilustrirano.docx .)
```

Konvencija je preuzeta iz Modula 2: sheme nose numerirani podebljani natpis
`Sl. X.Y — …`, fotografije `Foto X.Y — …`, a izvor ide u zaseban redak
(`Snimio/la: … · naslov, Wikimedia Commons · licencija`) s poveznicama.

Odabir slika i licencije zapisani su u `f5.json`, `fswap.json` i `f3467.json`.
Sidra su vezana uz tekst, ne uz redne brojeve elemenata, pa lanac preživi
manje izmjene dokumenta. Slike se pri ugradnji smanjuju na najviše 1100 px.

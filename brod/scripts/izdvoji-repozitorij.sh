#!/usr/bin/env bash
#
# Izdvaja mapu brod/ u samostalnu granu čiji je korijen ta mapa, s poviješću.
# Ništa ne gura na daljinski repozitorij — na kraju ispiše sljedeće naredbe.
#
# Pokretanje iz korijena repozitorija:
#   bash brod/scripts/izdvoji-repozitorij.sh [naziv-grane]
#
set -euo pipefail

PREFIX="brod"
GRANA="${1:-brod-samostalno}"

if [ ! -d ".git" ]; then
  echo "Greška: pokrenite iz korijena repozitorija (mape koja sadrži .git)." >&2
  exit 1
fi

if [ ! -d "$PREFIX" ]; then
  echo "Greška: mapa '$PREFIX/' ne postoji." >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Greška: radno stablo nije čisto. Commitajte ili spremite izmjene prije izdvajanja." >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/$GRANA"; then
  echo "Greška: grana '$GRANA' već postoji. Obrišite je ili zadajte drugi naziv." >&2
  exit 1
fi

echo "Izdvajam '$PREFIX/' u granu '$GRANA'…"
git subtree split --prefix="$PREFIX" -b "$GRANA"

BROJ=$(git rev-list --count "$GRANA")
echo
echo "✅ Gotovo. Grana '$GRANA' ima $BROJ commit(a), a njezin korijen je sadržaj mape $PREFIX/."
echo
echo "Sljedeći koraci — otvorite prazan repozitorij na GitHubu, pa:"
echo
echo "  git push git@github.com:<vlasnik>/tz-slavonski-brod-prototip.git $GRANA:main"
echo
echo "Zatim, kad je novi repozitorij na mjestu, iz ovog repozitorija uklonite mapu:"
echo
echo "  git rm -r $PREFIX && git rm .vercelignore && git commit -m 'Prototip TZ Slavonski Brod preseljen u zaseban repozitorij'"
echo

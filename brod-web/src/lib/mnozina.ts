import type { Jezik } from "./content/types";

/**
 * Pogl. 7.5 — lokalizacija formata.
 *
 * Hrvatski ima tri oblika, a ne dva: 1 rezultat, 2–4 rezultata, 5+ rezultata,
 * pa opet 21 rezultat. Engleski i njemački imaju dva. Ispis "1 rezultata"
 * je sitnica koja odmah odaje da sjedište nije pisano za hrvatski.
 */
type Oblici = { jedan: string; malo: string; puno: string };

const REZULTAT: Record<Jezik, Oblici> = {
  hr: { jedan: "rezultat", malo: "rezultata", puno: "rezultata" },
  en: { jedan: "result", malo: "results", puno: "results" },
  de: { jedan: "Ergebnis", malo: "Ergebnisse", puno: "Ergebnisse" },
};

function oblik(n: number, j: Jezik, o: Oblici): string {
  if (j !== "hr") return n === 1 ? o.jedan : o.puno;
  const d = n % 10;
  const dd = n % 100;
  if (d === 1 && dd !== 11) return o.jedan;
  if (d >= 2 && d <= 4 && !(dd >= 12 && dd <= 14)) return o.malo;
  return o.puno;
}

export const rezultata = (n: number, j: Jezik) => `${n} ${oblik(n, j, REZULTAT[j])}`;

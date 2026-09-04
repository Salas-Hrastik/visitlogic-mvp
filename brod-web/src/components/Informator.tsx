"use client";

import { useRef, useState } from "react";
import type { Jezik } from "@/lib/content/types";
import { t } from "@/lib/rjecnik";
import s from "./Informator.module.css";

type Poruka = { tko: "gost" | "informator"; tekst: string; znam?: boolean };

const PRIMJERI: Record<Jezik, string[]> = {
  hr: ["Što se događa ovaj mjesec?", "Gdje jesti slavonsku hranu?", "Imam 2 sata — što vidjeti?", "Koliko košta ulaz u Tvrđavu?"],
  en: ["What's on this month?", "Where can I eat Slavonian food?", "I have 2 hours — what should I see?", "How much is entry to the Fortress?"],
  de: ["Was ist diesen Monat los?", "Wo kann ich slawonisch essen?", "Ich habe 2 Stunden — was sehen?", "Was kostet der Eintritt zur Festung?"],
};

export function Informator({ jezik }: { jezik: Jezik }) {
  const [privola, setPrivola] = useState(false);
  const [poruke, setPoruke] = useState<Poruka[]>([]);
  const [upit, setUpit] = useState("");
  const [ceka, setCeka] = useState(false);
  const dno = useRef<HTMLDivElement>(null);

  /** Pogl. 9.5: prijelaz na ljudsku podršku nudi se nakon dva uzastopna „ne znam”. */
  const zaredomNeZnam = (() => {
    let n = 0;
    for (let i = poruke.length - 1; i >= 0; i--) {
      const p = poruke[i];
      if (p.tko !== "informator") continue;
      if (p.znam === false) n++; else break;
    }
    return n;
  })();

  async function posalji(pitanje: string) {
    const q = pitanje.trim();
    if (!q || ceka) return;
    setPoruke((p) => [...p, { tko: "gost", tekst: q }]);
    setUpit("");
    setCeka(true);
    try {
      const r = await fetch("/api/pitaj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitanje: q, jezik }),
      });
      const d = await r.json();
      const tekst = d.odgovor ?? t(
        d.greska === "previse_upita" ? "inf_previse"
        : d.greska === "informator_nije_postavljen" ? "inf_nepostavljen"
        : "inf_greska", jezik);
      setPoruke((p) => [...p, { tko: "informator", tekst, znam: d.znam ?? false }]);
    } catch {
      setPoruke((p) => [...p, { tko: "informator", tekst: t("inf_greska", jezik), znam: false }]);
    } finally {
      setCeka(false);
      requestAnimationFrame(() => dno.current?.scrollIntoView({ block: "end" }));
    }
  }

  return (
    <div className={s.okvir}>
      {/* Pogl. 9.7: jasna oznaka pri svakom otvaranju — obveza iz EU akta o UI. */}
      <p className={s.oznaka}>{t("inf_automatski", jezik)}</p>

      {!privola ? (
        <div className={s.privola}>
          <p>{t("inf_privola", jezik)}</p>
          <button type="button" className={s.gumb} onClick={() => setPrivola(true)}>
            {t("inf_prihvacam", jezik)}
          </button>
        </div>
      ) : (
        <>
          <div className={s.razgovor} role="log" aria-live="polite" aria-label={t("pitaj", jezik)}>
            {poruke.length === 0 && (
              <div className={s.primjeri}>
                <p>{t("inf_primjeri", jezik)}</p>
                <ul>
                  {PRIMJERI[jezik].map((p) => (
                    <li key={p}>
                      <button type="button" onClick={() => posalji(p)}>{p}</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {poruke.map((p, i) => (
              <div key={i} className={p.tko === "gost" ? s.gost : s.odgovor}>
                {p.tekst.split("\n").map((red, j) => <p key={j}>{red}</p>)}
              </div>
            ))}
            {ceka && <p className={s.ceka}>{t("inf_ceka", jezik)}</p>}
            <div ref={dno} />
          </div>

          {/* Pogl. 9.5, razina 2: nudi se automatski nakon dva uzastopna „ne znam”. */}
          {zaredomNeZnam >= 2 && (
            <div className={s.predaja}>
              <p>{t("inf_predaja", jezik)}</p>
              <a className={s.gumb} href="mailto:info@tzgsb.hr">info@tzgsb.hr</a>
            </div>
          )}

          <form className={s.unos} onSubmit={(e) => { e.preventDefault(); posalji(upit); }}>
            <label className="sr" htmlFor="inf-upit">{t("pitaj", jezik)}</label>
            <input id="inf-upit" value={upit} onChange={(e) => setUpit(e.target.value)}
                   maxLength={500} placeholder={t("inf_placeholder", jezik)} autoComplete="off" />
            <button type="submit" disabled={ceka || !upit.trim()}>{t("inf_posalji", jezik)}</button>
          </form>
        </>
      )}

      {/* Pogl. 9.5, razina 3: telefon i radno vrijeme Centra prikazani UVIJEK. */}
      <p className={s.centar}>
        {t("inf_centar", jezik)}: <a href="tel:+38535447721">+385 35 447 721</a> · pon–pet 8–16, sub 8–12
      </p>
    </div>
  );
}

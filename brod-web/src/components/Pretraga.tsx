"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Jezik } from "@/lib/content/types";
import { t } from "@/lib/rjecnik";
import s from "./Pretraga.module.css";

export type Zapis = { naslov: string; uvod: string; url: string; skupina: string };

/** Uklanja dijakritiku, pa "tvrdava" nalazi "Tvrđava". */
const norm = (x: string) =>
  x.toLowerCase().replace(/đ/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * W10. Indeks se gradi u buildu i predaje kao prop, pa pretraga radi bez
 * poslužitelja i stranica ostaje statična — Pogl. 12 traži da se ne plaća
 * poslužiteljski krug za nešto što stane u nekoliko kilobajta.
 */
export function Pretraga({ zapisi, jezik }: { zapisi: Zapis[]; jezik: Jezik }) {
  const [q, setQ] = useState("");
  const pogodci = useMemo(() => {
    const n = norm(q.trim());
    if (n.length < 2) return [];
    return zapisi.filter((z) => norm(z.naslov + " " + z.uvod + " " + z.skupina).includes(n));
  }, [q, zapisi]);

  return (
    <div>
      <label className={s.polje}>
        <span className="sr">{t("pretraga", jezik)}</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("trazi", jezik)}
          autoComplete="off"
        />
      </label>

      <p className={s.broj} role="status" aria-live="polite">
        {q.trim().length < 2 ? "" : `${pogodci.length} / ${zapisi.length}`}
      </p>

      {q.trim().length >= 2 && pogodci.length === 0 && (
        <p className={s.prazno}>{t("nema_rezultata", jezik)}</p>
      )}

      <ul className={s.lista}>
        {pogodci.map((z) => (
          <li key={z.url}>
            <p className={s.skupina}>{z.skupina}</p>
            <h3><Link href={z.url}>{z.naslov}</Link></h3>
            <p className={s.uvod}>{z.uvod}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

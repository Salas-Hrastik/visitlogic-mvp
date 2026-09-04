"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Jezik } from "@/lib/content/types";
import { t } from "@/lib/rjecnik";
import { rezultata } from "@/lib/mnozina";
import s from "./Filtri.module.css";

export type Faceta = {
  kljuc: string;
  naziv: string;
  opcije: Array<{ v: string; oznaka: string }>;
};

export type Stavka = {
  id: string;
  /** Vrijednosti po facetama; višestruke su dopuštene (npr. više pogodnosti). */
  facete: Record<string, string[]>;
  prikaz: ReactNode;
};

const izOdabira = (sp: URLSearchParams, kljuc: string) =>
  (sp.get(kljuc)?.split(",").filter(Boolean) ?? []);

/**
 * Ponašanje filtara iz Pogl. 4.4.2, "jednako u svim katalozima":
 * čipovi s uklanjanjem i „Očisti sve”, brojač uz svaku opciju, opcije s nula
 * pogodaka onemogućene (ne skrivene), stanje u URL-u, aria-live najava broja.
 *
 * Filtriranje je namjerno u pregledniku: katalozi su male veličine, a stranica
 * time ostaje statična. URL i dalje nosi stanje, pa se pogled može podijeliti.
 */
type Props = { facete: Faceta[]; stavke: Stavka[]; jezik: Jezik };

/**
 * useSearchParams() traži Suspense granicu da bi se stranica mogla
 * predrenderirati statički. Međustanje je pun popis bez filtara — to je i
 * ono što vidi posjetitelj bez JavaScripta i što indeksira tražilica.
 */
export function Filtri(props: Props) {
  return (
    <Suspense fallback={<div className="mreza">{props.stavke.map((x) => <div key={x.id}>{x.prikaz}</div>)}</div>}>
      <FiltriUnutra {...props} />
    </Suspense>
  );
}

function FiltriUnutra({ facete, stavke, jezik }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [otvoreno, setOtvoreno] = useState(false);

  /**
   * Izvor istine je lokalno stanje, a URL je njegova posljedica — ne obratno.
   *
   * Na statički predrenderiranoj stranici `useSearchParams()` se nakon
   * `router.replace` ne osvježi pouzdano, pa bi kontrolirana kvačica ostala
   * neoznačena i filtar se ne bi dao uključiti. Stanje se ipak usklađuje iz
   * URL-a kad se on promijeni izvana (dubinska poveznica, natrag/naprijed).
   */
  const izUrla = () => {
    const o: Record<string, string[]> = {};
    for (const f of facete) o[f.kljuc] = izOdabira(sp, f.kljuc);
    return o;
  };
  const [odabir, setOdabir] = useState<Record<string, string[]>>(izUrla);
  const spKljuc = sp.toString();
  useEffect(() => {
    const o: Record<string, string[]> = {};
    for (const f of facete) o[f.kljuc] = izOdabira(new URLSearchParams(spKljuc), f.kljuc);
    setOdabir(o);
    // Ovisi samo o URL-u: vlastite izmjene ne smiju pokrenuti ponovno čitanje.
  }, [spKljuc]);

  const brojAktivnih = Object.values(odabir).reduce((n, v) => n + v.length, 0);

  const prolazi = (st: Stavka, bezKljuca?: string) =>
    facete.every((f) => {
      if (f.kljuc === bezKljuca) return true;
      const izabrano = odabir[f.kljuc];
      if (izabrano.length === 0) return true;
      return izabrano.some((v) => (st.facete[f.kljuc] ?? []).includes(v));
    });

  const rezultati = useMemo(() => stavke.filter((x) => prolazi(x)), [stavke, odabir]);

  const upisiUrl = (o: Record<string, string[]>) => {
    const novi = new URLSearchParams();
    for (const f of facete) if (o[f.kljuc]?.length) novi.set(f.kljuc, o[f.kljuc].join(","));
    router.replace(`${pathname}${novi.toString() ? `?${novi}` : ""}`, { scroll: false });
  };

  const postavi = (kljuc: string, v: string) => {
    const trenutno = odabir[kljuc] ?? [];
    const sljedece = trenutno.includes(v) ? trenutno.filter((x) => x !== v) : [...trenutno, v];
    const o = { ...odabir, [kljuc]: sljedece };
    setOdabir(o);
    upisiUrl(o);
  };

  const ocisti = () => {
    const o: Record<string, string[]> = {};
    for (const f of facete) o[f.kljuc] = [];
    setOdabir(o);
    router.replace(pathname, { scroll: false });
  };

  const ukloniFacetu = (kljuc: string) => {
    const o = { ...odabir, [kljuc]: [] };
    setOdabir(o);
    upisiUrl(o);
  };

  /**
   * Pogl. 4.4.3: kad filtri ne daju rezultata, ponuditi uklanjanje
   * NAJRESTRIKTIVNIJEG filtra — i imenovati ga. Najrestriktivniji je onaj čije
   * uklanjanje vraća najviše rezultata.
   */
  const najrestriktivniji = useMemo(() => {
    if (rezultati.length > 0 || brojAktivnih === 0) return null;
    let naj: { f: Faceta; dobitak: number } | null = null;
    for (const f of facete) {
      if (odabir[f.kljuc].length === 0) continue;
      const dobitak = stavke.filter((x) => prolazi(x, f.kljuc)).length;
      if (!naj || dobitak > naj.dobitak) naj = { f, dobitak };
    }
    return naj;
  }, [rezultati.length, brojAktivnih, odabir, stavke, facete]);

  const cipovi = facete.flatMap((f) =>
    odabir[f.kljuc].map((v) => ({
      f, v, oznaka: f.opcije.find((o) => o.v === v)?.oznaka ?? v,
    })),
  );

  return (
    <div className={s.layout}>
      <button
        type="button"
        className={s.mobToggle}
        aria-expanded={otvoreno}
        onClick={() => setOtvoreno((x) => !x)}
      >
        {t("filtri", jezik)}{brojAktivnih ? ` (${brojAktivnih})` : ""}
      </button>

      <div className={`${s.panel} ${otvoreno ? s.panelOtvoren : ""}`}>
        {facete.map((f) => (
          <fieldset key={f.kljuc} className={s.grupa}>
            <legend>{f.naziv}</legend>
            {f.opcije.map((o) => {
              // Broj pogodaka za tu opciju, uz ostale filtre kakvi jesu.
              const broj = stavke.filter(
                (x) => prolazi(x, f.kljuc) && (x.facete[f.kljuc] ?? []).includes(o.v),
              ).length;
              const izabrano = odabir[f.kljuc].includes(o.v);
              return (
                <label key={o.v} className={`${s.opcija} ${broj === 0 && !izabrano ? s.prazna : ""}`}>
                  <input
                    type="checkbox"
                    checked={izabrano}
                    disabled={broj === 0 && !izabrano}
                    onChange={() => postavi(f.kljuc, o.v)}
                  />
                  <span>{o.oznaka}</span>
                  <span className={s.broj}>{broj}</span>
                </label>
              );
            })}
          </fieldset>
        ))}
        <button type="button" className={s.primijeni} onClick={() => setOtvoreno(false)}>
          {t("primijeni", jezik)}
        </button>
      </div>

      <div>
        {cipovi.length > 0 && (
          <div className={s.cipovi}>
            {cipovi.map(({ f, v, oznaka }) => (
              <button key={`${f.kljuc}:${v}`} type="button" className={s.cip}
                      onClick={() => postavi(f.kljuc, v)}>
                {oznaka} <span aria-hidden="true">×</span>
                <span className="sr">— {t("ukloni", jezik)}</span>
              </button>
            ))}
            <button type="button" className={s.ocisti} onClick={ocisti}>
              {t("ocisti_sve", jezik)}
            </button>
          </div>
        )}

        <p className={s.brojac} role="status" aria-live="polite">
          {rezultata(rezultati.length, jezik)}
        </p>

        {rezultati.length === 0 ? (
          <div className={s.prazno}>
            <h2>{t("nema_za_filtre", jezik)}</h2>
            {najrestriktivniji && (
              <p>
                <button type="button" className={s.veza}
                        onClick={() => ukloniFacetu(najrestriktivniji.f.kljuc)}>
                  {t("ukloni_filtar", jezik)}: {najrestriktivniji.f.naziv}
                </button>{" "}
                — {rezultata(najrestriktivniji.dobitak, jezik)}
              </p>
            )}
            <p><button type="button" className={s.veza} onClick={ocisti}>{t("ocisti_sve", jezik)}</button></p>
          </div>
        ) : (
          <div className="mreza">{rezultati.map((x) => <div key={x.id}>{x.prikaz}</div>)}</div>
        )}
      </div>
    </div>
  );
}

import { NextResponse, type NextRequest } from "next/server";

/**
 * Pogl. 7.2: HR je na korijenu bez prefiksa, EN i DE u poddirektoriju.
 *
 * Interno sve živi pod /[jezik]/, pa se putanja bez prefiksa PREPISUJE na /hr/.
 * Namjerno prepisivanje, ne preusmjeravanje — Pogl. 7.4 zabranjuje automatsko
 * preusmjeravanje po jeziku ("Hrvat u Njemačkoj dobiva njemački"), a i URL u
 * adresnoj traci mora ostati /dogadanja, ne /hr/dogadanja.
 */
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/en") || pathname.startsWith("/de")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/hr${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|fonts|favicon|robots.txt|sitemap.xml|api).*)"],
};

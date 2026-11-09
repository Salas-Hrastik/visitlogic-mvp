/**
 * GET /api/baza — ručno održavana baza turističkog vodiča kao JSON.
 *
 * Koristi je Valpovački AI informator (dnevni cron) da bi uvezao lokalne usluge
 * (taksi, bankomati, parkirališta, trgovine, apartmani…) bez ručnog koraka.
 * Podaci su javni (bot ih ionako prikazuje korisnicima). Kratko CDN predmemoriranje.
 */
import { createHash } from 'crypto';
import { db } from './_database.js';

const body = JSON.stringify(db);
const etag = `"${createHash('sha256').update(body).digest('hex').slice(0, 16)}"`;

export default function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        return res.status(405).json({ error: 'Method not allowed' });
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    res.setHeader('ETag', etag);
    if (req.headers['if-none-match'] === etag) return res.status(304).end();
    return res.status(200).send(body);
}

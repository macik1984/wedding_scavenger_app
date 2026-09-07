const TOKEN_URL = 'https://oauth2.googleapis.com/token';

let cached = { token: null, expiresAt: 0 };

export function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Chyba konfiguracie: chyba premenna ${name}`);
  return v;
}

/**
 * Vymeni refresh token za access token. Vysledok drzime v pamati funkcie,
 * kym nevyprsi (Google dava 1 hodinu, my berieme 5 min rezervu).
 */
export async function getAccessToken() {
  const now = Date.now();
  if (cached.token && now < cached.expiresAt) return cached.token;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: requireEnv('GOOGLE_CLIENT_ID'),
      client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
      refresh_token: requireEnv('GOOGLE_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token error ${res.status}: ${body}`);
  }

  const data = await res.json();
  cached = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000 - 5 * 60 * 1000,
  };
  return cached.token;
}

/** Odstrani z nazvu suboru vsetko, co by robilo neporiadok v Drive. */
export function slugify(input, fallback = 'Host') {
  const s = String(input ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return s || fallback;
}

export function safeFilename(name) {
  const s = String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, '_')
    .slice(-80);
  return s || 'photo.jpg';
}

/**
 * Nazov v Drive nesie autora aj cas, takze nepotrebujeme ziadnu databazu:
 * 2026-09-05_2143__Zofia-Novakova__IMG_1234.jpg
 */
export function buildDriveName(guest, originalName) {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
  return `${stamp}__${slugify(guest)}__${safeFilename(originalName)}`;
}

/** Z nazvu suboru vytiahne meno hosta pre galeriu. */
export function guestFromDriveName(name) {
  const parts = String(name ?? '').split('__');
  if (parts.length < 3) return null;
  return parts[1].replace(/-/g, ' ');
}

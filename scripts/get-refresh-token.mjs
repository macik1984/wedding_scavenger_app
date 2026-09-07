/**
 * Jednorazovo ziska GOOGLE_REFRESH_TOKEN.
 *
 *   npm run token
 *
 * Potrebuje v .env.local uz vyplnene GOOGLE_CLIENT_ID a GOOGLE_CLIENT_SECRET
 * a v Google Cloud Console pridanu redirect URI http://localhost:5555/callback
 */
import http from 'node:http';
import { loadEnv, need } from './env.mjs';

loadEnv();

const CLIENT_ID = need('GOOGLE_CLIENT_ID');
const CLIENT_SECRET = need('GOOGLE_CLIENT_SECRET');
const REDIRECT = 'http://localhost:5555/callback';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });

console.log('\n  1) Otvor v prehliadaci tuto adresu a prihlas sa Google uctom,');
console.log('     kam maju fotky chodit:\n');
console.log('  ' + authUrl + '\n');
console.log('  2) Po odsuhlaseni sa vratis sem automaticky.\n');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:5555');
  if (url.pathname !== '/callback') {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Chyba: prehliadac nevratil kod.');
    return;
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT,
      grant_type: 'authorization_code',
    }),
  });

  const data = await tokenRes.json();

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(
    data.refresh_token
      ? '<h2>Hotovo. Vrat sa do terminalu.</h2>'
      : '<h2>Google nevratil refresh token. Skus znova.</h2>'
  );

  if (data.refresh_token) {
    console.log('  Hotovo. Do .env.local (a neskor do Vercelu) vloz:\n');
    console.log('  GOOGLE_REFRESH_TOKEN=' + data.refresh_token + '\n');
  } else {
    console.error('  Google nevratil refresh_token:', data);
  }

  server.close();
  setTimeout(() => process.exit(0), 300);
});

server.listen(5555);

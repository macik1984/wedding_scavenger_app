/**
 * Vytvori na Google Drive priecinok, do ktoreho budu chodit fotky.
 *
 *   npm run setup-folder -- "Svadobne fotky 2026"
 *
 * DOLEZITE: priecinok sa MUSI vytvorit tymto skriptom. Aplikacia ma OAuth
 * rozsah drive.file, ktory vidi len subory a priecinky, ktore sama vytvorila.
 * Rucne zalozeny priecinok by vracal 404.
 */
import { loadEnv, need } from './env.mjs';

loadEnv();

const name = process.argv[2] || 'Svadobne fotky';

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: need('GOOGLE_CLIENT_ID'),
    client_secret: need('GOOGLE_CLIENT_SECRET'),
    refresh_token: need('GOOGLE_REFRESH_TOKEN'),
    grant_type: 'refresh_token',
  }),
});

if (!tokenRes.ok) {
  console.error('\n  Nepodarilo sa ziskat access token:', await tokenRes.text(), '\n');
  process.exit(1);
}

const { access_token } = await tokenRes.json();

const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name,
    mimeType: 'application/vnd.google-apps.folder',
  }),
});

if (!res.ok) {
  console.error('\n  Vytvorenie priecinka zlyhalo:', await res.text(), '\n');
  process.exit(1);
}

const folder = await res.json();

console.log('\n  Priecinok vytvoreny: ' + folder.name);
console.log('  Odkaz: ' + folder.webViewLink);
console.log('\n  Do .env.local a do Vercelu vloz:\n');
console.log('  DRIVE_FOLDER_ID=' + folder.id + '\n');

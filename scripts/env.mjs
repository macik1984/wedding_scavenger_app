import fs from 'node:fs';
import path from 'node:path';

/** Nacita .env.local (a .env) bez toho, aby sme potrebovali dotenv. */
export function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) continue;
    for (const raw of fs.readFileSync(p, 'utf8').split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const i = line.indexOf('=');
      if (i === -1) continue;
      const key = line.slice(0, i).trim();
      let val = line.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  }
}

export function need(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`\n  Chyba: v .env.local chyba ${name}\n`);
    process.exit(1);
  }
  return v;
}

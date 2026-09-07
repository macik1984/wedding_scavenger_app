import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnostika nasadenia. Nikdy nevracia hodnoty premennych, len ci existuju
 * a kolko maju znakov - to staci na odhalenie chybajucej alebo useknutej
 * hodnoty, a zaroven sa tym nic neprezradi.
 */
function report(name) {
  const v = process.env[name];
  return { set: Boolean(v), length: v ? v.length : 0 };
}

export async function GET() {
  const env = {
    GOOGLE_CLIENT_ID: report('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: report('GOOGLE_CLIENT_SECRET'),
    GOOGLE_REFRESH_TOKEN: report('GOOGLE_REFRESH_TOKEN'),
    DRIVE_FOLDER_ID: report('DRIVE_FOLDER_ID'),
  };

  const missing = Object.entries(env)
    .filter(([, v]) => !v.set)
    .map(([k]) => k);

  if (missing.length) {
    return NextResponse.json({ ok: false, step: 'env', missing, env }, { status: 500 });
  }

  // Vymena refresh tokenu za access token - overi klienta aj token naraz
  let token;
  try {
    token = await getAccessToken();
  } catch (err) {
    return NextResponse.json(
      { ok: false, step: 'oauth', detail: String(err.message).slice(0, 400), env },
      { status: 500 }
    );
  }

  // Vidi appka ten priecinok?
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${process.env.DRIVE_FOLDER_ID}?fields=id,name,mimeType&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );

  if (!res.ok) {
    return NextResponse.json(
      {
        ok: false,
        step: 'folder',
        status: res.status,
        detail: (await res.text()).slice(0, 400),
        env,
      },
      { status: 500 }
    );
  }

  const folder = await res.json();
  return NextResponse.json({ ok: true, folder: { id: folder.id, name: folder.name }, env });
}

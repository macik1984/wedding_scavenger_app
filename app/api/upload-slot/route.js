import { NextResponse } from 'next/server';
import { getAccessToken, buildDriveName, requireEnv } from '@/lib/google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Vytvori na Google Drive resumable upload session a vrati prehliadacu URL,
 * na ktoru posle bajty priamo. Vercel funkcia tak nikdy nedrzi telo suboru
 * a nenarazime na jej 4.5 MB limit.
 */
export async function POST(request) {
  try {
    const { filename, mimeType, guest, size } = await request.json();

    if (!guest || !String(guest).trim()) {
      return NextResponse.json({ error: 'missing_guest' }, { status: 400 });
    }
    if (!filename) {
      return NextResponse.json({ error: 'missing_filename' }, { status: 400 });
    }

    const folderId = requireEnv('DRIVE_FOLDER_ID');
    const token = await getAccessToken();
    const name = buildDriveName(guest, filename);
    const contentType = mimeType || 'application/octet-stream';

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': contentType,
    };
    if (size) headers['X-Upload-Content-Length'] = String(size);

    // Google nastavuje CORS pravidla upload session podla hlavicky Origin,
    // ktoru dostane pri jej zakladani. Bez nej prehliadac PUT vobec neodosle.
    const origin = request.headers.get('origin');
    if (origin) headers['Origin'] = origin;

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          parents: [folderId],
          description: `Nahral: ${guest}`,
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error('drive resumable init failed', res.status, body);
      return NextResponse.json({ error: 'drive_init_failed' }, { status: 502 });
    }

    const uploadUrl = res.headers.get('location') || res.headers.get('Location');
    if (!uploadUrl) {
      return NextResponse.json({ error: 'no_upload_url' }, { status: 502 });
    }

    return NextResponse.json({ uploadUrl, name });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

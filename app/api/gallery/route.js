import { NextResponse } from 'next/server';
import { getAccessToken, requireEnv, guestFromDriveName } from '@/lib/google';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 48;

export async function GET(request) {
  try {
    const folderId = requireEnv('DRIVE_FOLDER_ID');
    const token = await getAccessToken();

    const pageToken = request.nextUrl.searchParams.get('pageToken');

    const params = new URLSearchParams({
      q:
        `'${folderId}' in parents and trashed = false and ` +
        `(mimeType contains 'image/' or mimeType contains 'video/')`,
      orderBy: 'createdTime desc',
      pageSize: String(PAGE_SIZE),
      fields: 'nextPageToken, files(id, name, createdTime, mimeType)',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('drive list failed', res.status, body);
      return NextResponse.json({ error: 'drive_list_failed' }, { status: 502 });
    }

    const data = await res.json();
    const files = (data.files ?? []).map((f) => ({
      id: f.id,
      guest: guestFromDriveName(f.name),
      createdTime: f.createdTime,
      video: String(f.mimeType ?? '').startsWith('video/'),
      thumb: `/api/photo/${f.id}?v=thumb`,
      full: `/api/photo/${f.id}?v=full`,
    }));

    return NextResponse.json({ files, nextPageToken: data.nextPageToken ?? null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

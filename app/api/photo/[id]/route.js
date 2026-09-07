import { getAccessToken } from '@/lib/google';

export const runtime = 'nodejs';

/**
 * Fotky v Drive su sukromne, takze ich nemozeme dat priamo do <img src>.
 * Tento endpoint ich pretoci cez server: nahlad z Drive thumbnailu,
 * plna verzia priamo z Drive.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  const variant = request.nextUrl.searchParams.get('v') ?? 'thumb';

  if (!/^[A-Za-z0-9_-]{10,}$/.test(id)) {
    return new Response('bad id', { status: 400 });
  }

  try {
    const token = await getAccessToken();

    if (variant === 'thumb') {
      const metaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${id}?fields=thumbnailLink,mimeType&supportsAllDrives=true`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      );
      if (metaRes.ok) {
        const meta = await metaRes.json();
        if (meta.thumbnailLink) {
          const big = meta.thumbnailLink.replace(/=s\d+$/, '=s800');
          const thumbRes = await fetch(big);
          if (thumbRes.ok) {
            return new Response(thumbRes.body, {
              headers: {
                'Content-Type': thumbRes.headers.get('content-type') ?? 'image/jpeg',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
              },
            });
          }
        }
      }
      // ak thumbnail nie je k dispozicii, spadneme na plnu verziu
    }

    const fileRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
    );

    if (!fileRes.ok) {
      return new Response('not found', { status: 404 });
    }

    return new Response(fileRes.body, {
      headers: {
        'Content-Type': fileRes.headers.get('content-type') ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
      },
    });
  } catch (err) {
    console.error(err);
    return new Response('error', { status: 500 });
  }
}

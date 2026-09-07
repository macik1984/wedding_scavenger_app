import { getAccessToken } from '@/lib/google';

export const runtime = 'nodejs';

/**
 * Fotky a videa v Drive su sukromne, takze ich nemozeme dat priamo do <img>.
 * Tento endpoint ich pretoci cez server: nahlad z Drive thumbnailu, plna
 * verzia priamo z Drive. Hlavicku Range preposielame, aby sa dalo vo videu
 * previjat.
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
        `https://www.googleapis.com/drive/v3/files/${id}?fields=thumbnailLink&supportsAllDrives=true`,
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
      // bez thumbnailu spadneme na plnu verziu
    }

    const range = request.headers.get('range');
    const upstream = {
      Authorization: `Bearer ${token}`,
    };
    if (range) upstream.Range = range;

    const fileRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`,
      { headers: upstream, cache: 'no-store' }
    );

    if (!fileRes.ok && fileRes.status !== 206) {
      return new Response('not found', { status: 404 });
    }

    const out = {
      'Content-Type': fileRes.headers.get('content-type') ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
      'Accept-Ranges': 'bytes',
    };
    const cr = fileRes.headers.get('content-range');
    const cl = fileRes.headers.get('content-length');
    if (cr) out['Content-Range'] = cr;
    if (cl) out['Content-Length'] = cl;

    return new Response(fileRes.body, { status: fileRes.status, headers: out });
  } catch (err) {
    console.error(err);
    return new Response('error', { status: 500 });
  }
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { t } from '../copy';
import useLang from '../useLang';
import Foot from '../Foot';
import { BotanicalTopRight } from '../Botanicals';

const POLL_MS = 30000;

export default function GalleryPage() {
  const [lang, setLang] = useLang();
  const c = t(lang);

  const [files, setFiles] = useState([]);
  const [nextToken, setNextToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  const loadFirstPage = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setFiles(data.files ?? []);
      setNextToken(data.nextPageToken ?? null);
    } catch {
      /* siet na svadbe byva vrtkava - o 30 s to skusime znova */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirstPage();
    const id = setInterval(loadFirstPage, POLL_MS);
    return () => clearInterval(id);
  }, [loadFirstPage]);

  async function loadMore() {
    if (!nextToken) return;
    try {
      const res = await fetch(`/api/gallery?pageToken=${encodeURIComponent(nextToken)}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      setFiles((prev) => {
        const seen = new Set(prev.map((f) => f.id));
        return [...prev, ...(data.files ?? []).filter((f) => !seen.has(f.id))];
      });
      setNextToken(data.nextPageToken ?? null);
    } catch {
      /* ignorujeme */
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <main className="sheet sheet--wide">
      <BotanicalTopRight />

      <div className="layer">
        <header className="head">
          <p className="eyebrow">{c.galleryTitle}</p>
          <h1 className="display" style={{ marginTop: 10 }}>
            {files.length ? c.selected(files.length) : c.galleryTitle}
          </h1>
          <hr className="dash" />
          <p className="lead">{c.galleryNote}</p>
        </header>

        {loading ? (
          <p className="muted">·</p>
        ) : files.length === 0 ? (
          <p className="muted">{c.empty}</p>
        ) : (
          <div className="grid">
            {files.map((f) => (
              <figure key={f.id} style={{ margin: 0 }}>
                <button type="button" className="tile" onClick={() => setOpen(f)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.thumb} alt={f.guest ?? ''} loading="lazy" decoding="async" />
                  {f.video && <span className="play">▶</span>}
                  {f.guest && <figcaption>{f.guest}</figcaption>}
                </button>
              </figure>
            ))}
          </div>
        )}

        {nextToken && (
          <p style={{ textAlign: 'center', marginTop: 20 }}>
            <button type="button" className="btn btn--quiet" onClick={loadMore}>
              {c.loadMore}
            </button>
          </p>
        )}

        <Foot lang={lang} onLang={setLang}>
          <p className="links" style={{ marginBottom: 18 }}>
            <Link href="/">← {c.back}</Link>
          </p>
        </Foot>
      </div>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <button type="button" className="close" aria-label={c.close}>
            ×
          </button>
          {open.video ? (
            <video
              src={open.full}
              controls
              autoPlay
              playsInline
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={open.full} alt={open.guest ?? ''} />
          )}
        </div>
      )}
    </main>
  );
}

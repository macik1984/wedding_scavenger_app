'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { t } from '../copy';
import useLang from '../useLang';
import LangSwitch from '../LangSwitch';

const COUPLE = process.env.NEXT_PUBLIC_COUPLE || '';
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
      /* siet na svadbe byva vrtkava - ticho skusime o 30 s znova */
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
      /* ignore */
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <main className="shell shell--wide">
      <div className="topbar">
        <span className="brand">{COUPLE || c.tagline}</span>
        <LangSwitch lang={lang} onChange={setLang} />
      </div>

      <header className="hero">
        <p className="eyebrow">{c.galleryTitle}</p>
        <h1>{files.length ? c.photos(files.length) : c.galleryTitle}</h1>
        <div className="rule" />
        <p>{c.gallerySub}</p>
      </header>

      {loading ? (
        <p className="muted">…</p>
      ) : files.length === 0 ? (
        <p className="muted">{c.empty}</p>
      ) : (
        <div className="grid">
          {files.map((f) => (
            <figure key={f.id} style={{ margin: 0 }}>
              <button type="button" className="tile" onClick={() => setOpen(f)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.thumb} alt={f.guest ?? ''} loading="lazy" decoding="async" />
                {f.guest && <figcaption>{f.guest}</figcaption>}
              </button>
            </figure>
          ))}
        </div>
      )}

      {nextToken && (
        <p className="center mt">
          <button type="button" className="btn btn--ghost" onClick={loadMore}>
            {c.loadMore}
          </button>
        </p>
      )}

      <p className="footer">
        <Link href="/">← {c.back}</Link>
      </p>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <button type="button" className="close" aria-label={c.close}>
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open.full} alt={open.guest ?? ''} />
        </div>
      )}
    </main>
  );
}

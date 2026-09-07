'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from '../copy';
import useLang from '../useLang';

const COUPLE = process.env.NEXT_PUBLIC_COUPLE || 'Kika a Miro';
const HOLD_MS = 7000; // ako dlho vydrzi jedna fotka
const POLL_MS = 30000;

/**
 * Premietanie pre projektor alebo televizor v sale. Ukazuje fotky dokola,
 * a ked pribudne nova, predbehne rad - hostia tak svoju fotku uvidia
 * krátko po odoslani, co ich vie prekvapit.
 *
 * Videa preskakujeme; na plátne by ich nikto nepocul.
 */
export default function SlideshowPage() {
  const [lang] = useLang();
  const c = t(lang);

  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const seenRef = useRef(new Set());
  const jumpRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const list = (data.files ?? []).filter((f) => !f.video);

      if (seenRef.current.size === 0) {
        list.forEach((f) => seenRef.current.add(f.id));
      } else {
        const fresh = list.filter((f) => !seenRef.current.has(f.id));
        fresh.forEach((f) => seenRef.current.add(f.id));
        if (fresh.length) jumpRef.current = fresh[0].id;
      }

      setPhotos(list);
    } catch {
      /* premietanie nesmie spadnut kvoli jednemu vypadku siete */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  useEffect(() => {
    if (photos.length === 0) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        if (jumpRef.current) {
          const at = photos.findIndex((f) => f.id === jumpRef.current);
          jumpRef.current = null;
          if (at >= 0) return at;
        }
        return (prev + 1) % photos.length;
      });
    }, HOLD_MS);
    return () => clearInterval(id);
  }, [photos]);

  function goFullscreen() {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }

  const current = photos[index % (photos.length || 1)];
  // Susedne fotky drzime v DOM, aby prechod nikdy necakal na stiahnutie.
  const neighbours = photos.length
    ? [photos[index % photos.length], photos[(index + 1) % photos.length]]
    : [];

  return (
    <main className="show">
      <p className="brand">{COUPLE}</p>

      {loaded && photos.length === 0 && <div className="empty">{c.slideshowEmpty}</div>}

      {neighbours.map((f) => (
        <figure key={f.id} data-on={current && f.id === current.id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.full} alt={f.guest ?? ''} />
          {f.guest && current && f.id === current.id && <figcaption>{f.guest}</figcaption>}
        </figure>
      ))}

      <button type="button" className="full" onClick={goFullscreen}>
        {c.slideshow}
      </button>
    </main>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { t } from './copy';
import useLang from './useLang';
import LangSwitch from './LangSwitch';

const NAME_KEY = 'wp_guest';
const COUPLE = process.env.NEXT_PUBLIC_COUPLE || '';

function humanSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Nahra jeden subor priamo do Google Drive cez resumable session URL. */
function putToDrive(uploadUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`drive ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('network'));
    xhr.send(file);
  });
}

export default function UploadPage() {
  const [lang, setLang] = useLang();
  const c = t(lang);

  const [guest, setGuest] = useState('');
  const [items, setItems] = useState([]); // { file, url, pct, state }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [doneCount, setDoneCount] = useState(0);
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NAME_KEY);
      if (saved) setGuest(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    return () => items.forEach((i) => URL.revokeObjectURL(i.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(fileList) {
    const picked = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (!picked.length) return;
    setItems((prev) => [
      ...prev,
      ...picked.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        pct: 0,
        state: 'pending',
      })),
    ]);
    setError('');
  }

  function removeAt(idx) {
    setItems((prev) => {
      const copyArr = [...prev];
      URL.revokeObjectURL(copyArr[idx].url);
      copyArr.splice(idx, 1);
      return copyArr;
    });
  }

  async function upload() {
    const name = guest.trim();
    if (!name) return setError(c.errName);
    if (!items.length) return setError(c.errFiles);

    try {
      window.localStorage.setItem(NAME_KEY, name);
    } catch {
      /* ignore */
    }

    setBusy(true);
    setError('');
    let ok = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.state === 'done') {
        ok++;
        continue;
      }
      const setState = (patch) =>
        setItems((prev) => prev.map((it, k) => (k === i ? { ...it, ...patch } : it)));

      try {
        setState({ state: 'uploading', pct: 0 });
        const res = await fetch('/api/upload-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: item.file.name,
            mimeType: item.file.type,
            size: item.file.size,
            guest: name,
          }),
        });
        if (!res.ok) throw new Error('slot');
        const { uploadUrl } = await res.json();
        await putToDrive(uploadUrl, item.file, (pct) => setState({ pct }));
        setState({ state: 'done', pct: 100 });
        ok++;
      } catch (err) {
        console.error(err);
        setState({ state: 'error' });
      }
    }

    setBusy(false);

    if (ok === items.length) {
      setDoneCount(ok);
      items.forEach((i) => URL.revokeObjectURL(i.url));
      setItems([]);
    } else {
      setError(c.errUpload);
    }
  }

  const totalPct = items.length
    ? Math.round(items.reduce((s, i) => s + i.pct, 0) / items.length)
    : 0;

  return (
    <main className="shell">
      <div className="topbar">
        <span className="brand">{COUPLE || c.tagline}</span>
        <LangSwitch lang={lang} onChange={setLang} />
      </div>

      {doneCount > 0 ? (
        <section className="card success">
          <div className="mark">✓</div>
          <h2>{c.done}</h2>
          <p className="hint">{c.photos(doneCount)}</p>
          <div className="mt">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setDoneCount(0);
                setError('');
              }}
            >
              {c.doneMore}
            </button>
          </div>
          <div className="mt">
            <Link className="hint" href="/gallery">
              {c.gallery} →
            </Link>
          </div>
        </section>
      ) : (
        <>
          <header className="hero">
            <p className="eyebrow">{c.tagline}</p>
            <h1>{c.heading}</h1>
            <div className="rule" />
            <p>{c.intro}</p>
          </header>

          <section className="card">
            <div className="field">
              <label htmlFor="guest">{c.nameLabel}</label>
              <input
                id="guest"
                type="text"
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                placeholder={c.namePlaceholder}
                autoComplete="name"
                enterKeyHint="done"
              />
              <p className="hint">{c.nameHint}</p>
            </div>

            <div
              className="drop"
              data-over={over}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                addFiles(e.dataTransfer.files);
              }}
            >
              <div className="icon">◫</div>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => inputRef.current?.click()}
              >
                {items.length ? c.pickMore : c.pick}
              </button>
              <p className="hint" style={{ marginTop: 10 }}>
                {c.dropHint}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>

            {items.length > 0 && (
              <ul className="files">
                {items.map((item, i) => (
                  <li key={`${item.file.name}-${i}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="thumb" src={item.url} alt="" />
                    <div className="meta">
                      <div className="name">{item.file.name}</div>
                      <div className="sub">
                        {item.state === 'done' && <span className="state-ok">✓ 100%</span>}
                        {item.state === 'error' && <span className="state-err">✕</span>}
                        {item.state === 'uploading' && `${item.pct}%`}
                        {item.state === 'pending' && humanSize(item.file.size)}
                      </div>
                      {item.state === 'uploading' && (
                        <div className="bar">
                          <span style={{ width: `${item.pct}%` }} />
                        </div>
                      )}
                    </div>
                    {!busy && (
                      <button
                        type="button"
                        className="remove"
                        aria-label="remove"
                        onClick={() => removeAt(i)}
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {error && <div className="alert">{error}</div>}

            <div className="mt">
              <button
                type="button"
                className="btn btn--primary"
                disabled={busy || !items.length}
                onClick={upload}
              >
                {busy ? `${c.uploading} ${totalPct}%` : `${c.upload} ${items.length ? `(${items.length})` : ''}`}
              </button>
            </div>
          </section>

          <p className="footer">
            <Link href="/gallery">{c.gallery} →</Link>
          </p>
        </>
      )}
    </main>
  );
}

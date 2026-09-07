'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { t } from './copy';
import useLang from './useLang';
import Foot from './Foot';
import { BotanicalTopRight, BotanicalBottomLeft } from './Botanicals';
import CameraIcon from './CameraIcon';

const NAME_KEY = 'wp_guest';
const MISSION_KEY = 'wp_missions';
const COUPLE = process.env.NEXT_PUBLIC_COUPLE || 'Kika a Miro';

// 3 MB: nasobok 256 kB, ako vyzaduje Google, a zaroven pod 4,5 MB limit Vercelu
const CHUNK = 3 * 1024 * 1024;

function humanSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* uloziska mozu byt vypnute */
  }
}

/** Priamy PUT do Google Drive cez resumable session URL. */
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
    xhr.onerror = () => reject(new Error('cors'));
    xhr.send(file);
  });
}

async function chunkCall(uploadUrl, range, body) {
  const res = await fetch(`/api/upload-chunk?url=${encodeURIComponent(uploadUrl)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream', 'x-content-range': range },
    body,
  });
  if (!res.ok) throw new Error(`chunk ${res.status}`);
  return res.json();
}

/**
 * Zaloha, ked priamy PUT neprejde. Najprv zistime, kolko uz Google ma:
 * priamy upload mohol prejst a len odpoved zhorela na CORS.
 */
async function putViaServer(uploadUrl, file, onProgress) {
  const status = await chunkCall(uploadUrl, `bytes */${file.size}`, null);
  if (status.done) {
    onProgress(100);
    return;
  }

  let start = status.received ?? 0;
  onProgress(Math.round((start / file.size) * 100));

  while (start < file.size) {
    const end = Math.min(start + CHUNK, file.size);
    const out = await chunkCall(
      uploadUrl,
      `bytes ${start}-${end - 1}/${file.size}`,
      file.slice(start, end)
    );
    start = out.done ? file.size : out.received || end;
    onProgress(Math.round((start / file.size) * 100));
    if (out.done) return;
  }
}

export default function UploadPage() {
  const [lang, setLang] = useLang();
  const c = t(lang);

  const [guest, setGuest] = useState('');
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [doneCount, setDoneCount] = useState(0);
  const [over, setOver] = useState(false);
  const [ticked, setTicked] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = readStore(NAME_KEY, '');
    if (typeof saved === 'string' && saved) setGuest(saved);
    const marks = readStore(MISSION_KEY, []);
    if (Array.isArray(marks)) setTicked(marks);
  }, []);

  function toggleMission(i) {
    setTicked((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      writeStore(MISSION_KEY, next);
      return next;
    });
  }

  function addFiles(fileList) {
    const picked = Array.from(fileList).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (!picked.length) return;
    setItems((prev) => [
      ...prev,
      ...picked.map((file) => ({
        file,
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        video: file.type.startsWith('video/'),
        pct: 0,
        state: 'pending',
      })),
    ]);
    setError('');
  }

  function removeAt(idx) {
    setItems((prev) => {
      const next = [...prev];
      if (next[idx].url) URL.revokeObjectURL(next[idx].url);
      next.splice(idx, 1);
      return next;
    });
  }

  async function upload() {
    const name = guest.trim();
    if (!name) return setError(c.errName);
    if (!items.length) return setError(c.errFiles);

    writeStore(NAME_KEY, name);
    setBusy(true);
    setError('');

    let ok = 0;
    let lastReason = '';

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

        if (!res.ok) {
          let why = `slot ${res.status}`;
          try {
            const j = await res.json();
            if (j.error) why = `slot ${res.status}: ${j.error}`;
          } catch {
            /* odpoved nemusi byt JSON */
          }
          throw new Error(why);
        }

        const { uploadUrl } = await res.json();

        try {
          await putToDrive(uploadUrl, item.file, (pct) => setState({ pct }));
        } catch {
          setState({ pct: 0 });
          await putViaServer(uploadUrl, item.file, (pct) => setState({ pct }));
        }

        setState({ state: 'done', pct: 100 });
        ok++;
      } catch (err) {
        lastReason = err?.message ? String(err.message) : 'unknown';
        setState({ state: 'error' });
      }
    }

    setBusy(false);

    if (ok === items.length) {
      setDoneCount(ok);
      items.forEach((i) => i.url && URL.revokeObjectURL(i.url));
      setItems([]);
    } else {
      setError(lastReason ? `${c.errUpload} (${lastReason})` : c.errUpload);
    }
  }

  const totalPct = items.length
    ? Math.round(items.reduce((s, i) => s + i.pct, 0) / items.length)
    : 0;

  return (
    <main className="sheet">
      <BotanicalTopRight />
      <BotanicalBottomLeft />

      <div className="layer">
        {doneCount > 0 ? (
          <section className="panel thanks">
            <div className="mark script">{c.thanksMark}</div>
            <p className="big">{c.thanksTitle}</p>
            <p className="note">{c.thanksNote(doneCount)}</p>
            <div style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn btn--quiet"
                onClick={() => {
                  setDoneCount(0);
                  setError('');
                }}
              >
                {c.more}
              </button>
            </div>
            <p className="note" style={{ marginTop: 16 }}>
              <Link href="/gallery">{c.gallery} →</Link>
            </p>
          </section>
        ) : (
          <>
            <header className="head">
              <p className="eyebrow">{c.eyebrow}</p>
              <h1 className="names script">{COUPLE}</h1>
              <hr className="dash" />
              <p className="display">{c.title}</p>
              <p className="lead">{c.lead}</p>
            </header>

            <section className="panel">
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
                <p className="note">{c.nameNote}</p>
              </div>

              <button
                type="button"
                className="pick"
                data-over={over}
                onClick={() => inputRef.current?.click()}
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
                <CameraIcon />
                <span className="big">{items.length ? c.pickMore : c.pick}</span>
                <span className="note">{c.pickNote}</span>
              </button>

              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
              />

              {items.length > 0 && (
                <ul className="files">
                  {items.map((item, i) => (
                    <li key={`${item.file.name}-${i}`}>
                      {item.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="thumb" src={item.url} alt="" />
                      ) : (
                        <span
                          className="thumb"
                          style={{
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 11,
                            color: 'var(--ink-soft)',
                          }}
                        >
                          ▶
                        </span>
                      )}
                      <div className="meta">
                        <div className="name">{item.file.name}</div>
                        <div className="sub">
                          {item.state === 'done' && <span className="state-ok">✓</span>}
                          {item.state === 'error' && <span className="state-err">✕</span>}
                          {item.state === 'uploading' && `${item.pct} %`}
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
                          className="drop"
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

              <div style={{ marginTop: 18 }}>
                <button
                  type="button"
                  className="btn"
                  disabled={busy || !items.length}
                  onClick={upload}
                >
                  {busy
                    ? `${c.uploading} ${totalPct} %`
                    : items.length
                      ? `${c.upload} · ${c.selected(items.length)}`
                      : c.upload}
                </button>
              </div>

              <details className="missions">
                <summary>
                  <span>{c.missionsTitle}</span>
                  <span className="chev" aria-hidden="true">
                    ⌄
                  </span>
                </summary>
                <ul>
                  {c.missions.map((m, i) => (
                    <li key={m}>
                      <label>
                        <input
                          type="checkbox"
                          checked={ticked.includes(i)}
                          onChange={() => toggleMission(i)}
                        />
                        <span>{m}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="closing">{c.missionsClosing}</p>
              </details>
            </section>
          </>
        )}

        <Foot lang={lang} onLang={setLang}>
          {doneCount === 0 && (
            <p className="links" style={{ marginBottom: 18 }}>
              <Link href="/gallery">{c.gallery} →</Link>
            </p>
          )}
        </Foot>
      </div>
    </main>
  );
}

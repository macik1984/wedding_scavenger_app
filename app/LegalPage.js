'use client';

import Link from 'next/link';
import { l } from './legal';
import useLang from './useLang';
import LangSwitch from './LangSwitch';

const COUPLE = process.env.NEXT_PUBLIC_COUPLE || '';
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';

export default function LegalPage({ kind }) {
  const [lang, setLang] = useLang();
  const c = l(lang);

  const title = kind === 'terms' ? c.termsTitle : c.privacyTitle;
  const sections = kind === 'terms' ? c.terms : c.privacy;

  return (
    <main className="shell">
      <div className="topbar">
        <span className="brand">{COUPLE || 'Wedding'}</span>
        <LangSwitch lang={lang} onChange={setLang} />
      </div>

      <header className="hero">
        <h1 style={{ fontSize: 'clamp(30px, 7vw, 44px)' }}>{title}</h1>
        <div className="rule" />
        {kind !== 'terms' && <p className="hint">{c.privacyUpdated}</p>}
      </header>

      <section className="card">
        {sections.map(([h, body]) => (
          <div key={h} style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 22, margin: '0 0 6px' }}>{h}</h2>
            <p style={{ margin: 0, color: 'var(--ink-soft)' }}>{body}</p>
          </div>
        ))}

        {CONTACT && (
          <div>
            <h2 style={{ fontSize: 22, margin: '0 0 6px' }}>{c.contact}</h2>
            <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
              <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
            </p>
          </div>
        )}
      </section>

      <p className="footer">
        <Link href="/">← {c.back}</Link>
      </p>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { l } from './legal';
import { t } from './copy';
import useLang from './useLang';
import Foot from './Foot';
import { BotanicalTopRight } from './Botanicals';

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';

export default function LegalPage({ kind }) {
  const [lang, setLang] = useLang();
  const c = l(lang);
  const ui = t(lang);

  const title = kind === 'terms' ? c.termsTitle : c.privacyTitle;
  const sections = kind === 'terms' ? c.terms : c.privacy;

  return (
    <main className="sheet">
      <BotanicalTopRight />

      <div className="layer">
        <header className="head">
          <p className="display" style={{ fontSize: 'clamp(20px, 6vw, 28px)' }}>
            {title}
          </p>
          <hr className="dash" />
          {kind !== 'terms' && <p className="note">{c.privacyUpdated}</p>}
        </header>

        <section className="panel legal">
          {sections.map(([h, body]) => (
            <section key={h}>
              <h2>{h}</h2>
              <p>{body}</p>
            </section>
          ))}

          {CONTACT && (
            <section>
              <h2>{c.contact}</h2>
              <p>
                <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
              </p>
            </section>
          )}
        </section>

        <Foot lang={lang} onLang={setLang}>
          <p className="links" style={{ marginBottom: 18 }}>
            <Link href="/">← {ui.back}</Link>
          </p>
        </Foot>
      </div>
    </main>
  );
}

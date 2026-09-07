'use client';

import Link from 'next/link';
import LangLine from './LangLine';
import { t } from './copy';

const COUPLE = process.env.NEXT_PUBLIC_COUPLE || 'Kika a Miro';
const DATE = process.env.NEXT_PUBLIC_WEDDING_DATE || '18. 9. 2026';

export default function Foot({ lang, onLang, children }) {
  const c = t(lang);
  return (
    <footer className="foot">
      {children}
      <p className="date">{DATE}</p>
      <p className="sig script">{COUPLE}</p>
      <p className="links">
        <Link href="/privacy">{c.privacy}</Link>
        {' · '}
        <Link href="/terms">{c.terms}</Link>
      </p>
      <LangLine lang={lang} onChange={onLang} />
    </footer>
  );
}

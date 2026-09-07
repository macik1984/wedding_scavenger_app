'use client';

import { LANGS, copy } from './copy';

/** Diskretny prepinac v paticke pre pripad, ze prehliadac hosta trafi vedla. */
export default function LangLine({ lang, onChange }) {
  return (
    <div className="langline">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          data-active={l === lang}
          aria-pressed={l === lang}
          onClick={() => onChange(l)}
        >
          {copy[l].label}
        </button>
      ))}
    </div>
  );
}

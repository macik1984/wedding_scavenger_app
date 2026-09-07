'use client';

import { LANGS, copy } from './copy';

export default function LangSwitch({ lang, onChange }) {
  return (
    <div className="langswitch" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          data-active={l === lang}
          onClick={() => onChange(l)}
          aria-pressed={l === lang}
        >
          {copy[l].label}
        </button>
      ))}
    </div>
  );
}

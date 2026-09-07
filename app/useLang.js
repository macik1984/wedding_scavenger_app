'use client';

import { useEffect, useState } from 'react';

const KEY = 'wp_lang';

export default function useLang() {
  const [lang, setLang] = useState('sk');

  useEffect(() => {
    let saved = null;
    try {
      saved = window.localStorage.getItem(KEY);
    } catch {
      /* niektore prehliadace maju uloziska vypnute */
    }
    if (saved === 'sk' || saved === 'en') {
      setLang(saved);
    } else if (typeof navigator !== 'undefined' && !navigator.language?.startsWith('sk')) {
      setLang('en');
    }
  }, []);

  const change = (next) => {
    setLang(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  };

  return [lang, change];
}

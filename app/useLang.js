'use client';

import { useEffect, useState } from 'react';
import { detectLang } from './copy';

const KEY = 'wp_lang';

/**
 * Jazyk sa urcuje z nastavenia prehliadaca. Ked si ho host raz prepne
 * rucne, jeho volba ma prednost - ulozime si ju v jeho zariadeni.
 *
 * Prvy render je vzdy 'sk', aby sa server a klient zhodli; skutocny jazyk
 * dosadime hned v efekte.
 */
export default function useLang() {
  const [lang, setLang] = useState('sk');

  useEffect(() => {
    let saved = null;
    try {
      saved = window.localStorage.getItem(KEY);
    } catch {
      /* prehliadac moze mat uloziska vypnute */
    }
    setLang(saved === 'sk' || saved === 'en' ? saved : detectLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const change = (next) => {
    setLang(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* ignorujeme */
    }
  };

  return [lang, change];
}

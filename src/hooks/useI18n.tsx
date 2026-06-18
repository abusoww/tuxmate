'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { getTranslations, formatI18n, type I18n, type Locale } from '@/lib/i18n';

const STORAGE_KEY = 'parchmate_locale';

interface I18nContextType {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: I18n;
  setLocale: (locale: Locale) => void;
  fmt: (template: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === 'fa' || saved === 'en') {
        setLocaleState(saved);
      }
    } catch { }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch { }
    document.documentElement.lang = locale === 'fa' ? 'fa' : 'en';
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  }, [locale, hydrated]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const t = useMemo(() => getTranslations(locale), [locale]);

  const fmt = useCallback((template: string, vars?: Record<string, string | number>) => {
    return formatI18n(template, vars);
  }, []);

  // When not hydrated, use en defaults to avoid flash
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ locale, dir, t, setLocale, fmt } as I18nContextType}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

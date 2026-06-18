'use client';

import { useI18n } from '@/hooks/useI18n';
import { Languages } from 'lucide-react';
import { type Locale } from '@/lib/i18n';

export function LocaleToggle() {
  const { locale, setLocale } = useI18n();

  const toggle = () => {
    const newLocale: Locale = locale === 'en' ? 'fa' : 'en';
    setLocale(newLocale);
    window.location.reload();
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-[12px]"
      title={locale === 'en' ? 'فارسی' : 'English'}
      aria-label={locale === 'en' ? 'Switch to Persian' : 'تغییر به انگلیسی'}
    >
      <Languages className="w-4 h-4" />
      <span className="text-[11px] font-semibold">{locale === 'en' ? 'FA' : 'EN'}</span>
    </button>
  );
}

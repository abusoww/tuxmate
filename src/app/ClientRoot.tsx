'use client';

import { useEffect } from 'react';
import { I18nProvider, useI18n } from '@/hooks/useI18n';

function DirManager({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale === 'fa' ? 'fa' : 'en';
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  }, [locale]);

  return <>{children}</>;
}

export function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <DirManager>
        {children}
      </DirManager>
    </I18nProvider>
  );
}

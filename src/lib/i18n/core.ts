import { en, type I18n } from './en';
import { fa } from './fa';

export type Locale = 'en' | 'fa';
export { type I18n };

const translations: Record<Locale, I18n> = { en, fa };

export function getTranslations(locale: Locale): I18n {
  return translations[locale] || en;
}

export function formatI18n(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

export { en, fa };

import { personNameMaxLength } from '@scribble-table/protocol';
import { languages, type Language } from '../i18n';
import type { PreferencesService } from './types';

const languageKey = 'scribble-table:language';
const nameKey = 'scribble-table:name';

const read = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked (private mode, site data off); preferences then just don't persist.
  }
};

const isLanguage = (value: string | null): value is Language =>
  value !== null && (languages as readonly string[]).includes(value);

const toName = (value: string | null): string | null => {
  const name = value?.trim().slice(0, personNameMaxLength);

  return name ? name : null;
};

export const createPreferences = (): PreferencesService => ({
  loadLanguage: () => {
    const value = read(languageKey);

    return isLanguage(value) ? value : null;
  },
  saveLanguage: (language) => write(languageKey, language),
  loadName: () => toName(read(nameKey)),
  saveName: (name) => write(nameKey, name),
});

import type { Language, TranslationKey, TranslationValues } from '../i18n';

// This browser's own settings, kept in localStorage.
export interface PreferencesService {
  loadLanguage: () => Language | null;
  saveLanguage: (language: Language) => void;
}

export interface TranslatorService {
  translate: (language: Language, key: TranslationKey, values?: TranslationValues) => string;
  formatTime: (language: Language, at: number) => string;
}

export interface HealthApiService {
  // Whether core-api answers GET /api/health. Never throws: a network failure is just `false`.
  isUp: () => Promise<boolean>;
}

// Everything stores need from the outside world, created once in index.tsx.
export interface Services {
  preferences: PreferencesService;
  translator: TranslatorService;
  healthApi: HealthApiService;
  // The browser's languages, most preferred first (navigator.languages).
  browserLanguages: readonly string[];
}

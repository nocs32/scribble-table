import { createHealthApi } from './health-api';
import { createPreferences } from './preferences';
import { createTranslator } from './translator';
import type { Services } from './types';

export type { HealthApiService, PreferencesService, Services, TranslatorService } from './types';

export const createServices = (): Services => ({
  preferences: createPreferences(),
  translator: createTranslator(),
  healthApi: createHealthApi(),
  browserLanguages: navigator.languages.length > 0 ? navigator.languages : [navigator.language],
});

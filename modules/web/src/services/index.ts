import { eraserSoundUrl, pencilSoundUrl, spraySoundUrl } from '../assets';
import { createAddress } from './address';
import { BoardSounds } from './board-sounds';
import { createDemoTable } from './demo-table';
import { createLiveTable } from './live-table';
import { createPreferences } from './preferences';
import { createTranslator } from './translator';
import type { Schedule, Services } from './types';

export type {
  AddressService,
  BoardSoundsService,
  ClipboardService,
  DemoControls,
  PreferencesService,
  Schedule,
  Services,
  SoundPreference,
  TableClientService,
  TableConnectionState,
  TableLink,
  TableLinkListeners,
  TableOpenFailure,
  TableOpenResult,
  TranslatorService,
} from './types';

const schedule: Schedule = (callback, delayMs) => {
  const timer = window.setTimeout(callback, delayMs);

  return () => window.clearTimeout(timer);
};

const repeat: Schedule = (callback, intervalMs) => {
  const timer = window.setInterval(callback, intervalMs);

  return () => window.clearInterval(timer);
};

const createId = (): string => crypto.randomUUID();

const isDemo = import.meta.env.MODE === 'demo';

export const createServices = (): Services => ({
  preferences: createPreferences(),
  translator: createTranslator(),
  clipboard: { writeText: (text) => navigator.clipboard.writeText(text) },
  address: createAddress(),
  // Live tables on core-api; `pnpm demo` (Vite's demo mode) plays at the demo table instead: a
  // referee and sample players in the browser, with no server, for working on the UI alone.
  tableClient: isDemo ? createDemoTable({ schedule, random: Math.random, now: Date.now, createId }) : createLiveTable(window.location.origin, Date.now),
  sounds: new BoardSounds(window, { pencil: pencilSoundUrl, eraser: eraserSoundUrl, spray: spraySoundUrl }),
  schedule,
  repeat,
  random: Math.random,
  now: Date.now,
  createId,
  origin: window.location.origin,
  browserLanguages: navigator.languages.length > 0 ? navigator.languages : [navigator.language],
});

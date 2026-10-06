import type { BoardOp, TableIntents, TableIntentType, TableReactionEvent, TableSecret, TableSnapshot } from '@scribble-table/protocol';
import type { Language, TranslationKey, TranslationValues } from '../i18n';

export interface SoundPreference {
  // 0–100.
  volume: number;
  muted: boolean;
}

// This browser's own settings, kept in localStorage.
export interface PreferencesService {
  loadLanguage: () => Language | null;
  saveLanguage: (language: Language) => void;
  loadName: () => string | null;
  saveName: (name: string) => void;
  loadSound: () => SoundPreference | null;
  saveSound: (sound: SoundPreference) => void;
}

// What the drawer does, as sound: a line (pencil or eraser) and a fill (spray).
export interface BoardSoundsService {
  // `distance` board units drawn over `ms` milliseconds.
  scratch: (eraser: boolean, distance: number, ms: number) => void;
  spray: () => void;
  // 0 is silent, 1 is full volume.
  setLevel: (level: number) => void;
}

export interface TranslatorService {
  translate: (language: Language, key: TranslationKey, values?: TranslationValues) => string;
  formatTime: (language: Language, at: number) => string;
}

export interface ClipboardService {
  writeText: (text: string) => Promise<void>;
}

// Runs `callback` later (once, or on an interval) and returns a function that cancels it.
export type Schedule = (callback: () => void, delayMs: number) => () => void;

// The table's address: /r/:roomId.
export interface AddressService {
  roomId: () => string | null;
  showRoom: (roomId: string) => void;
}

export interface TableLinkListeners {
  snapshot: (snapshot: TableSnapshot) => void;
  secret: (secret: TableSecret) => void;
  // What the drawer does, when someone else draws.
  board: (op: BoardOp) => void;
  // Someone else's reaction.
  reaction: (event: TableReactionEvent) => void;
}

// Buttons for trying the game alone: only the demo table has them.
export interface DemoControls {
  skip: () => void;
  drawNext: () => void;
  addPlayer: () => void;
  removePlayer: () => void;
}

// An open table: who you are there, and a way to ask for things.
export interface TableLink {
  readonly roomId: string;
  readonly meId: string;
  readonly demo: DemoControls | null;
  send: <T extends TableIntentType>(type: T, message: TableIntents[T]) => void;
  close: () => void;
}

export interface TableClientService {
  // Joins the table at `roomId`, or sets up a new one when it's null.
  open: (roomId: string | null, name: string | null, listeners: TableLinkListeners) => Promise<TableLink>;
}

// Everything stores need from the outside world, created once in index.tsx.
export interface Services {
  preferences: PreferencesService;
  translator: TranslatorService;
  clipboard: ClipboardService;
  address: AddressService;
  tableClient: TableClientService;
  sounds: BoardSoundsService;
  schedule: Schedule;
  repeat: Schedule;
  random: () => number;
  now: () => number;
  createId: () => string;
  origin: string;
  // The browser's languages, most preferred first (navigator.languages).
  browserLanguages: readonly string[];
}

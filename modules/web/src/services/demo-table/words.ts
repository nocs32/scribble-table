import type { DemoWord } from './types';

// The demo's own sample words. They are shown while the UI is reviewed, so the real word lists
// must never contain them (spec D9a). They're all simple: the two tagged hard only stand in, so
// the Hard badge shows up in the word choice.
export const demoWords: readonly DemoWord[] = [
  { forms: { en: 'snowman', uk: 'сніговик' }, alternatives: [], difficulty: 'easy', sketch: 'snowman' },
  { forms: { en: 'rainbow', uk: 'веселка' }, alternatives: ['райдуга'], difficulty: 'easy', sketch: 'rainbow' },
  { forms: { en: 'balloon', uk: 'повітряна кулька' }, alternatives: ['кулька'], difficulty: 'easy', sketch: 'balloon' },
  { forms: { en: 'cactus', uk: 'кактус' }, alternatives: [], difficulty: 'easy', sketch: 'cactus' },
  { forms: { en: 'candle', uk: 'свічка' }, alternatives: [], difficulty: 'easy', sketch: 'candle' },
  { forms: { en: 'mushroom', uk: 'гриб' }, alternatives: ['грибок'], difficulty: 'easy', sketch: 'mushroom' },
  { forms: { en: 'glasses', uk: 'окуляри' }, alternatives: ['spectacles'], difficulty: 'medium', sketch: 'glasses' },
  { forms: { en: 'lollipop', uk: 'льодяник' }, alternatives: [], difficulty: 'medium', sketch: 'lollipop' },
  { forms: { en: 'sailboat', uk: 'вітрильник' }, alternatives: ['sailing boat'], difficulty: 'medium', sketch: 'sailboat' },
  { forms: { en: 'ladder', uk: 'драбина' }, alternatives: [], difficulty: 'easy', sketch: 'ladder' },
  { forms: { en: 'kite', uk: 'повітряний змій' }, alternatives: ['змій'], difficulty: 'hard', sketch: 'kite' },
  { forms: { en: 'dice', uk: 'кубик' }, alternatives: ['die', 'гральний кубик'], difficulty: 'hard', sketch: 'dice' },
];

// A custom word exists only as typed, so it is the same in both languages.
export const customWord = (word: string): DemoWord => ({ forms: { en: word, uk: word }, alternatives: [], difficulty: 'medium', sketch: null });

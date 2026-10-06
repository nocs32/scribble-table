// Public API of the game engine: pure logic, no DOM, no Node.
export { createRandom, randomBetween, shuffle } from './random.js';
export { editDistance, judgeGuess, tidyGuess, type GuessVerdict } from './guess.js';
export { hintOrder, hintsDue, letterPositions, maskChar, maskWord, wordLengths } from './hints.js';
export { drawerPoints, guesserPoints, rankByScore, type Placed } from './scoring.js';
export { floodFill, type Rgba } from './flood-fill.js';
export { applySettings, changedSettings, settingValue, tidyCustomWords } from './settings.js';
export { customWordForms, pickWordChoices, wordKey, type PickableWord } from './words.js';
export { decodeDrawing, encodeDrawing } from './drawing-bytes.js';

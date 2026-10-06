import type { BoardSoundsService } from './types';

type ScratchTone = 'pencil' | 'eraser';

interface ToneShape {
  // The band of noise it keeps (Hz), and how wide it is.
  frequency: number;
  q: number;
  // The loudest it gets, before the volume setting.
  peak: number;
  // How much the level flickers (0–1), and how often (s): paper grain, or rubbing back and forth.
  grain: number;
  grainStep: number;
}

interface Voice {
  gain: GainNode;
  filter: BiquadFilterNode;
  shape: ToneShape;
}

// The tuning, all in one place. Kept quiet on purpose: it plays for every line, for everyone.
export const scratchShapes: Record<ScratchTone, ToneShape> = {
  pencil: { frequency: 3400, q: 0.8, peak: 0.3, grain: 0.55, grainStep: 0.012 },
  eraser: { frequency: 900, q: 0.6, peak: 0.46, grain: 0.35, grainStep: 0.045 },
};

// Board units per millisecond that count as a fast line: the faster, the louder, up to the peak.
const fastSpeed = 1.2;
const quietest = 0.2;
const fadeOut = 0.035;
const sprayPeak = 0.32;

export const makeNoise = (context: BaseAudioContext): AudioBuffer => {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index++) data[index] = Math.random() * 2 - 1;

  return buffer;
};

// Looping noise through a band-pass filter, silent until something is drawn.
export const makeVoice = (context: BaseAudioContext, noise: AudioBuffer, destination: AudioNode, shape: ToneShape): Voice => {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = noise;
  source.loop = true;
  filter.type = 'bandpass';
  filter.frequency.value = shape.frequency;
  filter.Q.value = shape.q;
  gain.gain.value = 0;
  source.connect(filter).connect(gain).connect(destination);
  source.start();

  return { gain, filter, shape };
};

// `distance` board units drawn over `ms`, from `at`: louder (and a touch higher) the faster it
// goes, with a flicker, then it fades unless more comes.
export const scratch = (voice: Voice, at: number, distance: number, ms: number): void => {
  const { gain, filter, shape } = voice;
  const seconds = Math.max(ms, 1) / 1000;
  const speed = Math.min(1, distance / Math.max(ms, 1) / fastSpeed);
  const level = shape.peak * (quietest + (1 - quietest) * speed);
  const steps = Math.max(1, Math.round(seconds / shape.grainStep));

  gain.gain.cancelScheduledValues(at);
  gain.gain.setValueAtTime(gain.gain.value, at);
  filter.frequency.setTargetAtTime(shape.frequency * (0.85 + 0.3 * speed), at, 0.05);

  for (let step = 0; step < steps; step++) {
    gain.gain.setTargetAtTime(level * (1 - shape.grain * Math.random()), at + step * shape.grainStep, shape.grainStep / 3);
  }

  gain.gain.setTargetAtTime(0, at + seconds + 0.03, fadeOut);
};

// A short "pssht": bright noise that comes in fast, sags a little and fades out.
export const spray = (context: BaseAudioContext, noise: AudioBuffer, destination: AudioNode, at: number): void => {
  const source = context.createBufferSource();
  const highpass = context.createBiquadFilter();
  const hiss = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = noise;
  highpass.type = 'highpass';
  highpass.frequency.value = 2500;
  hiss.type = 'peaking';
  hiss.frequency.value = 7000;
  hiss.gain.value = 6;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(sprayPeak, at + 0.03);
  gain.gain.setTargetAtTime(sprayPeak * 0.7, at + 0.03, 0.12);
  gain.gain.setTargetAtTime(0, at + 0.28, 0.06);
  source.connect(highpass).connect(hiss).connect(gain).connect(destination);
  source.start(at, Math.random() * 1.2, 0.6);
};

// The drawer's pencil, eraser and fill as sound, made from filtered noise (no sound files).
// Browsers allow audio only after a click or a key press on the page, so it starts on the first one.
export class BoardSounds implements BoardSoundsService {
  #context: AudioContext | null = null;
  #master: GainNode | null = null;
  #noise: AudioBuffer | null = null;
  #voices: Record<ScratchTone, Voice> | null = null;
  #level = 0;

  constructor(target: Window) {
    target.addEventListener('pointerdown', this.#unlock, true);
    target.addEventListener('keydown', this.#unlock, true);
  }

  setLevel(level: number): void {
    this.#level = level;

    const context = this.#context;

    if (!context || !this.#master) return;

    // Squared, so the slider feels even to the ear. Muted, the context sleeps.
    this.#master.gain.setTargetAtTime(level * level, context.currentTime, 0.05);
    void (level > 0 ? context.resume() : context.suspend());
  }

  scratch(eraser: boolean, distance: number, ms: number): void {
    const context = this.#running();

    if (context && this.#voices) scratch(this.#voices[eraser ? 'eraser' : 'pencil'], context.currentTime, distance, ms);
  }

  spray(): void {
    const context = this.#running();

    if (context && this.#noise && this.#master) spray(context, this.#noise, this.#master, context.currentTime);
  }

  // The context, when it runs and there's something to hear.
  #running(): AudioContext | null {
    return this.#level > 0 && this.#context?.state === 'running' ? this.#context : null;
  }

  readonly #unlock = (): void => {
    if (!this.#context) this.#start();

    if (this.#level > 0) void this.#context?.resume();
  };

  #start(): void {
    const context = new AudioContext();
    const master = context.createGain();
    const noise = makeNoise(context);

    master.gain.value = this.#level * this.#level;
    master.connect(context.destination);
    this.#context = context;
    this.#master = master;
    this.#noise = noise;
    this.#voices = { pencil: makeVoice(context, noise, master, scratchShapes.pencil), eraser: makeVoice(context, noise, master, scratchShapes.eraser) };
  }
}

import type { BoardSoundsService } from './types';

type LoopName = 'pencil' | 'eraser';

export type BoardSoundUrls = Record<LoopName | 'spray', string>;

interface LoopShape {
  // The loudest it gets, before the volume setting.
  peak: number;
  // Playback speed for a slow line and a fast one: a fast line sounds a touch higher.
  slowRate: number;
  fastRate: number;
}

interface Loop {
  gain: GainNode;
  source: AudioBufferSourceNode;
  shape: LoopShape;
}

// The tuning, all in one place. The recordings are already evened out (assets/sounds/credits.md).
export const loopShapes: Record<LoopName, LoopShape> = {
  pencil: { peak: 0.9, slowRate: 0.92, fastRate: 1.08 },
  eraser: { peak: 0.5, slowRate: 0.98, fastRate: 1.03 },
};

// Board units per millisecond that count as a fast line: the faster, the louder, up to the peak.
const fastSpeed = 1.2;
const quietest = 0.35;
// Time constants (s) for fading in when the line moves and out when it stops.
const fadeIn = 0.025;
const fadeOut = 0.06;
const sprayLevel = 0.6;

// A recording looping from a random point, silent until something is drawn.
export const startLoop = (context: BaseAudioContext, buffer: AudioBuffer, destination: AudioNode, shape: LoopShape): Loop => {
  const source = context.createBufferSource();
  const gain = context.createGain();

  source.buffer = buffer;
  source.loop = true;
  gain.gain.value = 0;
  source.connect(gain).connect(destination);
  source.start(0, Math.random() * buffer.duration);

  return { gain, source, shape };
};

// `distance` board units drawn over `ms`, from `at`: the loop fades in to a level (and speed) that
// follows how fast the line moves, then fades out unless more comes.
export const scratch = (loop: Loop, at: number, distance: number, ms: number): void => {
  const { gain, source, shape } = loop;
  const speed = Math.min(1, distance / Math.max(ms, 1) / fastSpeed);

  gain.gain.cancelScheduledValues(at);
  gain.gain.setValueAtTime(gain.gain.value, at);
  gain.gain.setTargetAtTime(shape.peak * (quietest + (1 - quietest) * speed), at, fadeIn);
  gain.gain.setTargetAtTime(0, at + Math.max(ms, 1) / 1000 + 0.05, fadeOut);
  source.playbackRate.setTargetAtTime(shape.slowRate + (shape.fastRate - shape.slowRate) * speed, at, 0.08);
};

// One spray, a little higher or lower each time so repeats don't sound copied.
export const spray = (context: BaseAudioContext, buffer: AudioBuffer, destination: AudioNode, at: number): void => {
  const source = context.createBufferSource();
  const gain = context.createGain();

  source.buffer = buffer;
  source.playbackRate.value = 0.94 + Math.random() * 0.12;
  gain.gain.value = sprayLevel;
  source.connect(gain).connect(destination);
  source.start(at);
};

// The drawer's pencil, eraser and fill as sound, from short CC0 recordings. Browsers allow audio
// only after a click or a key press on the page, so it starts (and loads them) on the first one.
export class BoardSounds implements BoardSoundsService {
  #context: AudioContext | null = null;
  #master: GainNode | null = null;
  #loops: Record<LoopName, Loop> | null = null;
  #spray: AudioBuffer | null = null;
  #level = 0;
  readonly #urls: BoardSoundUrls;

  constructor(target: Window, urls: BoardSoundUrls) {
    this.#urls = urls;
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

    if (context && this.#loops) scratch(this.#loops[eraser ? 'eraser' : 'pencil'], context.currentTime, distance, ms);
  }

  spray(): void {
    const context = this.#running();

    if (context && this.#spray && this.#master) spray(context, this.#spray, this.#master, context.currentTime);
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

    master.gain.value = this.#level * this.#level;
    master.connect(context.destination);
    this.#context = context;
    this.#master = master;
    // Without the recordings (offline, say) the board just stays quiet.
    void this.#load(context, master).catch(() => undefined);
  }

  async #load(context: AudioContext, master: GainNode): Promise<void> {
    const decode = async (url: string): Promise<AudioBuffer> => context.decodeAudioData(await (await fetch(url)).arrayBuffer());
    const [pencil, eraser, sprayBuffer] = await Promise.all([decode(this.#urls.pencil), decode(this.#urls.eraser), decode(this.#urls.spray)]);

    this.#loops = { pencil: startLoop(context, pencil, master, loopShapes.pencil), eraser: startLoop(context, eraser, master, loopShapes.eraser) };
    this.#spray = sprayBuffer;
  }
}

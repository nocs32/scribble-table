import { makeAutoObservable } from 'mobx';
import type { BoardSoundsService, PreferencesService } from '../services';
import type { Translate } from './locale';

export interface SoundDeps {
  t: Translate;
  sounds: BoardSoundsService;
  preferences: PreferencesService;
}

// on ⇄ muted, plus the volume (0–100). Both are saved in this browser.
export type SoundState = 'on' | 'muted';

const defaultVolume = 60;

// A short pencil line, so you hear the volume you just picked.
const sampleDistance = 140;
const sampleMs = 240;

export class SoundStore {
  state: SoundState = 'on';
  volume = defaultVolume;
  readonly #deps: SoundDeps;

  constructor(deps: SoundDeps) {
    const saved = deps.preferences.loadSound();

    this.#deps = deps;
    this.state = saved?.muted ? 'muted' : 'on';
    this.volume = saved?.volume ?? defaultVolume;
    makeAutoObservable(this, {}, { autoBind: true });
    this.#apply();
  }

  get isOn(): boolean {
    return this.state === 'on';
  }

  get buttonLabel(): string {
    return this.#deps.t(this.isOn ? 'sound.buttonOn' : 'sound.buttonOff');
  }

  get volumeText(): string {
    return this.#deps.t('sound.percent', { value: this.volume });
  }

  setOn(on: boolean): void {
    this.state = on ? 'on' : 'muted';
    this.#save();
  }

  // While the slider moves; `commitVolume` when it's let go.
  previewVolume(values: number[]): void {
    this.volume = values[0] ?? this.volume;
    this.#apply();
  }

  commitVolume(): void {
    this.#save();
  }

  #save(): void {
    this.#deps.preferences.saveSound({ volume: this.volume, muted: !this.isOn });
    this.#apply();

    if (this.isOn) this.#deps.sounds.scratch(false, sampleDistance, sampleMs);
  }

  #apply(): void {
    this.#deps.sounds.setLevel(this.isOn ? this.volume / 100 : 0);
  }
}

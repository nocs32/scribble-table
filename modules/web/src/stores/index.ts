import { createServices } from '../services';
import type { Services } from '../services/types';
import { LocaleStore } from './locale';
import { RoomStore } from './room';
import { SoundStore } from './sound';

export class RootStore {
  readonly locale: LocaleStore;
  readonly room: RoomStore;
  readonly sound: SoundStore;

  constructor(services: Services) {
    this.locale = new LocaleStore(services);
    this.room = new RoomStore(services, this.locale);
    this.sound = new SoundStore({ t: this.locale.t, sounds: services.sounds, preferences: services.preferences });
  }
}

export const createRootStore = (): RootStore => new RootStore(createServices());

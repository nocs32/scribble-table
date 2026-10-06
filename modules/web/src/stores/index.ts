import { createServices } from '../services';
import type { Services } from '../services/types';
import { LocaleStore } from './locale';
import { RoomStore } from './room';

export class RootStore {
  readonly locale: LocaleStore;
  readonly room: RoomStore;

  constructor(services: Services) {
    this.locale = new LocaleStore(services);
    this.room = new RoomStore(services, this.locale);
  }
}

export const createRootStore = (): RootStore => new RootStore(createServices());

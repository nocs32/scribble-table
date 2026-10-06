import { createServices } from '../services';
import type { Services } from '../services/types';
import { LocaleStore } from './locale';
import { ServerStatusStore } from './server-status';

export class RootStore {
  readonly locale: LocaleStore;
  readonly server: ServerStatusStore;

  constructor(services: Services) {
    this.locale = new LocaleStore(services);
    this.server = new ServerStatusStore({ healthApi: services.healthApi, t: this.locale.t });
  }
}

export const createRootStore = (): RootStore => new RootStore(createServices());

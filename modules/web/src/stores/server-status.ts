import { makeAutoObservable } from 'mobx';
import type { TranslationKey } from '../i18n';
import type { HealthApiService } from '../services';
import type { Translate } from './locale';

export type ServerStatus = 'checking' | 'online' | 'offline';

export interface ServerStatusDeps {
  healthApi: HealthApiService;
  t: Translate;
}

const labelKeys: Record<ServerStatus, TranslationKey> = {
  checking: 'server.checking',
  online: 'server.online',
  offline: 'server.offline',
};

// Whether core-api answers: checking → online | offline. Shown on the home page until tables exist.
export class ServerStatusStore {
  state: ServerStatus = 'checking';
  readonly #deps: ServerStatusDeps;

  constructor(deps: ServerStatusDeps) {
    this.#deps = deps;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get label(): string {
    return this.#deps.t(labelKeys[this.state]);
  }

  check(): void {
    this.state = 'checking';
    void this.#deps.healthApi.isUp().then(this.receive);
  }

  receive(isUp: boolean): void {
    this.state = isUp ? 'online' : 'offline';
  }
}

import type { TableErrorCode, TableErrorEvent, TableSnapshot } from '@scribble-table/protocol';
import { makeAutoObservable, observableRef } from 'mobx';
import type { AddressService, PreferencesService, TableClientService, TableConnectionState, TableLink, TableLinkListeners, TableOpenFailure, TableOpenResult } from '../../services';
import type { Translate } from '../locale';

// idle → opening → live ⇄ reconnecting. Opening can end in a failure instead; a seat that's lost
// for good while live goes back to opening (a fresh join to the same table).
export type RoomConnectionState = 'idle' | 'opening' | 'live' | 'reconnecting' | TableOpenFailure;

// What the table sends that the room's parts take care of.
export type RoomConnectionReceivers = Omit<TableLinkListeners, 'connection' | 'closed'>;

export interface RoomConnectionDeps {
  tableClient: TableClientService;
  address: AddressService;
  preferences: PreferencesService;
  t: Translate;
  receivers: RoomConnectionReceivers;
}

const failures: readonly RoomConnectionState[] = ['gone', 'full', 'outdated', 'unreachable'];

// The link to the table: joining it, staying connected, and what to show when there's no table.
export class RoomConnectionStore {
  state: RoomConnectionState = 'idle';
  // The table's id, once known: from the address, or from the server for a new table.
  roomId: string | null = null;
  link: TableLink | null = null;
  // Intents the table refused this session (rate limits, moves that crossed a turn's end).
  refusals: TableErrorCode[] = [];
  readonly #deps: RoomConnectionDeps;

  constructor(deps: RoomConnectionDeps) {
    this.#deps = deps;
    makeAutoObservable(this, { link: observableRef }, { autoBind: true });
  }

  // The table is on screen (also while reconnecting, with a notice).
  get isOpen(): boolean {
    return this.state === 'live' || this.state === 'reconnecting';
  }

  get isReconnecting(): boolean {
    return this.state === 'reconnecting';
  }

  get isBusy(): boolean {
    return this.state === 'idle' || this.state === 'opening';
  }

  get meId(): string {
    return this.link?.meId ?? '';
  }

  get title(): string {
    const { t } = this.#deps;

    if (this.isBusy) return this.roomId === null ? t('status.creating') : t('status.joining');

    return this.isOpen ? t('status.reconnecting') : t(`status.${this.state as TableOpenFailure}Title`);
  }

  get text(): string {
    return failures.includes(this.state) ? this.#deps.t(`status.${this.state as TableOpenFailure}Text`) : '';
  }

  // The one thing to do about a failure: start over, reload, or try again.
  get actionLabel(): string {
    const { t } = this.#deps;

    if (this.state === 'outdated') return t('status.reload');

    return this.state === 'unreachable' ? t('status.retry') : t('status.startNew');
  }

  open(): void {
    if (this.state !== 'idle') return;

    this.roomId = this.#deps.address.roomId();
    this.#enter();
  }

  settle(result: TableOpenResult): void {
    if (this.state !== 'opening') return;

    if (!result.ok) {
      this.state = result.failure;

      return;
    }

    this.link = result.link;
    this.roomId = result.link.roomId;
    this.#deps.address.showRoom(result.link.roomId);
  }

  // The first snapshot puts the table on screen.
  receiveSnapshot(snapshot: TableSnapshot): void {
    this.#deps.receivers.snapshot(snapshot);

    if (this.state === 'opening' && this.link) this.state = 'live';
  }

  changeConnection(state: TableConnectionState): void {
    if (this.isOpen) this.state = state;
  }

  // The seat is gone (the table closed, or reconnecting took too long): sit down again if the
  // table still exists. Otherwise opening fails with 'gone'.
  close(): void {
    if (!this.isOpen) return;

    this.link = null;
    this.#enter();
  }

  refuse(event: TableErrorEvent): void {
    this.refusals = [...this.refusals, event.code].slice(-20);
    this.#deps.receivers.refused(event);
  }

  act(): void {
    if (this.state === 'outdated') this.#deps.address.reload();
    else if (this.state === 'unreachable') this.#enter();
    else if (failures.includes(this.state)) this.#deps.address.startNew();
  }

  #enter(): void {
    const { tableClient, preferences, receivers } = this.#deps;
    const listeners: TableLinkListeners = { ...receivers, snapshot: this.receiveSnapshot, connection: this.changeConnection, closed: this.close, refused: this.refuse };

    this.state = 'opening';
    void tableClient.open(this.roomId, preferences.loadName(), listeners).then(this.settle);
  }
}

import type { TableClientService, TableLink } from '../types';
import { DemoReferee } from './referee';
import { cleanPersonName } from '@scribble-table/protocol';
import { freeColor } from './rules';
import type { DemoDeps, DemoMember } from './types';

const roomIdAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz';

// What core-api will hand out: 12 characters of [0-9a-z].
const newRoomId = (random: () => number): string =>
  Array.from({ length: 12 }, () => roomIdAlphabet[Math.floor(random() * roomIdAlphabet.length)]).join('');

const defaultName = 'Curious Fox';

// The table without a server: a referee in the browser and a few sample players, for building
// and reviewing the UI. Every table is new, and a reload starts over.
export const createDemoTable = (deps: DemoDeps): TableClientService => ({
  open: (roomId, name, listeners) => {
    const meId = deps.createId();
    const referee = new DemoReferee(deps, listeners, meId);

    const link: TableLink = {
      roomId: roomId ?? newRoomId(deps.random),
      meId,
      demo: {
        skip: () => referee.skip(),
        drawNext: () => referee.drawNext(),
        addPlayer: () => referee.addBot(),
        removePlayer: () => referee.removeBot(),
      },
      send: (type, message) => referee.handle(meId, type, message),
      close: () => referee.dispose(),
    };

    // After `open` resolves, so the store already knows who it is.
    deps.schedule(() => {
      const me: DemoMember = { id: meId, name: cleanPersonName(name ?? '') || defaultName, color: freeColor([]), score: 0, connected: true, isBot: false, language: 'en' };

      referee.join(me);
      [0, 1].forEach(() => referee.addBot());
    }, 0);

    deps.schedule(() => referee.addBot(), 4000);

    return Promise.resolve({ ok: true, link });
  },
});

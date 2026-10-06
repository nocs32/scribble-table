import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageReactionsPicker } from './picker';
import { RoomStageReactionsQuick } from './quick';
import { RoomStageReactionsDivider, RoomStageReactionsRoot } from './styled-components';

// Huddle-style reactions under the board, for everyone but the drawer: a click sends one,
// press and hold streams them.
export const RoomStageReactions = observer(function RoomStageReactions(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <RoomStageReactionsRoot role="toolbar" aria-label={locale.t('reactions.label')}>
      {room.reactions.quickButtons.map((button) => (
        <RoomStageReactionsQuick key={button.emoji} button={button} />
      ))}
      <RoomStageReactionsDivider />
      <RoomStageReactionsPicker />
    </RoomStageReactionsRoot>
  );
});

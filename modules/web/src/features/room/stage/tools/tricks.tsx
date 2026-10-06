import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageToolsGroup, RoomStageToolsTrick, RoomStageToolsTricksLabel } from './styled-components';

// A saboteur's tricks: one a turn, on everyone still guessing or on the drawer.
export const RoomStageToolsTricks = observer(function RoomStageToolsTricks(): ReactElement {
  const { locale, room } = useRootStore();
  const { sabotage } = room;

  return (
    <RoomStageToolsGroup role="group" aria-label={locale.t('trick.label')}>
      <RoomStageToolsTricksLabel>{locale.t('trick.label')}</RoomStageToolsTricksLabel>
      {sabotage.trickButtons.map((button) => (
        <RoomStageToolsTrick
          key={button.kind}
          type="button"
          disabled={button.isDisabled}
          aria-label={button.label}
          title={button.label}
          onClick={() => sabotage.playTrick(button.kind)}
        >
          {button.emoji}
        </RoomStageToolsTrick>
      ))}
    </RoomStageToolsGroup>
  );
});

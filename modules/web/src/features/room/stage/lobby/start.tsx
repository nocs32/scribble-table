import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { LinkIcon, PlayIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import { Button } from '../../../../ui';
import { RoomStageLobbyStartButtons, RoomStageLobbyStartHint, RoomStageLobbyStartRoot } from './styled-components';

// Who's here, the invite link, and Start (anyone may press it once two people are in).
export const RoomStageLobbyStart = observer(function RoomStageLobbyStart(): ReactElement {
  const { locale, room } = useRootStore();
  const { game, share } = room;

  return (
    <RoomStageLobbyStartRoot>
      <RoomStageLobbyStartHint>{game.startHint}</RoomStageLobbyStartHint>
      <RoomStageLobbyStartButtons>
        <Button tone="secondary" type="button" onClick={share.copy}>
          <LinkIcon />
          {share.inviteLabel}
        </Button>
        <Button tone="primary" type="button" disabled={!game.canStart} onClick={game.start}>
          <PlayIcon />
          {locale.t('lobby.start')}
        </Button>
      </RoomStageLobbyStartButtons>
    </RoomStageLobbyStartRoot>
  );
});

import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { UsersIcon } from '../../assets';
import { useRootStore } from '../../stores/use-root-store';
import { RoomPlayersItem } from './players-item';
import { RoomPlayersHeader, RoomPlayersList, RoomPlayersRoot } from './styled-components';

// Everyone at the table, best score first. On a phone it's a strip under the board.
export const RoomPlayers = observer(function RoomPlayers(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <RoomPlayersRoot aria-label={locale.t('players.label')}>
      <RoomPlayersHeader>
        <UsersIcon />
        {locale.t('players.label')}
      </RoomPlayersHeader>
      <RoomPlayersList>
        {room.presence.standings.map((player) => (
          <RoomPlayersItem key={player.id} player={player} />
        ))}
      </RoomPlayersList>
    </RoomPlayersRoot>
  );
});

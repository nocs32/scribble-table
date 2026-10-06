import type { ReactElement } from 'react';
import { CheckIcon, FlagIcon, PencilIcon } from '../../assets';
import type { PlayerView } from '../../stores/room/presence';
import { Avatar } from '../../ui';
import {
  RoomPlayersItemGain,
  RoomPlayersItemName,
  RoomPlayersItemNote,
  RoomPlayersItemPlace,
  RoomPlayersItemRoot,
  RoomPlayersItemScore,
  RoomPlayersItemStatus,
  RoomPlayersItemText,
} from './styled-components';

interface RoomPlayersItemProps {
  player: PlayerView;
}

export function RoomPlayersItem({ player }: RoomPlayersItemProps): ReactElement {
  return (
    <RoomPlayersItemRoot me={player.isMe} turn={player.turnStatus}>
      <RoomPlayersItemPlace>{player.placeLabel}</RoomPlayersItemPlace>
      <Avatar initial={player.initial} color={player.color} size="md" presence={player.status} />
      <RoomPlayersItemText>
        <RoomPlayersItemName>{player.name}</RoomPlayersItemName>
        {player.note && <RoomPlayersItemNote>{player.note}</RoomPlayersItemNote>}
      </RoomPlayersItemText>
      {player.statusLabel && (
        <RoomPlayersItemStatus role="img" aria-label={player.statusLabel} title={player.statusLabel} turn={player.turnStatus}>
          {player.turnStatus === 'drawing' && <PencilIcon />}
          {player.turnStatus === 'guessed' && <CheckIcon />}
          {player.turnStatus === 'gaveUp' && <FlagIcon />}
        </RoomPlayersItemStatus>
      )}
      <RoomPlayersItemScore title={player.scoreTitle}>
        {player.score}
        {player.gainLabel && <RoomPlayersItemGain>{player.gainLabel}</RoomPlayersItemGain>}
      </RoomPlayersItemScore>
    </RoomPlayersItemRoot>
  );
}

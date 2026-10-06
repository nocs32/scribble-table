import type { ReactElement } from 'react';
import type { Flight } from '../../../stores/room/reactions';
import { RoomStageFlightsName, RoomStageFlightsRise, RoomStageFlightsSway } from './styled-components';

interface RoomStageFlightsItemProps {
  flight: Flight;
  onLand: (id: string) => void;
}

export function RoomStageFlightsItem({ flight, onLand }: RoomStageFlightsItemProps): ReactElement {
  return (
    <RoomStageFlightsRise lane={flight.lane} onAnimationEnd={() => onLand(flight.id)}>
      <RoomStageFlightsSway sway={flight.sway}>
        {flight.emoji}
        {flight.sender && <RoomStageFlightsName>{flight.sender}</RoomStageFlightsName>}
      </RoomStageFlightsSway>
    </RoomStageFlightsRise>
  );
}

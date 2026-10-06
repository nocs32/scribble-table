import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomStageFlightsItem } from './flights-item';
import { RoomStageFlightsRoot } from './styled-components';

// Huddle-style reactions rising from the reaction bar on everyone's screen.
export const RoomStageFlights = observer(function RoomStageFlights(): ReactElement {
  const { reactions } = useRootStore().room;

  return (
    <RoomStageFlightsRoot aria-hidden>
      {reactions.flights.map((flight) => (
        <RoomStageFlightsItem key={flight.id} flight={flight} onLand={reactions.land} />
      ))}
    </RoomStageFlightsRoot>
  );
});

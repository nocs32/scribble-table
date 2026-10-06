import { SegmentGroup } from '@ark-ui/react/segment-group';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageLobbyField, RoomStageLobbyLabel, RoomStageLobbySegmentIndicator, RoomStageLobbySegmentItem, RoomStageLobbySegmentRoot } from './styled-components';

// How many words the drawer picks from: 1 to 5.
export const RoomStageLobbyChoices = observer(function RoomStageLobbyChoices(): ReactElement {
  const { locale, room } = useRootStore();
  const { settings } = room.game;

  return (
    <RoomStageLobbyField>
      <RoomStageLobbySegmentRoot
        value={settings.wordChoicesValue}
        disabled={!settings.isEditable}
        onValueChange={(details) => settings.chooseWordChoices(details.value)}
      >
        <SegmentGroup.Label asChild>
          <RoomStageLobbyLabel>{locale.t('lobby.wordChoices')}</RoomStageLobbyLabel>
        </SegmentGroup.Label>
        <RoomStageLobbySegmentIndicator />
        {settings.wordChoiceOptions.map((option) => (
          <RoomStageLobbySegmentItem key={option.value} value={option.value}>
            <SegmentGroup.ItemText>{option.label}</SegmentGroup.ItemText>
            <SegmentGroup.ItemControl />
            <SegmentGroup.ItemHiddenInput />
          </RoomStageLobbySegmentItem>
        ))}
      </RoomStageLobbySegmentRoot>
    </RoomStageLobbyField>
  );
});

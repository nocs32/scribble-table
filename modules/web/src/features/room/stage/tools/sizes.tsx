import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageToolsButton, RoomStageToolsDot, RoomStageToolsGroup } from './styled-components';

// Four brush sizes, shown as dots (keys 1–4).
export const RoomStageToolsSizes = observer(function RoomStageToolsSizes(): ReactElement {
  const { locale, room } = useRootStore();
  const { board } = room;

  return (
    <RoomStageToolsGroup role="group" aria-label={locale.t('board.sizes')}>
      {board.sizeViews.map((view) => (
        <RoomStageToolsButton
          key={view.index}
          type="button"
          aria-pressed={view.isSelected}
          aria-label={view.label}
          title={view.label}
          onClick={() => board.selectSize(view.index)}
        >
          <RoomStageToolsDot dot={view.dot} />
        </RoomStageToolsButton>
      ))}
    </RoomStageToolsGroup>
  );
});

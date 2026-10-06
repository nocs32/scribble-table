import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomStageToolsSwatch, RoomStageToolsSwatches } from './styled-components';

// The 16 inks, in two rows.
export const RoomStageToolsColors = observer(function RoomStageToolsColors(): ReactElement {
  const { locale, room } = useRootStore();
  const { board } = room;

  return (
    <RoomStageToolsSwatches role="group" aria-label={locale.t('board.colors')}>
      {board.colorViews.map((view) => (
        <RoomStageToolsSwatch
          key={view.name}
          type="button"
          ink={view.name}
          selected={view.isSelected}
          aria-pressed={view.isSelected}
          aria-label={view.label}
          title={view.label}
          onClick={() => board.selectColor(view.index)}
        />
      ))}
    </RoomStageToolsSwatches>
  );
});

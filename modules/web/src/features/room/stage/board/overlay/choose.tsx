import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../../stores/use-root-store';
import {
  RoomStageBoardOverlayCard,
  RoomStageBoardOverlayChoice,
  RoomStageBoardOverlayChoiceLevel,
  RoomStageBoardOverlayChoices,
  RoomStageBoardOverlayChoiceWord,
  RoomStageBoardOverlayHint,
  RoomStageBoardOverlayRoot,
  RoomStageBoardOverlayTitle,
} from './styled-components';

// Only the drawer sees this: the words to pick from, with how hard each one is.
export const RoomStageBoardOverlayChoose = observer(function RoomStageBoardOverlayChoose(): ReactElement {
  const { locale, room } = useRootStore();
  const { game } = room;

  return (
    <RoomStageBoardOverlayRoot>
      <RoomStageBoardOverlayCard role="dialog" aria-label={locale.t('choose.title')}>
        <RoomStageBoardOverlayTitle>{locale.t('choose.title')}</RoomStageBoardOverlayTitle>
        <RoomStageBoardOverlayHint>{locale.t('choose.hint')}</RoomStageBoardOverlayHint>
        <RoomStageBoardOverlayChoices>
          {game.choiceViews.map((choice) => (
            <RoomStageBoardOverlayChoice key={choice.index} type="button" difficulty={choice.difficulty} onClick={() => game.chooseWord(choice.index)}>
              <RoomStageBoardOverlayChoiceWord>{choice.word}</RoomStageBoardOverlayChoiceWord>
              <RoomStageBoardOverlayChoiceLevel>{choice.difficultyLabel}</RoomStageBoardOverlayChoiceLevel>
            </RoomStageBoardOverlayChoice>
          ))}
        </RoomStageBoardOverlayChoices>
      </RoomStageBoardOverlayCard>
    </RoomStageBoardOverlayRoot>
  );
});

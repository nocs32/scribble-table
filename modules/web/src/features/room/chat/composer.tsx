import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { SendIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { withoutDefault } from '../../../utils';
import { RoomChatComposerInput, RoomChatComposerNote, RoomChatComposerRoot, RoomChatComposerSend } from './styled-components';

// While you can guess, the composer is outlined in the accent colour. Typing faster than the
// table takes lines keeps yours in the box, with a note above it.
export const RoomChatComposer = observer(function RoomChatComposer(): ReactElement {
  const { locale, room } = useRootStore();
  const { feed, game, chatPace } = room;

  return (
    <>
      <RoomChatComposerNote role="status">{chatPace.note}</RoomChatComposerNote>
      <RoomChatComposerRoot onSubmit={withoutDefault(feed.send)} guessing={game.canGuess}>
        <RoomChatComposerInput
          value={feed.draft}
          placeholder={room.composerPlaceholder}
          aria-label={locale.t('chat.message')}
          maxLength={feed.maxLength}
          autoComplete="off"
          onChange={(event) => feed.setDraft(event.target.value)}
        />
        <RoomChatComposerSend type="submit" disabled={feed.isDraftEmpty} ready={feed.canSend} aria-label={locale.t('chat.send')}>
          <SendIcon />
        </RoomChatComposerSend>
      </RoomChatComposerRoot>
    </>
  );
});

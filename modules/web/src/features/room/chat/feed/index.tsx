import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../../stores/use-root-store';
import { RoomChatFeedMessage } from './message';
import { RoomChatFeedRoot } from './styled-components';
import { RoomChatFeedSystem } from './system';
import { useRoomChatFeedScroll } from './use-scroll';

// Chat messages and activity lines, Slack-style, newest at the bottom.
export const RoomChatFeed = observer(function RoomChatFeed(): ReactElement {
  const { locale, room } = useRootStore();
  const { feed } = room;
  const listRef = useRoomChatFeedScroll(feed.items.length);

  return (
    <RoomChatFeedRoot ref={listRef} role="log" aria-live="polite" aria-label={locale.t('chat.log')}>
      {feed.entries.map((entry) =>
        entry.kind === 'system' ? (
          <RoomChatFeedSystem key={entry.id} entry={entry} />
        ) : (
          <RoomChatFeedMessage key={entry.id} entry={entry} />
        ),
      )}
    </RoomChatFeedRoot>
  );
});

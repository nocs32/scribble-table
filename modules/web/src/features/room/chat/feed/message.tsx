import type { ReactElement } from 'react';
import type { FeedEntry } from '../../../../stores/room/feed';
import { Avatar } from '../../../../ui';
import {
  RoomChatFeedAuthor,
  RoomChatFeedGutter,
  RoomChatFeedMessageRoot,
  RoomChatFeedMeta,
  RoomChatFeedTag,
  RoomChatFeedText,
  RoomChatFeedTime,
} from './styled-components';

interface RoomChatFeedMessageProps {
  entry: FeedEntry;
}

// A chat message. Guessed chat is tinted and tagged: only the drawer and those who got it see it.
export function RoomChatFeedMessage({ entry }: RoomChatFeedMessageProps): ReactElement {
  return (
    <RoomChatFeedMessageRoot startsGroup={entry.startsGroup} guessed={entry.tone === 'guessed'}>
      <RoomChatFeedGutter>{entry.startsGroup && <Avatar initial={entry.authorInitial} color={entry.authorColor} size="lg" />}</RoomChatFeedGutter>
      <div>
        {entry.startsGroup && (
          <RoomChatFeedMeta>
            <RoomChatFeedAuthor>{entry.authorName}</RoomChatFeedAuthor>
            <RoomChatFeedTime>{entry.timeLabel}</RoomChatFeedTime>
            {entry.tag && <RoomChatFeedTag>{entry.tag}</RoomChatFeedTag>}
          </RoomChatFeedMeta>
        )}
        <RoomChatFeedText>{entry.text}</RoomChatFeedText>
      </div>
    </RoomChatFeedMessageRoot>
  );
}

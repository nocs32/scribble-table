import type { ReactElement } from 'react';
import type { FeedEntry } from '../../../../stores/room/feed';
import { Avatar } from '../../../../ui';
import { RoomChatFeedGutter, RoomChatFeedSystemName, RoomChatFeedSystemRoot, RoomChatFeedTime } from './styled-components';

interface RoomChatFeedSystemProps {
  entry: FeedEntry;
}

// Activity lines like Slack's "joined #channel": small, with the person's avatar. A right guess
// shows in green; a line only you see ("close!") in the accent colour.
export function RoomChatFeedSystem({ entry }: RoomChatFeedSystemProps): ReactElement {
  return (
    <RoomChatFeedSystemRoot tone={entry.tone}>
      <RoomChatFeedGutter>
        <Avatar initial={entry.authorInitial} color={entry.authorColor} size="sm" />
      </RoomChatFeedGutter>
      <span>
        {entry.showsAuthor && <RoomChatFeedSystemName>{entry.authorName} </RoomChatFeedSystemName>}
        {entry.text}
      </span>
      <RoomChatFeedTime>{entry.timeLabel}</RoomChatFeedTime>
    </RoomChatFeedSystemRoot>
  );
}

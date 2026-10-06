import type { ReactElement } from 'react';
import { EyeIcon } from '../../../../assets';
import type { FeedEntry } from '../../../../stores/room/feed';
import { Avatar } from '../../../../ui';
import {
  RoomChatFeedAuthor,
  RoomChatFeedBody,
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

// A chat message. Guessed chat is tinted, and its first line says who can see it, the way Slack
// marks "Only visible to you".
export function RoomChatFeedMessage({ entry }: RoomChatFeedMessageProps): ReactElement {
  return (
    <RoomChatFeedMessageRoot startsGroup={entry.startsGroup} guessed={entry.tone === 'guessed'}>
      {entry.startsGroup && entry.tag && (
        <RoomChatFeedTag>
          <EyeIcon />
          {entry.tag}
        </RoomChatFeedTag>
      )}
      <RoomChatFeedGutter>{entry.startsGroup && <Avatar initial={entry.authorInitial} color={entry.authorColor} size="lg" />}</RoomChatFeedGutter>
      <RoomChatFeedBody>
        {entry.startsGroup && (
          <RoomChatFeedMeta>
            <RoomChatFeedAuthor>{entry.authorName}</RoomChatFeedAuthor>
            <RoomChatFeedTime>{entry.timeLabel}</RoomChatFeedTime>
          </RoomChatFeedMeta>
        )}
        <RoomChatFeedText>{entry.text}</RoomChatFeedText>
      </RoomChatFeedBody>
    </RoomChatFeedMessageRoot>
  );
}

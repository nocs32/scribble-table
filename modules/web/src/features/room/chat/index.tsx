import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { ChatIcon } from '../../../assets';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomChatComposer } from './composer';
import { RoomChatFeed } from './feed';
import { RoomChatHeader, RoomChatRoot, RoomChatTitle } from './styled-components';

// The chat beside the board. Guesses are typed here too: the table checks each message.
export const RoomChat = observer(function RoomChat(): ReactElement {
  const { locale } = useRootStore();

  return (
    <RoomChatRoot aria-label={locale.t('chat.label')}>
      <RoomChatHeader>
        <RoomChatTitle>
          <ChatIcon />
          {locale.t('chat.label')}
        </RoomChatTitle>
      </RoomChatHeader>
      <RoomChatFeed />
      <RoomChatComposer />
    </RoomChatRoot>
  );
});

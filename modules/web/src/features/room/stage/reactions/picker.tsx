import { Popover } from '@ark-ui/react/popover';
import { Portal } from '@ark-ui/react/portal';
import { EmojiPicker } from 'frimousse';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { AddReactionIcon } from '../../../../assets';
import { useRootStore } from '../../../../stores/use-root-store';
import {
  RoomStageReactionsButton,
  RoomStageReactionsPickerActive,
  RoomStageReactionsPickerEmpty,
  RoomStageReactionsPickerFooter,
  RoomStageReactionsPickerLoading,
  RoomStageReactionsPickerRoot,
  RoomStageReactionsPickerSearch,
  RoomStageReactionsPickerViewport,
  RoomStageReactionsPopover,
} from './styled-components';

// Slack's emoji picker: search on top, every emoji below. Picks fly up and join the quick bar;
// the picker stays open so you can keep sending.
export const RoomStageReactionsPicker = observer(function RoomStageReactionsPicker(): ReactElement {
  const { locale, room } = useRootStore();

  return (
    <Popover.Root positioning={{ placement: 'top', gutter: 12 }} lazyMount>
      <Popover.Trigger asChild>
        <RoomStageReactionsButton type="button" aria-label={locale.t('reactions.more')} title={locale.t('reactions.more')}>
          <AddReactionIcon />
        </RoomStageReactionsButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <RoomStageReactionsPopover>
            <RoomStageReactionsPickerRoot locale={locale.language} columns={9} onEmojiSelect={({ emoji }) => room.reactions.pick(emoji)}>
              <RoomStageReactionsPickerSearch placeholder={locale.t('picker.search')} aria-label={locale.t('picker.search')} />
              <RoomStageReactionsPickerViewport>
                <RoomStageReactionsPickerLoading>{locale.t('picker.loading')}</RoomStageReactionsPickerLoading>
                <RoomStageReactionsPickerEmpty>{locale.t('picker.empty')}</RoomStageReactionsPickerEmpty>
                <EmojiPicker.List />
              </RoomStageReactionsPickerViewport>
              <RoomStageReactionsPickerFooter>
                <EmojiPicker.ActiveEmoji>
                  {({ emoji }) => (
                    <>
                      <RoomStageReactionsPickerActive>{emoji?.emoji ?? '🎨'}</RoomStageReactionsPickerActive>
                      {emoji?.label ?? locale.t('picker.hint')}
                    </>
                  )}
                </EmojiPicker.ActiveEmoji>
              </RoomStageReactionsPickerFooter>
            </RoomStageReactionsPickerRoot>
          </RoomStageReactionsPopover>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
});

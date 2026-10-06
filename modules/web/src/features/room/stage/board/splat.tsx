import type { ReactElement } from 'react';
import { SplatShape } from '../../../../assets';
import type { SplatView } from '../../../../stores/room/sabotage';
import { RoomStageBoardSplatRoot } from './styled-components';

interface RoomStageBoardSplatProps {
  splat: SplatView;
}

// Paint over part of the board, from the splat trick.
export function RoomStageBoardSplat({ splat }: RoomStageBoardSplatProps): ReactElement {
  return (
    <RoomStageBoardSplatRoot spot={splat.spot} ink={splat.ink}>
      <SplatShape />
    </RoomStageBoardSplatRoot>
  );
}

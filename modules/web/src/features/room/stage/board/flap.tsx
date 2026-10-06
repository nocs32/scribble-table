import type { ReactElement } from 'react';
import type { FoldCorner } from '../../../../stores/room/sabotage';
import { RoomStageBoardFlapFace, RoomStageBoardFlapRoot } from './styled-components';

interface RoomStageBoardFlapProps {
  corner: FoldCorner;
}

// The corner folded over by the fold trick. The shadow sits on the outer layer, so it follows the
// flap's clipped shape.
export function RoomStageBoardFlap({ corner }: RoomStageBoardFlapProps): ReactElement {
  return (
    <RoomStageBoardFlapRoot>
      <RoomStageBoardFlapFace corner={corner} />
    </RoomStageBoardFlapRoot>
  );
}

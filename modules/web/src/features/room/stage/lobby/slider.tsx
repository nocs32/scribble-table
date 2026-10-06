import { Slider } from '@ark-ui/react/slider';
import type { ReactElement } from 'react';
import {
  RoomStageLobbyField,
  RoomStageLobbyFieldHead,
  RoomStageLobbyLabel,
  RoomStageLobbySliderControl,
  RoomStageLobbySliderRange,
  RoomStageLobbySliderRoot,
  RoomStageLobbySliderThumb,
  RoomStageLobbySliderTrack,
  RoomStageLobbyValue,
} from './styled-components';

interface RoomStageLobbySliderProps {
  label: string;
  valueText: string;
  value: number;
  range: { min: number; max: number };
  step: number;
  disabled: boolean;
  // While dragging; `onCommit` when you let go.
  onPreview: (values: number[]) => void;
  onCommit: () => void;
}

export function RoomStageLobbySlider({ label, valueText, value, range, step, disabled, onPreview, onCommit }: RoomStageLobbySliderProps): ReactElement {
  return (
    <RoomStageLobbyField>
      <RoomStageLobbySliderRoot
        value={[value]}
        min={range.min}
        max={range.max}
        step={step}
        disabled={disabled}
        onValueChange={(details) => onPreview(details.value)}
        onValueChangeEnd={onCommit}
      >
        <RoomStageLobbyFieldHead>
          <Slider.Label asChild>
            <RoomStageLobbyLabel>{label}</RoomStageLobbyLabel>
          </Slider.Label>
          <RoomStageLobbyValue>{valueText}</RoomStageLobbyValue>
        </RoomStageLobbyFieldHead>
        <RoomStageLobbySliderControl>
          <RoomStageLobbySliderTrack>
            <RoomStageLobbySliderRange />
          </RoomStageLobbySliderTrack>
          <RoomStageLobbySliderThumb index={0}>
            <Slider.HiddenInput />
          </RoomStageLobbySliderThumb>
        </RoomStageLobbySliderControl>
      </RoomStageLobbySliderRoot>
    </RoomStageLobbyField>
  );
}

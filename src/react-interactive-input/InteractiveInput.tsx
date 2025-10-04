import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

import MaskedInput from './MaskedInput';
import { getDecimalPlaces } from './utils';

type InputModifier = 'shiftKey' | 'altKey' | 'ctrlKey' | 'metaKey';

export type Modifiers = {
  [key in InputModifier]?: number;
};

interface InteractiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Modifiers to apply to the input value. Defaults to `{ shiftKey: 0.1 }`.
   */
  modifiers?: Modifiers;
  value?: number;
}

/**
 * Main component for the InteractiveInput
 */
export default function InteractiveInput({
  value,
  modifiers = {
    altKey: 1,
    ctrlKey: 1,
    metaKey: 1,
    shiftKey: 0.1,
  },
  style: _style = {},
  ...props
}: InteractiveInputProps) {
  const [inputValue, setInputValue] = useState<string>(String(value || 0));
  const [modifier, setModifier] = useState<InputModifier | ''>('');
  const [, setStartPos] = useState<[number, number]>([0, 0]);
  const startValue = useRef(0);

  const step = props.step ? +props.step : 1;

  const style: CSSProperties = { cursor: 'ew-resize', ..._style };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (e.target.value === '-') {
      return;
    }

    props.onChange?.(e);
  };

  const handleMove = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLInputElement;
      setStartPos((pos) => {
        const { clientX: x2, clientY: y2 } = e;
        const [x1, y1] = pos;
        const a = x1 - x2;
        const b = y1 - y2;
        let mod = 1;
        if (modifier) {
          mod = modifiers[modifier] || 1;
        }
        const stepModifer = step * mod;
        const decimals = getDecimalPlaces(stepModifer);
        let delta = Math.sqrt(a * a + b * b) * stepModifer;
        if (x2 < x1) delta = -delta;

        let newValue: number = startValue.current + delta;

        if (props.min !== undefined) newValue = Math.max(newValue, +props.min);
        if (props.max !== undefined) newValue = Math.min(newValue, +props.max);
        newValue = +newValue.toFixed(decimals);

        if (newValue !== undefined && !isNaN(newValue)) {
          setInputValue(String(newValue));
        }
        if (newValue !== undefined && !isNaN(newValue) && props.onChange) {
          const event = new Event('change', { bubbles: true });
          const newEvent = {
            ...event,
            target: {
              ...target,
              value: newValue,
              name: target.name,
            },
          };
          props.onChange(newEvent as unknown as React.ChangeEvent<HTMLInputElement>);
        }

        return pos;
      });
    },
    [modifier, props.max, props.min, step, modifiers],
  );

  const handleMoveEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleMoveEnd);
  }, [handleMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      let _startValue = +inputValue;

      if (isNaN(_startValue)) {
        _startValue = +(props.defaultValue || props.min || 0);
      }
      startValue.current = _startValue;
      setStartPos([e.clientX, e.clientY]);
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleMoveEnd);
    },
    [handleMove, handleMoveEnd, value, props.min, props.defaultValue],
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey) {
      setModifier('metaKey');
    } else if (e.ctrlKey) {
      setModifier('ctrlKey');
    } else if (e.altKey) {
      setModifier('altKey');
    } else if (e.shiftKey) {
      setModifier('shiftKey');
    }
  };

  const handleKeyUp = () => {
    setModifier('');
  };

  useEffect(() => {
    setInputValue(String(value || 0));
  }, [value]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleMoveEnd);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MaskedInput {...props} style={style} onChange={handleChange} onMouseDown={handleMouseDown} value={inputValue} />
  );
}

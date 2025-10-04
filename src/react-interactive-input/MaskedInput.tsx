import { forwardRef, useEffect, useRef, useState } from 'react';

import { type MaskFunction, createNumberMask } from './masks';
import { createChangeEvent, getDecimalPlaces } from './utils';

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Masking function to apply to the input value. Defaults to `numberMask` which ensures that the input value is a valid number, including negative numbers.
   */
  mask?: MaskFunction;
  value?: string;
}

const numberMask = createNumberMask();

/**
 * A React input component featuring input masking specifically designed to address limitations with negative numbers in standard HTML input elements. This component ensures that negative values are properly formatted and accepted by the input field, preventing unexpected behavior or errors when handling signed numbers.
 */
const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask = numberMask, onChange, step = 1, value, ...props }, ref) => {
    const [_value, setValue] = useState(value || '');
    const inputRef = ref || useRef<HTMLInputElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      event.persist();
      const { value } = event.target;
      const maskedValue = mask(value);

      setValue(maskedValue);

      if (onChange) {
        onChange(createChangeEvent(event, maskedValue.replace(',', '.')));
      }
    };

    const handleStep = (e: React.KeyboardEvent<HTMLInputElement>, increment: boolean) => {
      e.persist();
      const target = e.target as HTMLInputElement;
      const currentValue = parseFloat(_value.replace(',', '.')) || 0;
      const stepValue = parseFloat(step.toString());
      const decimalPlaces = getDecimalPlaces(+step);
      const newValue = increment ? currentValue + stepValue : currentValue - stepValue;
      const fixedValue = newValue.toFixed(decimalPlaces);
      const maskedValue = mask(fixedValue);

      setValue(maskedValue);

      if (onChange) {
        const event = new Event('change', { bubbles: true });
        const newEvent = {
          ...event,
          target: {
            ...target,
            value: maskedValue.replace(',', '.'),
            name: target.name,
          },
        };
        onChange(newEvent as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        handleStep(event, true);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        handleStep(event, false);
      }
    };

    useEffect(() => {
      setValue(value || '');
    }, [value]);

    return (
      <input {...props} type="text" ref={inputRef} value={_value} onChange={handleChange} onKeyDown={handleKeyDown} />
    );
  },
);

export default MaskedInput;

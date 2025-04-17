import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-option';
import '@vscode-elements/elements/dist/vscode-single-select';
import { VscodeSingleSelect } from '@vscode-elements/elements/dist/vscode-single-select';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { capitalCase } from 'text-case';
import { DynamicValue } from '../DynamicValue';
import { adheresToSchema, generateDefault } from '../schema';
import { ValueProps, ValueUpdated } from '../valueProps';

export function EnumValue({ name, path, value, schema, readOnly, onValueChange }: ValueProps<unknown>) {
  const [selectedIndex, setSelectedIndex] = useState(findSelectedIndex(value, schema.oneOf!));
  const [currentValues, setCurrentValues] = useState(generateInitialValues(selectedIndex, value, schema));
  const selectRef = useRef<VscodeSingleSelect | null>(null);
  useEffect(() => {
    const selectElement = selectRef.current;
    if (selectElement) {
      const handleChange = () => {
        setSelectedIndex(selectElement.selectedIndex);
        const selectedValue = currentValues[selectElement.selectedIndex];
        onValueChange({ path, value: selectedValue }, selectedValue);
      };
      selectElement.addEventListener('change', handleChange);
      return () => selectElement.removeEventListener('change', handleChange);
    }
  }, [currentValues, onValueChange, path]);

  let selectedComponent: ReactElement | null = null;
  const enumOptions = (schema.oneOf || []).map((option, index) => {
    const selected = index === selectedIndex;
    if (selected && option.const === undefined) {
      selectedComponent = (
        <DynamicValue
          path={path}
          value={currentValues[selectedIndex]}
          schema={option}
          readOnly={readOnly}
          onValueChange={(event, treeValue) => onChildValueChange(event, treeValue, index)}
        />
      );
    }
    return (
      <vscode-option key={String(index)} selected={selected} disabled={readOnly} value={String(option.const)}>
        {option.title}
      </vscode-option>
    );
  });
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      <vscode-single-select ref={selectRef} disabled={readOnly}>
        {enumOptions}
      </vscode-single-select>
      {selectedComponent}
    </vscode-form-group>
  );

  function onChildValueChange(_event: ValueUpdated, treeValue: unknown, index: number) {
    const newValues = currentValues.map((value, i) => (i === index ? treeValue : value));
    setCurrentValues(newValues);
    // BRP doesn't seem to support updating sub-paths of enums.
    const newEvent: ValueUpdated = {
      path: path,
      value: treeValue,
    };
    onValueChange(newEvent, treeValue);
  }
}

function findSelectedIndex(value: unknown, options: BevyJsonSchema[]): number {
  const foundIndex = options.findIndex((schema) => adheresToSchema(value, schema));
  return Math.max(foundIndex, 0); // If no match (-1), default to the first option.
}

function generateInitialValues(selectedIndex: number, value: unknown, schema: BevyJsonSchema) {
  const initialValues = (schema.oneOf || []).map((schema, index) => {
    if (index === selectedIndex) {
      return value;
    }
    return generateDefault(schema);
  });
  return initialValues;
}

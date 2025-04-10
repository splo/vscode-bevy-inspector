import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-option';
import '@vscode-elements/elements/dist/vscode-single-select';
import { VscodeSingleSelect } from '@vscode-elements/elements/dist/vscode-single-select';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { capitalCase } from 'text-case';
import { ComponentValue } from './ComponentValue';

export function EnumValue({
  name,
  value,
  schema,
  readOnly,
  saveValue,
}: {
  name?: string;
  value: unknown;
  schema: BevyJsonSchema;
  readOnly?: boolean;
  saveValue(data: unknown): void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(findSelectedIndex(value, schema.oneOf!));
  const [currentValues, setCurrentValues] = useState(generateInitialValues(selectedIndex, value, schema));
  const selectRef = useRef<VscodeSingleSelect | null>(null);
  useEffect(() => {
    const selectElement = selectRef.current;
    if (selectElement) {
      const handleChange = () => {
        setSelectedIndex(selectElement.selectedIndex);
        saveValue(currentValues[selectElement.selectedIndex]);
      };
      selectElement.addEventListener('change', handleChange);
      return () => selectElement.removeEventListener('change', handleChange);
    }
  }, [currentValues, saveValue]);
  let selectedComponent: ReactElement | null = null;
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      <vscode-single-select ref={selectRef} disabled={readOnly}>
        {schema.oneOf?.map((option, index) => {
          const selected = index === selectedIndex;
          if (selected && option.const === undefined) {
            selectedComponent = (
              <ComponentValue
                value={currentValues[selectedIndex]}
                schema={option}
                readOnly={readOnly}
                saveValue={(newValue) => {
                  const newValues = [...currentValues];
                  newValues[selectedIndex] = newValue;
                  setCurrentValues(newValues);
                  saveValue(newValue);
                }}
              />
            );
          }
          return (
            <vscode-option key={String(index)} selected={selected} disabled={readOnly} value={String(option.title)}>
              {option.title}
            </vscode-option>
          );
        })}
      </vscode-single-select>
      {selectedComponent}
    </vscode-form-group>
  );
}

function findSelectedIndex(value: unknown, options: BevyJsonSchema[]): number {
  const foundIndex = options.findIndex((schema) => adheresToSchema(value, schema));
  return foundIndex !== -1 ? foundIndex : 0; // Default to the first option if none match.
}

function generateInitialValues(selectedIndex: number, value: unknown, schema: BevyJsonSchema) {
  const initialValues = schema.oneOf!.map((schema, index) => {
    if (index === selectedIndex) {
      return value;
    }
    return generateValue(schema);
  });
  return initialValues;
}

function adheresToSchema(value: unknown, schema: BevyJsonSchema): boolean {
  if (schema.const !== undefined) {
    return value === schema.const;
  }
  if (schema.type === 'object') {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const obj = value as Record<string, unknown>;
    for (const [key, subSchema] of Object.entries(schema.properties || {})) {
      if (!adheresToSchema(obj[key], subSchema)) {
        return false;
      }
    }
    return true;
  }
  if (schema.type === 'array') {
    if (!Array.isArray(value) || !Array.isArray(schema.items)) {
      return false;
    }
    value.forEach((item, index) => {
      const itemSchema = (schema.items as BevyJsonSchema[])[index];
      if (!itemSchema || !adheresToSchema(item, itemSchema)) {
        return false;
      }
    });
    return true;
  }
  if (schema.type === 'string') {
    return typeof value === 'string';
  }
  if (schema.type === 'number') {
    return typeof value === 'number';
  }
  return false;
}

function generateValue(schema: BevyJsonSchema): unknown {
  if (schema.const !== undefined) {
    return schema.const;
  }
  if (schema.type === 'object') {
    const obj: Record<string, unknown> = {};
    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        obj[key] = generateValue(value);
      }
    }
    return obj;
  }
  if (schema.type === 'array') {
    return [];
  }
  if (schema.type === 'string') {
    return '';
  }
  if (schema.type === 'number') {
    return 0;
  }
  return undefined;
}

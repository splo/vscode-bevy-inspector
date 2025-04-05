import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import { InteractiveInput } from '@designbyadrian/react-interactive-input';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import { useId } from 'react';
import { capitalCase } from 'text-capital-case';

export function NumberValue({
  name,
  value,
  schema,
  readOnly,
}: {
  name?: string;
  value: number;
  schema?: BevyJsonSchema;
  readOnly?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label htmlFor={id}>{capitalCase(name)}</vscode-label>}
      <InteractiveInput
        id={id}
        value={value}
        step={schema?.multipleOf || 0.05}
        min={schema?.minimum}
        max={schema?.maximum}
        disabled={readOnly}
      ></InteractiveInput>
    </vscode-form-group>
  );
}
//

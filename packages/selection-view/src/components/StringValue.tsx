import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import { useId } from 'react';
import { capitalCase } from 'text-capital-case';

export function StringValue({
  name,
  value,
  readOnly,
  saveValue: saveValue,
}: {
  name?: string;
  value: string;
  schema?: BevyJsonSchema;
  readOnly?: boolean;
  saveValue(data: unknown): void;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label htmlFor={id}>{capitalCase(name)}</vscode-label>}
      <vscode-textfield
        id={id}
        value={value}
        disabled={readOnly}
        onInput={(event) => saveValue((event.target as HTMLInputElement).value)}
      ></vscode-textfield>
    </vscode-form-group>
  );
}

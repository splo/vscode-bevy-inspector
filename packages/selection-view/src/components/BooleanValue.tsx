import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-checkbox';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import { useId } from 'react';
import { capitalCase } from 'text-capital-case';

export function BooleanValue({
  name,
  value,
  readOnly,
}: {
  name?: string;
  value: boolean;
  schema?: BevyJsonSchema;
  readOnly?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label htmlFor={id}>{capitalCase(name)}</vscode-label>}
      <vscode-checkbox id={id} checked={value} disabled={readOnly}></vscode-checkbox>
    </vscode-form-group>
  );
}

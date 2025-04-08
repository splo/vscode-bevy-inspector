import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-option';
import '@vscode-elements/elements/dist/vscode-single-select';
import { capitalCase } from 'text-case';

export function EnumValue({
  name,
  value,
  schema,
  readOnly,
}: {
  name?: string;
  value: unknown;
  schema: BevyJsonSchema;
  readOnly?: boolean;
}) {
  if (!schema.oneOf) {
    return null;
  }
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      <vscode-single-select value={String(value)} disabled={readOnly}>
        {schema.oneOf.map((option) => (
          <vscode-option key={String(option.const)} value={String(option.const)}>
            {option.title}
          </vscode-option>
        ))}
      </vscode-single-select>
    </vscode-form-group>
  );
}

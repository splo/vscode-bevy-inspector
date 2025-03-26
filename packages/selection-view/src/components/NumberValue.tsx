import { BevyJsonSchema } from '@bevy-inspector/inspector-messages';
import { InteractiveInput } from '@designbyadrian/react-interactive-input';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import { useId } from 'react';

export function NumberValue({ name, value, schema }: { name?: string; value: number; schema?: BevyJsonSchema }) {
  const id = useId().replace(/:/g, '');
  return (
    <vscode-form-group variant="horizontal">
      {name && <vscode-label htmlFor={id}>{name}</vscode-label>}
      <InteractiveInput
        id={id}
        value={value}
        step={schema?.multipleOf || 0.05}
        min={schema?.minimum}
        max={schema?.maximum}
      ></InteractiveInput>
    </vscode-form-group>
  );
}
//

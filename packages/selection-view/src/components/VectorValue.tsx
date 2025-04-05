import { BevyJsonSchema } from '@bevy-inspector/inspector-data/types';
import { InteractiveInput } from '@designbyadrian/react-interactive-input';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import { capitalCase } from 'text-capital-case';
import './VectorValue.css';

export function VectorValue({
  name,
  values,
  schema,
  readOnly,
}: {
  name?: string;
  values: number[];
  schema?: BevyJsonSchema;
  readOnly?: boolean;
}) {
  const labels = ['x', 'y', 'z', 'w'];
  return (
    <vscode-form-group className="vector" variant="vertical">
      {name && <vscode-label>{capitalCase(name)}</vscode-label>}
      <div className="vector-container">
        {values.map((value, index) => (
          <div className="vector-item" key={index}>
            <label className={`vector-value vector-${labels[index]}`}>{labels[index]}</label>
            <InteractiveInput
              className="vector-input"
              key={index}
              value={value}
              step={schema?.multipleOf || 0.05}
              min={schema?.minimum}
              max={schema?.maximum}
              disabled={readOnly}
            ></InteractiveInput>
          </div>
        ))}
      </div>
    </vscode-form-group>
  );
}

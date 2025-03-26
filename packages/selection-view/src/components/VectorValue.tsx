import { BevyJsonSchema } from '@bevy-inspector/inspector-messages';
import { InteractiveInput } from '@designbyadrian/react-interactive-input';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-textfield';
import './VectorValue.css';

export function VectorValue({ name, values, schema }: { name?: string; values: number[]; schema?: BevyJsonSchema }) {
  const labels = ['x', 'y', 'z', 'w'];
  return (
    <vscode-form-group className="vector-container" variant="vertical">
      {name && <vscode-label style={{ width: 'auto', textTransform: 'capitalize' }}>{name}</vscode-label>}
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
          ></InteractiveInput>
        </div>
      ))}
    </vscode-form-group>
  );
}
//

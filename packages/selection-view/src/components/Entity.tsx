import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-textfield';

interface EntityProps {
  entity: {
    name: string;
    components: {
      name: string;
      value: unknown;
    }[];
  };
}

export function Entity(props: EntityProps) {
  return (
    <>
      <h2 style={{ width: '100%', textAlign: 'center' }}>{props.entity.name}</h2>
      {props.entity.components.map((component) => {
        const hasError = typeof component.value === 'undefined';
        return (
          <vscode-collapsible
            key={component.name}
            title={`${(hasError && '🛑 ') || ''}${component.name}`}
            open={!hasError}
          >
            <vscode-textfield value={component.value as string}></vscode-textfield>
          </vscode-collapsible>
        );
      })}
    </>
  );
}

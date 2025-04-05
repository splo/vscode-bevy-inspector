import { Component } from '@bevy-inspector/inspector-data/types';
import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-group';
import '@vscode-elements/elements/dist/vscode-icon';
import '@vscode-elements/elements/dist/vscode-label';
import '@vscode-elements/elements/dist/vscode-progress-ring';
import '@vscode-elements/elements/dist/vscode-textfield';
import './ComponentDetails.css';
import { ComponentValue } from './ComponentValue';
import { ErrorCard } from './ErrorCard';

interface ComponentProps {
  component: Component;
}

export function ComponentDetails({ component }: ComponentProps) {
  if (component.error || !component.schema) {
    const errorMessage = component.error || 'No schema found.';
    return (
      <vscode-collapsible title={component.schema?.shortPath} description={component.schema?.typePath}>
        <vscode-icon className="error-icon" slot="decorations" name="error"></vscode-icon>
        <ErrorCard error={errorMessage} />
      </vscode-collapsible>
    );
  }

  return (
    <vscode-collapsible title={component.schema.shortPath} description={component.schema.typePath} open>
      {typeof component.value === 'undefined' ? null : (
        <ComponentValue value={component.value} schema={component.schema} />
      )}
    </vscode-collapsible>
  );
}

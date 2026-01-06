import '@vscode-elements/elements/dist/vscode-collapsible';
import type { VscCollapsibleToggleEvent } from '@vscode-elements/elements/dist/vscode-collapsible/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-form-container';
import { useCallback, useEffect, useState } from 'react';
import type { CollapsibleStateData, UpdateRequestedData } from '../inspector-data/messages';
import { UpdateRequested } from '../inspector-data/messages';
import type { TypedValue } from '../inspector-data/types';
import { usePublisher } from '../messenger/usePublisher';
import { reportCollapsibleState } from './collapsibleReporter';
import { DynamicValue } from './DynamicValue';
import { ErrorCard } from './ErrorCard';
import type { ValueUpdated } from './valueProps';

interface TypedValueDetailsProps {
  typedValue: TypedValue;
  collapsibleState?: CollapsibleStateData;
}

export function TypedValueDetails({ typedValue, collapsibleState }: TypedValueDetailsProps) {
  const [requestData, setRequestData] = useState<UpdateRequestedData>();
  usePublisher(UpdateRequested, requestData);
  const [open, setOpen] = useState(false);

  const collapsibleKey = typedValue.schema.typePath;

  useEffect(() => {
    return () => {
      reportCollapsibleState(collapsibleKey, false);
    };
  }, [collapsibleKey]);

  useEffect(() => {
    if (collapsibleState !== undefined) {
      setOpen(collapsibleState.anyExpanded);
      reportCollapsibleState(collapsibleKey, collapsibleState.anyExpanded);
    }
  }, [collapsibleState, collapsibleKey]);

  const onToggle = useCallback(
    (e: VscCollapsibleToggleEvent) => {
      const expanded = e.detail.open;
      setOpen(expanded);
      reportCollapsibleState(collapsibleKey, expanded);
    },
    [collapsibleKey],
  );

  if (typedValue.error || !typedValue.schema) {
    const errorMessage = typedValue.error || 'No schema found.';
    return (
      <ErrorCard message={errorMessage} title={typedValue.schema.shortPath} description={typedValue.schema.typePath} />
    );
  }

  if (typedValue === undefined) {
    return null;
  }

  const onValueChange = useCallback(
    (event: ValueUpdated) => {
      // Defer state updates to avoid cross-component update during child render.
      const update: UpdateRequestedData = {
        typePath: typedValue.schema.typePath,
        path: event.path,
        newValue: event.value,
      };
      setTimeout(() => setRequestData(update), 0);
    },
    [typedValue.schema.typePath],
  );

  return (
    <vscode-form-container>
      <vscode-collapsible
        title={typedValue.schema.shortPath}
        description={typedValue.schema.typePath}
        open={open}
        onvsc-collapsible-toggle={onToggle}
      >
        <DynamicValue path="" value={typedValue.value} schema={typedValue.schema} onValueChange={onValueChange} />
      </vscode-collapsible>
    </vscode-form-container>
  );
}

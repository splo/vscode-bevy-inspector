import { CollapsibleStateChanged } from '../inspector-data/messages';
import { vscodeMessenger } from '../messenger/vscodeMessenger';

const expandedKeys = new Set<string>();
let previouslyAnyExpanded: boolean | undefined;

export function reportCollapsibleState(key: string, expanded: boolean): void {
  if (expanded) {
    expandedKeys.add(key);
  } else {
    expandedKeys.delete(key);
  }
  const anyExpanded = expandedKeys.size > 0;
  if (previouslyAnyExpanded !== anyExpanded) {
    previouslyAnyExpanded = anyExpanded;
    vscodeMessenger.publishEvent({
      type: CollapsibleStateChanged,
      data: { anyExpanded },
    });
  }
}

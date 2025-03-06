/// <reference types="@vitest/browser/providers/playwright" />
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Entity } from '../src/components/Entity';

test('renders entity', async () => {
  const entity = {
    name: 'Foo',
    components: [
      {
        name: 'Name',
        value: 'Foo',
      },
    ],
  };
  const { getByText } = render(<Entity entity={entity} />);
  await expect.element(getByText('Foo').first()).toBeInTheDocument();
});

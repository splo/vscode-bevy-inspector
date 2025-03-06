/// <reference types="@vitest/browser/providers/playwright" />
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Empty } from '../src/components/Empty';

test('renders empty', async () => {
  const { getByText } = render(<Empty />);
  await expect.element(getByText('Nothing selected in the tree.')).toBeInTheDocument();
});

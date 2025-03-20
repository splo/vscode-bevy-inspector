/// <reference types="@vitest/browser/providers/playwright" />
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { EmptyDetails } from '../components/EmptyDetails';

test('renders empty', async () => {
  const { getByText } = render(<EmptyDetails />);
  await expect.element(getByText('Nothing selected in the tree.')).toBeInTheDocument();
});

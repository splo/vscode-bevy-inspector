/// <reference types="@vitest/browser/providers/playwright" />
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import App from '../src/App';

test('renders app', async () => {
  const { getByText } = render(<App />);
  await expect.element(getByText('Nothing selected in the tree.')).toBeInTheDocument();
});

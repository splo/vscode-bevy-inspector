/// <reference types="@vitest/browser/providers/playwright" />
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { NumberValue } from '../components/NumberValue';

test('renders number value with name', async () => {
  const { getByRole } = render(<NumberValue name="HP" value={123} />);
  await expect.element(getByRole('spinbutton', { name: 'HP' })).toHaveValue(123);
});

test('renders number value without name', async () => {
  const { getByRole } = render(<NumberValue value={3.14} />);
  await expect.element(getByRole('spinbutton')).toHaveValue(3.14);
});

/// <reference types="@vitest/browser/providers/playwright" />
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { StringValue } from '../components/StringValue';

test('renders string value with name', async () => {
  const { getByRole } = render(<StringValue name="Title" value="Bevy Inspector" />);
  await expect.element(getByRole('textbox', { name: 'Title' })).toHaveValue('Bevy Inspector');
});

test('renders string value without name', async () => {
  const { getByRole } = render(<StringValue value="My text box" />);
  await expect.element(getByRole('textbox')).toHaveValue('My text box');
});

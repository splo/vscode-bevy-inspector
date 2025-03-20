/// <reference types="@vitest/browser/providers/playwright" />
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { BooleanValue } from '../components/BooleanValue';

describe.skip('Aria role "checkbox" query does not seem to be working with vscode-checkbox', () => {
  it('renders boolean value with name', async () => {
    const { getByRole } = render(<BooleanValue name="Visible" value={true} />);
    await expect.element(getByRole('checkbox', { name: 'Visible', checked: true })).toBeInTheDocument();
  });

  it('renders boolean value without name', async () => {
    const { getByRole } = render(<BooleanValue value={false} />);
    await expect.element(getByRole('checkbox', { checked: false })).toBeInTheDocument();
  });
});

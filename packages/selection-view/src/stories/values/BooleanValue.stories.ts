import type { Meta, StoryObj } from '@storybook/react';
import { BooleanValue } from '../../components/values/BooleanValue';
import { saveValue } from '../vscodeApiMock';

const meta = {
  title: 'Primitives/BooleanValue',
  component: BooleanValue,
} satisfies Meta<typeof BooleanValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NamedTrue: Story = {
  args: {
    name: 'visible',
    value: true,
    saveValue,
  },
};

export const NamedFalse: Story = {
  args: {
    name: 'focused',
    value: false,
    saveValue,
  },
};

export const UnnamedTrue: Story = {
  args: {
    value: true,
    saveValue,
  },
};

export const UnnamedFalse: Story = {
  args: {
    value: false,
    saveValue,
  },
};

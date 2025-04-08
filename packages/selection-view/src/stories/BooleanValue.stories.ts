import type { Meta, StoryObj } from '@storybook/react';
import { BooleanValue } from '../components/BooleanValue';

const meta = {
  title: 'BooleanValue',
  component: BooleanValue,
} satisfies Meta<typeof BooleanValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NamedTrue: Story = {
  args: {
    name: 'visible',
    value: true,
    saveValue: console.debug,
  },
};

export const NamedFalse: Story = {
  args: {
    name: 'focused',
    value: false,
    saveValue: console.debug,
  },
};

export const UnnamedTrue: Story = {
  args: {
    value: true,
    saveValue: console.debug,
  },
};

export const UnnamedFalse: Story = {
  args: {
    value: false,
    saveValue: console.debug,
  },
};

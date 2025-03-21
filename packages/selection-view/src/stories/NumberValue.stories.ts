import type { Meta, StoryObj } from '@storybook/react';
import { NumberValue } from '../components/NumberValue';

const meta = {
  title: 'NumberValue',
  component: NumberValue,
} satisfies Meta<typeof NumberValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NamedNumber: Story = {
  args: {
    name: 'length',
    value: 12.04,
  },
};

export const UnnamedNumber: Story = {
  args: {
    value: 0,
  },
};

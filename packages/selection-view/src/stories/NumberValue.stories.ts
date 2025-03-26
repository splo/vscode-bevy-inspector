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
    schema: {
      typePath: 'f32',
      shortPath: 'f32',
      type: 'number',
    },
  },
};

export const UnnamedNumber: Story = {
  args: {
    value: 0,
    schema: {
      typePath: 'u32',
      shortPath: 'u32',
      type: 'number',
      multipleOf: 1,
      minimum: 0,
    },
  },
};

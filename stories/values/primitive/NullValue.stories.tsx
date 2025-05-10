import { NullValue } from '@bevy-inspector/schema-components/primitive/NullValue';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Primitive/NullValue',
  component: NullValue,
} satisfies Meta<typeof NullValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NamedNull: Story = {
  args: {
    name: 'My Null Value',
  },
};

export const UnnamedNull: Story = {
  args: {},
};

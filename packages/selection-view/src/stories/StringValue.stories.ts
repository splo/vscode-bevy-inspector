import type { Meta, StoryObj } from '@storybook/react';
import { StringValue } from '../components/StringValue';

const meta = {
  title: 'StringValue',
  component: StringValue,
} satisfies Meta<typeof StringValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NamedString: Story = {
  args: {
    name: 'name',
    value: 'Mr. Smith',
    saveValue: console.debug,
  },
};

export const UnnamedString: Story = {
  args: {
    value: 'Whatever',
    saveValue: console.debug,
  },
};

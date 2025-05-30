import type { Meta, StoryObj } from '@storybook/react';
import { StringValue } from '@bevy-inspector/schema-components/primitive/StringValue';
import { onValueChange } from '../../vscodeApiMock';

const meta = {
  title: 'Primitive/StringValue',
  component: StringValue,
} satisfies Meta<typeof StringValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NamedString: Story = {
  args: {
    name: 'name',
    path: 'name',
    value: 'Mr. Smith',
    schema: { type: 'string' },
    readOnly: false,
    onValueChange,
  },
};

export const UnnamedString: Story = {
  args: {
    value: 'Whatever',
    path: 'whatever',
    schema: { type: 'string' },
    readOnly: false,
    onValueChange,
  },
};

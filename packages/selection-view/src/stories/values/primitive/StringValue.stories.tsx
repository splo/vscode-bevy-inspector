import type { Meta, StoryObj } from '@storybook/react';
import { StringValue } from '../../../components/values/primitive/StringValue';
import { onValueChange, vscodeApiMockDecorator } from '../../vscodeApiMock';

const meta = {
  title: 'Primitive/StringValue',
  component: StringValue,
  decorators: [vscodeApiMockDecorator],
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

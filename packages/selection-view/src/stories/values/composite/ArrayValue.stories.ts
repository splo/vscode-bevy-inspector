import type { Meta, StoryObj } from '@storybook/react';
import { ArrayValue } from '../../../components/values/composite/ArrayValue';
import { onValueChange } from '../../vscodeApiMock';

const meta = {
  title: 'Composite/ArrayValue',
  component: ArrayValue,
} satisfies Meta<typeof ArrayValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Strings: Story = {
  args: {
    name: 'names',
    path: 'names',
    readOnly: false,
    value: ['Alice', 'Bob', 'Charlie'],
    schema: {
      type: 'array',
      items: {
        type: 'string',
        shortPath: 'String',
        typePath: 'alloc::string::String',
      },
      shortPath: 'Vec<String>',
      typePath: 'alloc::vec::Vec<alloc::string::String>',
    },
    onValueChange,
  },
};

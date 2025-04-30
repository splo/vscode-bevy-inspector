import type { Meta, StoryObj } from '@storybook/react';
import { BooleanValue } from '../../../components/values/primitive/BooleanValue';
import { onValueChange } from '../../vscodeApiMock';

const meta = {
  title: 'Primitive/BooleanValue',
  component: BooleanValue,
} satisfies Meta<typeof BooleanValue>;

export default meta;
type Story = StoryObj<typeof meta>;

function defaultArgs(): React.ComponentProps<typeof meta.component> {
  return {
    path: '',
    value: true,
    schema: {
      type: 'boolean',
      shortPath: 'bool',
      typePath: 'bool',
    },
    readOnly: false,
    onValueChange,
  };
}

export const NamedTrue: Story = {
  args: {
    ...defaultArgs(),
    name: 'visible',
    value: true,
  },
};

export const NamedFalse: Story = {
  args: {
    ...defaultArgs(),
    name: 'focused',
    value: false,
  },
};

export const UnnamedTrue: Story = {
  args: {
    ...defaultArgs(),
    value: true,
  },
};

export const UnnamedFalse: Story = {
  args: {
    ...defaultArgs(),
    value: false,
  },
};

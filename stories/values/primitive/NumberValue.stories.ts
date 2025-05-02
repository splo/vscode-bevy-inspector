import type { Meta, StoryObj } from '@storybook/react';
import { NumberValue } from '@bevy-inspector/selection-view/components/values/primitive/NumberValue';
import { onValueChange } from '../../vscodeApiMock';

const meta = {
  title: 'Primitive/NumberValue',
  component: NumberValue,
} satisfies Meta<typeof NumberValue>;

export default meta;
type Story = StoryObj<typeof meta>;

function defaultArgs(): React.ComponentProps<typeof meta.component> {
  return {
    path: '',
    value: 0,
    schema: {
      typePath: 'f32',
      shortPath: 'f32',
      type: 'number',
    },
    readOnly: false,
    onValueChange,
  };
}

export const NamedNumber: Story = {
  args: {
    ...defaultArgs(),
    name: 'length',
    path: 'x',
    value: 12.04,
  },
};

export const UnnamedNumber: Story = {
  args: {
    ...defaultArgs(),
    value: 1.2,
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { VectorValue } from '../../../components/values/specific/VectorValue';
import { onValueChange, vscodeApiMockDecorator } from '../../vscodeApiMock';

const meta = {
  title: 'Specific/Vector',
  component: VectorValue,
  decorators: [vscodeApiMockDecorator],
} satisfies Meta<typeof VectorValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vector: Story = {
  args: {
    name: 'normal',
    path: 'normal',
    value: [1, -2, 3],
    schema: {
      type: 'array',
      items: {
        type: 'number',
        shortPath: 'f32',
        typePath: 'f32',
      },
      minItems: 3,
      maxItems: 3,
      typePath: 'glam::Vec3',
      shortPath: 'Vec3',
    },
    readOnly: false,
    onValueChange,
  },
};

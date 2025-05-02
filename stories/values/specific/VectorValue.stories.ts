import type { Meta, StoryObj } from '@storybook/react';
import { VectorValue } from '@bevy-inspector/schema-components/specific/VectorValue';
import { onValueChange } from '../../vscodeApiMock';

const meta = {
  title: 'Specific/Vector',
  component: VectorValue,
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

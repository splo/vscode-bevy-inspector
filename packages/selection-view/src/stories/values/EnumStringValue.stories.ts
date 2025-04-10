import type { Meta, StoryObj } from '@storybook/react';
import { EnumValue } from '../../components/values/EnumValue';
import { saveValue } from '../vscodeApiMock';

const meta = {
  title: 'EnumValue/String',
  component: EnumValue,
} satisfies Meta<typeof EnumValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SomeString: Story = {
  args: {
    name: 'PickingInteraction',
    value: 'Hovered',
    schema: {
      oneOf: [
        {
          type: 'string',
          const: 'Pressed',
          title: 'Pressed',
        },
        {
          type: 'string',
          const: 'Hovered',
          title: 'Hovered',
        },
        {
          type: 'string',
          const: 'None',
          title: 'None',
        },
      ],
      shortPath: 'PickingInteraction',
      typePath: 'bevy_picking::hover::PickingInteraction',
    },
    readOnly: false,
    saveValue,
  },
};

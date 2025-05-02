import { EnumValue } from '@bevy-inspector/schema-components/composite/EnumValue';
import type { Meta, StoryObj } from '@storybook/react';
import { onValueChange } from '../../vscodeApiMock';

const meta = {
  title: 'Composite/EnumValue',
  component: EnumValue,
} satisfies Meta<typeof EnumValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Strings: Story = {
  args: {
    name: 'PickingInteraction',
    path: 'PickingInteraction',
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
    onValueChange,
  },
};

export const DefaultDiverseObject: Story = {
  args: {
    name: 'pointer',
    path: 'pointer',
    value: 'Mouse', // Should pre-select the first option.
    schema: {
      oneOf: [
        {
          type: 'string',
          const: 'Mouse',
          title: 'Mouse',
        },
        {
          type: 'object',
          required: ['Touch'],
          properties: {
            Touch: {
              type: 'number',
              multipleOf: 1,
              minimum: 0,
              maximum: 9007199254740991,
              shortPath: 'u64',
              typePath: 'u64',
            },
          },
          title: 'Touch',
        },
        {
          type: 'object',
          required: ['Custom'],
          properties: {
            Custom: {
              type: 'string',
              typePath: 'uuid::Uuid',
              shortPath: 'Uuid',
            },
          },
          title: 'Custom',
        },
      ],
      shortPath: 'PointerId',
      typePath: 'bevy_picking::pointer::PointerId',
    },
    readOnly: false,
    onValueChange,
  },
};

export const PreselectedDiverseObject: Story = {
  args: {
    name: 'pointer',
    path: 'pointer',
    value: { Touch: 1001 }, // Should pre-select the second option.
    schema: {
      oneOf: [
        {
          type: 'string',
          const: 'Mouse',
          title: 'Mouse',
        },
        {
          type: 'object',
          required: ['Touch'],
          properties: {
            Touch: {
              type: 'number',
              multipleOf: 1,
              minimum: 0,
              maximum: 9007199254740991,
              shortPath: 'u64',
              typePath: 'u64',
            },
          },
          title: 'Touch',
        },
        {
          type: 'object',
          required: ['Custom'],
          properties: {
            Custom: {
              type: 'string',
              typePath: 'uuid::Uuid',
              shortPath: 'Uuid',
            },
          },
          title: 'Custom',
        },
      ],
      shortPath: 'PointerId',
      typePath: 'bevy_picking::pointer::PointerId',
    },
    readOnly: false,
    onValueChange,
  },
};

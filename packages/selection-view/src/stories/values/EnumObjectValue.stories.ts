import type { Meta, StoryObj } from '@storybook/react';
import { EnumValue } from '../../components/values/EnumValue';
import { saveValue } from '../vscodeApiMock';

const meta = {
  title: 'EnumValue/Object',
  component: EnumValue,
} satisfies Meta<typeof EnumValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Object0: Story = {
  args: {
    name: 'pointer',
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
    saveValue,
  },
};

export const Object1: Story = {
  args: {
    name: 'pointer',
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
    saveValue,
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { OptionalValue } from '../../components/values/OptionalValue';
import { saveValue } from '../vscodeApiMock';

const meta = {
  title: 'OptionalValue/Number',
  component: OptionalValue,
} satisfies Meta<typeof OptionalValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OptionalNumber: Story = {
  args: {
    name: 'aspect_ratio',
    value: 16 / 9,
    schema: {
      oneOf: [
        {
          type: 'null',
          const: null,
          title: 'None',
        },
        {
          type: 'number',
          shortPath: 'f32',
          typePath: 'f32',
          title: 'f32',
        },
      ],
      shortPath: 'Option<f32>',
      typePath: 'core::option::Option<f32>',
    },
    readOnly: false,
    saveValue,
  },
};

export const NullNumber: Story = {
  args: {
    name: 'refresh_rate_millihertz',
    value: null,
    schema: {
      oneOf: [
        {
          type: 'null',
          const: null,
          title: 'None',
        },
        {
          type: 'number',
          multipleOf: 1,
          minimum: 0,
          maximum: 4294967295,
          shortPath: 'u32',
          typePath: 'u32',
          title: 'u32',
        },
      ],
      shortPath: 'Option<u32>',
      typePath: 'core::option::Option<u32>',
    },
    readOnly: false,
    saveValue,
  },
};

export const ReadOnlyOptionalNumber: Story = {
  args: {
    name: 'vendor_id',
    value: 2,
    schema: {
      oneOf: [
        {
          type: 'null',
          const: null,
          title: 'None',
        },
        {
          type: 'number',
          multipleOf: 1,
          minimum: 0,
          maximum: 65535,
          shortPath: 'u16',
          typePath: 'u16',
          title: 'u16',
        },
      ],
      shortPath: 'Option<u16>',
      typePath: 'core::option::Option<u16>',
    },
    readOnly: true,
    saveValue,
  },
};

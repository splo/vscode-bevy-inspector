import type { Meta, StoryObj } from '@storybook/react';
import { OptionalValue } from '../../components/values/OptionalValue';
import { saveValue } from '../vscodeApiMock';

const meta = {
  title: 'OptionalValue/Boolean',
  component: OptionalValue,
} satisfies Meta<typeof OptionalValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OptionalBoolean: Story = {
  args: {
    name: 'minimize_request',
    value: true,
    schema: {
      oneOf: [
        {
          type: 'null',
          const: null,
          title: 'None',
        },
        {
          type: 'boolean',
          shortPath: 'bool',
          typePath: 'bool',
          title: 'bool',
        },
      ],
      shortPath: 'Option<bool>',
      typePath: 'core::option::Option<bool>',
    },
    readOnly: false,
    saveValue,
  },
};

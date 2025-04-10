import type { Meta, StoryObj } from '@storybook/react';
import { OptionalValue } from '../../components/values/OptionalValue';
import { saveValue } from '../vscodeApiMock';

const meta = {
  title: 'OptionalValue/String',
  component: OptionalValue,
} satisfies Meta<typeof OptionalValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SomeString: Story = {
  args: {
    name: 'name',
    value: 'Mr. Smith',
    schema: {
      oneOf: [
        {
          type: 'null',
          const: null,
          title: 'None',
        },
        {
          type: 'string',
          shortPath: 'String',
          typePath: 'alloc::string::String',
          title: 'String',
        },
      ],
      shortPath: 'Option<String>',
      typePath: 'core::option::Option<alloc::string::String>',
    },
    readOnly: false,
    saveValue,
  },
};

export const NoneString: Story = {
  args: {
    name: 'name',
    value: null,
    schema: {
      oneOf: [
        {
          type: 'null',
          const: null,
          title: 'None',
        },
        {
          type: 'string',
          shortPath: 'String',
          typePath: 'alloc::string::String',
          title: 'String',
        },
      ],
      shortPath: 'Option<String>',
      typePath: 'core::option::Option<alloc::string::String>',
    },
    readOnly: false,
    saveValue,
  },
};

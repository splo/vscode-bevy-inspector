import type { Meta, StoryObj } from '@storybook/react';
import { StringValue } from '../../components/values/StringValue';
import { saveValue } from '../vscodeApiMock';

const meta = {
  title: 'Primitives/StringValue',
  component: StringValue,
} satisfies Meta<typeof StringValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NamedString: Story = {
  args: {
    name: 'name',
    value: 'Mr. Smith',
    saveValue,
  },
};

export const UnnamedString: Story = {
  args: {
    value: 'Whatever',
    saveValue,
  },
};

import { BevyRootJsonSchema } from '@bevy-inspector/inspector-data/types';
import type { Meta, StoryObj } from '@storybook/react';
import { OptionalValue } from '../../../components/values/composite/OptionalValue';
import * as schema from '../../schema.json';
import { onValueChange, vscodeApiMockDecorator } from '../../vscodeApiMock';

const meta = {
  title: 'Composite/OptionalValue',
  component: OptionalValue,
  decorators: [vscodeApiMockDecorator],
} satisfies Meta<typeof OptionalValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SomeString: Story = {
  args: {
    name: 'name',
    path: 'name',
    value: 'Mr. Smith',
    schema: (schema as unknown as BevyRootJsonSchema).$defs['core::option::Option<alloc::string::String>'],
    readOnly: false,
    onValueChange,
  },
};

export const NoneString: Story = {
  args: {
    name: 'name',
    path: 'name',
    value: null,
    schema: (schema as unknown as BevyRootJsonSchema).$defs['core::option::Option<alloc::string::String>'],
    readOnly: false,
    onValueChange,
  },
};

export const SomeNumber: Story = {
  args: {
    name: 'aspect_ratio',
    path: 'aspect_ratio',
    value: 16 / 9,
    schema: (schema as unknown as BevyRootJsonSchema).$defs['core::option::Option<f32>'],
    readOnly: false,
    onValueChange,
  },
};

export const NoneNumber: Story = {
  args: {
    name: 'refresh_rate_millihertz',
    path: 'refresh_rate_millihertz',
    value: null,
    schema: (schema as unknown as BevyRootJsonSchema).$defs['core::option::Option<u32>'],
    readOnly: false,
    onValueChange,
  },
};

export const ReadOnlyOptionalNumber: Story = {
  args: {
    name: 'vendor_id',
    path: 'vendor_id',
    value: 2,
    schema: (schema as unknown as BevyRootJsonSchema).$defs['core::option::Option<u16>'],
    readOnly: true,
    onValueChange,
  },
};

export const SomeBoolean: Story = {
  args: {
    name: 'minimize_request',
    path: 'minimize_request',
    value: true,
    schema: (schema as unknown as BevyRootJsonSchema).$defs['core::option::Option<bool>'],
    readOnly: false,
    onValueChange,
  },
};

export const SomeVector: Story = {
  args: {
    name: 'normal',
    path: 'normal',
    value: [1, 2, 3],
    schema: (schema as unknown as BevyRootJsonSchema).$defs['core::option::Option<glam::Vec3>'],
    readOnly: false,
    onValueChange,
  },
};

export const NoneVector: Story = {
  args: {
    name: 'normal',
    path: 'normal',
    value: null,
    schema: (schema as unknown as BevyRootJsonSchema).$defs['core::option::Option<glam::Vec3>'],
    readOnly: false,
    onValueChange,
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { BevyJsonSchemaDefinition, BevyRootJsonSchema, TypePath } from '../src/inspector-data/types';
import { ResourceDetails } from '../src/resources-view/components/ResourceDetails';
import * as schema from './schema.json';

const meta = {
  title: 'ResourceDetails',
  component: ResourceDetails,
} satisfies Meta<typeof ResourceDetails>;

const getSchema = (typePath: TypePath): BevyJsonSchemaDefinition => {
  return (schema as unknown as BevyRootJsonSchema).$defs[typePath];
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EntityWithPrimitiveObject: Story = {
  args: {
    resource: {
      schema: getSchema('bevy_time::stopwatch::Stopwatch'),
      value: {
        elapsed: {
          secs: 1,
          nanos: 234000000,
        },
        is_paused: false,
      },
    },
  },
};

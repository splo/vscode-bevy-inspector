import { ValuesUpdated } from '@bevy-inspector/inspector-data/messages';
import type { BevyJsonSchemaDefinition, BevyRootJsonSchema, TypePath } from '@bevy-inspector/inspector-data/types';
import { ResourcesView } from '@bevy-inspector/resources-view/ResourcesView';
import { messenger } from '@bevy-inspector/resources-view/vscodeMessenger';
import type { Meta, StoryObj } from '@storybook/react';
import * as schema from './schema.json';

const meta = {
  title: 'ResourcesView',
  component: ResourcesView,
} satisfies Meta<typeof ResourcesView>;

const getSchema = (typePath: TypePath): BevyJsonSchemaDefinition => {
  return (schema as unknown as BevyRootJsonSchema).$defs[typePath];
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ResourceWithPrimitiveObject: Story = {
  play: () => {
    messenger.handleIncomingMessage({
      type: ValuesUpdated,
      data: [
        {
          schema: getSchema('bevy_time::stopwatch::Stopwatch'),
          value: {
            elapsed: {
              secs: 1,
              nanos: 234000000,
            },
            is_paused: false,
          },
        },
      ],
    });
  },
};

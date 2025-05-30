import { ComponentsView } from '@bevy-inspector/components-view/components/ComponentsView';
import { ValuesUpdated } from '@bevy-inspector/inspector-data/messages';
import type { BevyJsonSchemaDefinition, BevyRootJsonSchema, TypePath } from '@bevy-inspector/inspector-data/types';
import { VsCodeMessenger } from '@bevy-inspector/messenger/vscodeMessenger';
import type { Mat3 } from '@bevy-inspector/schema-components/schema';
import type { Meta, StoryObj } from '@storybook/react';
import * as schema from './schema.json';

const vscodeMessenger = new VsCodeMessenger(window.vscodeApiMock);

const meta = {
  title: 'ComponentsView',
  component: ComponentsView,
} satisfies Meta<typeof ComponentsView>;

const getSchema = (typePath: TypePath): BevyJsonSchemaDefinition => {
  switch (typePath) {
    case 'custom::Unit':
      return {
        type: 'object',
        typePath,
        shortPath: 'Unit',
        properties: {
          name: getSchema('bevy_ecs::name::Name'),
          enabled: getSchema('custom::Enabled'),
          hit_points: getSchema('custom::HitPoints'),
        },
      };
    case 'custom::HitPoints':
      return { type: 'number', typePath, shortPath: 'HitPoints', minimum: 0, multipleOf: 1 };
    case 'custom::Enabled':
      return { type: 'boolean', typePath, shortPath: 'Enabled' };
    case 'custom::Length':
      return { type: 'number', typePath, shortPath: 'Length' };
    default: {
      return (schema as unknown as BevyRootJsonSchema).$defs[typePath];
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const ComponentWithSinglePrimitiveObject: Story = {
  play: () => {
    vscodeMessenger.publishEvent({
      type: ValuesUpdated,
      data: [
        {
          value: {
            name: 'Soldier',
            enabled: true,
            hit_points: 25,
          },
          schema: getSchema('custom::Unit'),
        },
      ],
    });
  },
};

export const ComponentWithReadOnlySchema: Story = {
  play: () => {
    vscodeMessenger.publishEvent({
      type: ValuesUpdated,
      data: [
        {
          value: {
            name: 'Soldier',
            enabled: true,
            hit_points: 25,
          },
          schema: {
            type: 'object',
            typePath: 'custom::Unit',
            shortPath: 'Unit',
            readOnly: true,
            properties: {
              name: {
                type: 'string',
                typePath: 'bevy_ecs::name::Name',
                shortPath: 'Name',
                readOnly: true,
              },
              enabled: {
                type: 'boolean',
                typePath: 'custom::Enabled',
                shortPath: 'Enabled',
                readOnly: true,
              },
              hit_points: {
                type: 'number',
                typePath: 'custom::HitPoints',
                shortPath: 'HitPoints',
                minimum: 0,
                multipleOf: 1,
                readOnly: true,
              },
            },
          },
        },
      ],
    });
  },
};

export const ComponentWithError: Story = {
  play: () => {
    vscodeMessenger.publishEvent({
      type: ValuesUpdated,
      data: [
        {
          value: undefined,
          error: 'Unable to read the value of "bevy_ecs::name::Name".',
          schema: getSchema('bevy_ecs::name::Name'),
        },
      ],
    });
  },
};

export const ComponentWithMultiplePrimitives: Story = {
  play: () => {
    vscodeMessenger.publishEvent({
      type: ValuesUpdated,
      data: [
        {
          value: 'Test',
          schema: getSchema('bevy_ecs::name::Name'),
        },
        {
          value: 42.07,
          schema: getSchema('custom::Length'),
        },
        {
          value: true,
          schema: getSchema('bevy_render::view::visibility::InheritedVisibility'),
        },
      ],
    });
  },
};

export const ComponentWithOneOf: Story = {
  play: () => {
    vscodeMessenger.publishEvent({
      type: ValuesUpdated,
      data: [
        {
          value: 'Hovered',
          schema: getSchema('bevy_picking::hover::PickingInteraction'),
        },
        {
          value: 123.456,
          schema: getSchema('core::option::Option<f32>'),
        },
      ],
    });
  },
};

export const ComponentWithVectors: Story = {
  play: () => {
    vscodeMessenger.publishEvent({
      type: ValuesUpdated,
      data: [
        {
          value: {
            translation: [1, -2, 1.5],
            rotation: [0, 0, 0, 1],
            scale: [1, 1, 1],
          },
          schema: getSchema('bevy_transform::components::transform::Transform'),
        },
        {
          value: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2.4532573223114014, 0],
          schema: getSchema('bevy_transform::components::global_transform::GlobalTransform'),
        },
        {
          value: [1, 2, 3],
          schema: getSchema('glam::Vec3'),
        },
        {
          value: {
            x_axis: { x: 1, y: 0, z: 0 },
            y_axis: { x: 0, y: 1, z: 0 },
            z_axis: { x: 0, y: 0, z: 1 },
          } satisfies Mat3,
          schema: getSchema('glam::Mat3A'),
        },
      ],
    });
  },
};

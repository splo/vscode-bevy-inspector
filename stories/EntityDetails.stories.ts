import type { Meta, StoryObj } from '@storybook/react';
import { BevyJsonSchemaDefinition, BevyRootJsonSchema, TypePath } from '../src/inspector-data/types';
import { EntityDetails } from '../src/selection-view/components/EntityDetails';
import { Mat3 } from '@bevy-inspector/schema-components/schema';
import * as schema from './schema.json';

const meta = {
  title: 'EntityDetails',
  component: EntityDetails,
} satisfies Meta<typeof EntityDetails>;

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

export const EntityWithPrimitiveObject: Story = {
  args: {
    entity: {
      id: 1,
      name: 'Soldier',
      components: [
        {
          value: {
            name: 'Soldier',
            enabled: true,
            hit_points: 25,
          },
          schema: getSchema('custom::Unit'),
        },
      ],
    },
  },
};

export const EntityWithError: Story = {
  args: {
    entity: {
      id: 2,
      components: [
        {
          value: undefined,
          error: 'Unable to read the value of "bevy_ecs::name::Name".',
          schema: getSchema('bevy_ecs::name::Name'),
        },
      ],
    },
  },
};

export const EntityWithPrimitives: Story = {
  args: {
    entity: {
      id: 3,
      name: 'Test',
      components: [
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
    },
  },
};

export const EntityWithOneOf: Story = {
  args: {
    entity: {
      id: 4,
      components: [
        {
          value: 'Hovered',
          schema: getSchema('bevy_picking::hover::PickingInteraction'),
        },
        {
          value: 123.456,
          schema: getSchema('core::option::Option<f32>'),
        },
      ],
    },
  },
};

export const EntityWithVectors: Story = {
  args: {
    entity: {
      id: 5,
      components: [
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
    },
  },
};

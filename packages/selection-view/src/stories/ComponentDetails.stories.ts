import { BevyJsonSchema } from '@bevy-inspector/inspector-messages';
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentDetails } from '../components/ComponentDetails';

const meta = {
  title: 'ComponentDetails',
  component: ComponentDetails,
} satisfies Meta<typeof ComponentDetails>;

const getSchema = (typePath: string): BevyJsonSchema => {
  switch (typePath) {
    case 'custom::Unit':
      return {
        type: 'object',
        typePath,
        shortPath: 'Unit',
        properties: {
          type: getSchema('custom::UnitType'),
          hit_points: getSchema('custom::HitPoints'),
          enabled: getSchema('custom::Enabled'),
        },
      };
    case 'custom::UnitType':
      return { type: 'string', typePath, shortPath: 'UnitType' };
    case 'custom::HitPoints':
      return { type: 'number', typePath, shortPath: 'HitPoints', minimum: 0, multipleOf: 1 };
    case 'custom::Enabled':
      return { type: 'boolean', typePath, shortPath: 'Enabled' };
    case 'bevy_ecs::name::Name':
      return { type: 'string', typePath, shortPath: 'Name' };
    case 'custom::Length':
      return { type: 'number', typePath, shortPath: 'Length' };
    case 'bevy_render::view::visibility::InheritedVisibility':
      return { type: 'boolean', typePath, shortPath: 'InheritedVisibility' };
    case 'f32':
      return { type: 'number', typePath, shortPath: 'f32' };
    case 'glam::Vec3':
      return {
        type: 'array',
        items: getSchema('f32'),
        minItems: 3,
        maxItems: 3,
        shortPath: 'Vec3',
        typePath,
      };
    case 'glam::Quat':
      return {
        type: 'array',
        items: getSchema('f32'),
        minItems: 4,
        maxItems: 4,
        typePath,
        shortPath: 'Quat',
      };
    case 'bevy_transform::components::transform::Transform':
      return {
        type: 'object',
        required: ['translation', 'rotation', 'scale'],
        properties: {
          translation: getSchema('glam::Vec3'),
          rotation: getSchema('glam::Quat'),
          scale: getSchema('glam::Vec3'),
        },
        typePath,
        shortPath: 'Transform',
      };
    case 'bevy_transform::components::global_transform::GlobalTransform':
      return {
        shortPath: 'GlobalTransform',
        typePath: 'bevy_transform::components::global_transform::GlobalTransform',
        type: 'object',
        required: ['matrix3', 'translation'],
        properties: {
          matrix3: {
            type: 'object',
            required: ['x_axis', 'y_axis', 'z_axis'],
            properties: {
              x_axis: {
                type: 'object',
                required: ['x', 'y', 'z'],
                properties: { x: getSchema('f32'), y: getSchema('f32'), z: getSchema('f32') },
                shortPath: 'Vec3A',
                typePath: 'glam::Vec3A',
              },
              y_axis: {
                type: 'object',
                required: ['x', 'y', 'z'],
                properties: { x: getSchema('f32'), y: getSchema('f32'), z: getSchema('f32') },
                shortPath: 'Vec3A',
                typePath: 'glam::Vec3A',
              },
              z_axis: {
                type: 'object',
                required: ['x', 'y', 'z'],
                properties: { x: getSchema('f32'), y: getSchema('f32'), z: getSchema('f32') },
                shortPath: 'Vec3A',
                typePath: 'glam::Vec3A',
              },
            },
            shortPath: 'Mat3A',
            typePath: 'glam::Mat3A',
          },
          translation: {
            type: 'object',
            required: ['x', 'y', 'z'],
            properties: { x: getSchema('f32'), y: getSchema('f32'), z: getSchema('f32') },
            shortPath: 'Vec3A',
            typePath: 'glam::Vec3A',
          },
        },
      };
    default:
      throw new Error(`Could not find schema for type "${typePath}".`);
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimitiveObjectComponent: Story = {
  args: {
    entityId: 1000,
    component: {
      value: {
        type: 'Soldier',
        hit_points: 25,
        enabled: true,
      },
      schema: getSchema('custom::Unit'),
    },
  },
};

export const StringComponent: Story = {
  args: {
    entityId: 1001,
    component: {
      value: 'Test',
      schema: getSchema('bevy_ecs::name::Name'),
    },
  },
};

export const NumberComponent: Story = {
  args: {
    entityId: 1002,
    component: {
      value: 42.07,
      schema: getSchema('custom::Length'),
    },
  },
};

export const BooleanComponent: Story = {
  args: {
    entityId: 1003,
    component: {
      value: true,
      schema: getSchema('bevy_render::view::visibility::InheritedVisibility'),
    },
  },
};

export const TransformComponent: Story = {
  args: {
    entityId: 1004,
    component: {
      value: {
        translation: [1, -2, 1.5],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      },
      schema: getSchema('bevy_transform::components::transform::Transform'),
    },
  },
};

export const GlobalTransformComponent: Story = {
  args: {
    entityId: 1005,
    component: {
      value: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2.4532573223114014, 0],
      schema: getSchema('bevy_transform::components::global_transform::GlobalTransform'),
    },
  },
};

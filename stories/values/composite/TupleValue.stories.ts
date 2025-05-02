import type { Meta, StoryObj } from '@storybook/react';
import { TupleValue } from '@bevy-inspector/selection-view/components/values/composite/TupleValue';
import { onValueChange } from '../../vscodeApiMock';

const meta = {
  title: 'Composite/TupleValue',
  component: TupleValue,
} satisfies Meta<typeof TupleValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    name: 'ui_picking',
    path: 'picking',
    readOnly: false,
    value: [{}, { require_markers: true }],
    schema: {
      type: 'array',
      items: [
        {
          type: 'object',
          required: [],
          properties: {},
          shortPath: 'UiPickingCamera',
          typePath: 'bevy_ui::picking_backend::UiPickingCamera',
        },
        {
          type: 'object',
          required: ['require_markers'],
          properties: {
            require_markers: {
              type: 'boolean',
              shortPath: 'bool',
              typePath: 'bool',
            },
          },
          shortPath: 'UiPickingSettings',
          typePath: 'bevy_ui::picking_backend::UiPickingSettings',
        },
      ],
      shortPath: '(UiPickingCamera, UiPickingSettings)',
      typePath: '(bevy_ui::picking_backend::UiPickingCamera, bevy_ui::picking_backend::UiPickingSettings)',
    },
    onValueChange,
  },
};

export const Complex: Story = {
  args: {
    name: 'sorted_entities',
    path: 'entities',
    readOnly: false,
    value: [1234, { camera: 1234, depth: 0.5, normal: null, position: null }],
    schema: {
      type: 'array',
      items: [
        {
          typePath: 'bevy_ecs::entity::Entity',
          shortPath: 'Entity',
          type: 'number',
          multipleOf: 1,
          minimum: 0,
          maximum: 9007199254740991,
        },
        {
          type: 'object',
          required: ['camera', 'depth'],
          properties: {
            camera: {
              typePath: 'bevy_ecs::entity::Entity',
              shortPath: 'Entity',
              type: 'number',
              multipleOf: 1,
              minimum: 0,
              maximum: 9007199254740991,
            },
            depth: {
              type: 'number',
              shortPath: 'f32',
              typePath: 'f32',
            },
            normal: {
              oneOf: [
                {
                  type: 'null',
                  const: null,
                  title: 'None',
                },
                {
                  title: 'Vec3',
                  type: 'array',
                  items: {
                    type: 'number',
                    shortPath: 'f32',
                    typePath: 'f32',
                  },
                  minItems: 3,
                  maxItems: 3,
                  typePath: 'glam::Vec3',
                  shortPath: 'Vec3',
                },
              ],
              shortPath: 'Option<Vec3>',
              typePath: 'core::option::Option<glam::Vec3>',
            },
            position: {
              oneOf: [
                {
                  type: 'null',
                  const: null,
                  title: 'None',
                },
                {
                  title: 'Vec3',
                  type: 'array',
                  items: {
                    type: 'number',
                    shortPath: 'f32',
                    typePath: 'f32',
                  },
                  minItems: 3,
                  maxItems: 3,
                  typePath: 'glam::Vec3',
                  shortPath: 'Vec3',
                },
              ],
              shortPath: 'Option<Vec3>',
              typePath: 'core::option::Option<glam::Vec3>',
            },
          },
          shortPath: 'HitData',
          typePath: 'bevy_picking::backend::HitData',
        },
      ],
      shortPath: '(Entity, HitData)',
      typePath: '(bevy_ecs::entity::Entity, bevy_picking::backend::HitData)',
    },
    onValueChange,
  },
};

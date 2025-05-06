import type { Meta, StoryObj } from '@storybook/react';
import { ErrorCard } from '@bevy-inspector/resources-view/components/ErrorCard';

const meta = {
  title: 'ErrorCard',
  component: ErrorCard,
} satisfies Meta<typeof ErrorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message:
      'Could not load component "bevy_transform::components::transform::Transform". This is a very long error message that should overflow and be truncated. It should also be scrollable.',
    title: 'Transform',
    description: 'bevy_transform::components::transform::Transform',
  },
};

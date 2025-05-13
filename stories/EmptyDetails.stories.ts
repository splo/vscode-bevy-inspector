import type { Meta, StoryObj } from '@storybook/react';
import { EmptyDetails } from '@bevy-inspector/components-view/components/EmptyDetails';

const meta = {
  title: 'EmptyDetails',
  component: EmptyDetails,
} satisfies Meta<typeof EmptyDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

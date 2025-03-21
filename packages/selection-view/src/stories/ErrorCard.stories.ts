import type { Meta, StoryObj } from '@storybook/react';
import { ErrorCard } from '../components/ErrorCard';

const meta = {
  title: 'ErrorCard',
  component: ErrorCard,
} satisfies Meta<typeof ErrorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    error: 'Something went wrong',
  },
};

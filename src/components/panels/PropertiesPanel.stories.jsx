import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import PropertiesPanel from '@/components/panels/PropertiesPanel';

const meta = {
  title: 'Panels/PropertiesPanel',
  component: PropertiesPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Properties inspector panel for editing selected elements.
Displays transform controls, appearance settings, and type-specific properties.

**Features:**
- Transform (position, rotation, opacity)
- Size controls (width, height, radius)
- Appearance (fill, stroke, stroke width)
- Typography (for text elements)
- Layer info
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof PropertiesPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Empty state (no selection)
export const NoSelection: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Shows empty state when no elements are selected.',
      },
    },
  },
};

// Note: For stories with actual data, you would need to mock the Zustand store
// This is typically done with Storybook's store mocking or decorators

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import TopToolbar from '@/components/panels/TopToolbar';

// Mock the store for Storybook
const mockStoreActions = {
  activeTool: 'select',
  zoom: 1,
  showGrid: true,
  snapToGrid: true,
  showSmartGuides: true,
  setActiveTool: fn(),
  zoomIn: fn(),
  zoomOut: fn(),
  resetZoom: fn(),
  centerCanvas: fn(),
  toggleGrid: fn(),
  toggleSnapToGrid: fn(),
  toggleSmartGuides: fn(),
  undo: fn(),
  redo: fn(),
  canUndo: () => false,
  canRedo: () => false,
  clearCanvas: fn(),
  exportToJSON: fn(),
  importFromJSON: fn(),
};

const meta = {
  title: 'Panels/TopToolbar',
  component: TopToolbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The main toolbar for CanvasFlow, containing:
- Tool selection (Select, Rectangle, Circle, Text, etc.)
- Zoom controls
- Undo/Redo actions
- File and View menus

All buttons include proper ARIA labels for accessibility.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    activeTool: {
      control: 'select',
      options: ['select', 'rectangle', 'circle', 'text', 'line', 'arrow', 'star', 'polygon', 'pan'],
      description: 'Currently active tool',
    },
    zoom: {
      control: { type: 'range', min: 0.05, max: 5, step: 0.1 },
      description: 'Current zoom level (5% - 500%)',
    },
  },
  args: { ...mockStoreActions },
} satisfies Meta<typeof TopToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    ...mockStoreActions,
  },
};

// With zoomed in view
export const ZoomedIn: Story = {
  args: {
    ...mockStoreActions,
    zoom: 2,
  },
};

// With undo available
export const WithHistory: Story = {
  args: {
    ...mockStoreActions,
    canUndo: () => true,
    canRedo: () => true,
  },
};

// Rectangle tool selected
export const RectangleToolActive: Story = {
  args: {
    ...mockStoreActions,
    activeTool: 'rectangle',
  },
};

// Pan tool active
export const PanToolActive: Story = {
  args: {
    ...mockStoreActions,
    activeTool: 'pan',
  },
};

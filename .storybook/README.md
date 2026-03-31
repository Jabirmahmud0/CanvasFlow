# CanvasFlow Storybook

Interactive component documentation and development environment for CanvasFlow.

## Getting Started

### Run Storybook Development Server

```bash
npm run storybook
```

This starts Storybook at `http://localhost:6006`

### Build Static Storybook

```bash
npm run build-storybook
```

Outputs to `storybook-static/` directory, ready for deployment.

## Available Stories

### Panels
- **TopToolbar** - Main application toolbar with tools, zoom, and actions
  - Default state
  - Different tool selections
  - With history available
  - Different zoom levels

- **PropertiesPanel** - Element properties inspector
  - Empty state (no selection)
  - Single selection states
  - Multi-selection states

### UI Components
- **Button** - Base button component
  - All variants (default, secondary, destructive, outline, ghost, link)
  - All sizes (sm, default, lg, icon)
  - States (disabled, with icon)

## Writing Stories

Create a `.stories.jsx` file next to your component:

```jsx
import type { Meta, StoryObj } from '@storybook/react';
import MyComponent from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary'],
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Hello World',
  },
};
```

## Addons

CanvasFlow Storybook includes:

- **@storybook/addon-essentials** - Core addons (docs, actions, controls, etc.)
- **@storybook/addon-interactions** - Test component interactions
- **@storybook/addon-a11y** - Accessibility testing
- **@storybook/test** - Testing utilities

## Accessibility Testing

Click the accessibility tab in any story to see WCAG compliance results.

## Deployment

Storybook can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting

```bash
npm run build-storybook
# Deploy storybook-static/ directory
```

## Documentation

- [Storybook Docs](https://storybook.js.org/docs)
- [Writing Stories](https://storybook.js.org/docs/writing-stories)
- [Components](https://storybook.js.org/docs/components)

import type { Preview } from '@storybook/react';
import '../src/index.css';

// CanvasFlow dark theme for Storybook
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0F172A',
        },
        {
          name: 'darker',
          value: '#020617',
        },
        {
          name: 'light',
          value: '#F8FAFC',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },
    a11y: {
      // Accessibility check configuration
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'aria-required-attr',
            enabled: true,
          },
        ],
      },
    },
  },

  // Global decorators
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900 p-8">
        <Story />
      </div>
    ),
  ],

  // Global args
  args: {},
};

export default preview;

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        docs: true,
        actions: true,
        controls: true,
        backgrounds: true,
        viewport: true,
        toolbars: true,
      },
    },
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    // Customize Vite config for Storybook
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': '/src',
        },
      },
    };
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;

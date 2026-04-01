import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['masked-icon.svg', 'architecture.svg', 'og-image.svg'],
      manifest: {
        id: '/',
        name: 'CanvasFlow - Online Infinite Canvas Editor',
        short_name: 'CanvasFlow',
        description: 'An online infinite canvas editor for diagrams, whiteboards, wireframes, vector graphics, and visual planning.',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'masked-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: 'masked-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        categories: ['productivity', 'utilities', 'design'],
        screenshots: [
          {
            src: 'og-image.svg',
            sizes: '1200x630',
            type: 'image/svg+xml',
            form_factor: 'wide',
            label: 'CanvasFlow infinite canvas editor preview'
          }
        ],
        shortcuts: [
          {
            name: 'New Canvas',
            short_name: 'New',
            description: 'Start a new canvas',
            url: '/?new',
            icons: [{ src: 'masked-icon.svg', sizes: 'any', type: 'image/svg+xml' }]
          }
        ],
        share_target: {
          action: '/share',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'images',
                accept: 'image/*'
              }
            ]
          }
        }
      },
      // Workbox configuration
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      },
      // Development mode
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    exclude: ['tests/visual/**', 'node_modules/**'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/*.config.*.js',
      ],
    },
  },
  build: {
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Core React stack - must be checked first
            if (id.includes('/react/') || id.includes('/react-dom/')) {
              return 'vendor-core'
            }
            // Canvas and graphics
            if (id.includes('/react-konva/') || id.includes('/konva/')) {
              return 'vendor-canvas'
            }
            // Animation
            if (id.includes('/framer-motion/')) {
              return 'vendor-animation'
            }
            // State management
            if (id.includes('/zustand/')) {
              return 'vendor-state'
            }
            // Form handling
            if (id.includes('/react-hook-form/') || id.includes('/@hookform/')) {
              return 'vendor-form'
            }
            // Validation
            if (id.includes('/zod/')) {
              return 'vendor-validation'
            }
            // Charts
            if (id.includes('/recharts/')) {
              return 'vendor-charts'
            }
            // Date utilities
            if (id.includes('/date-fns/') || id.includes('/react-day-picker/')) {
              return 'vendor-dates'
            }
            // Radix UI and other UI libraries
            if (id.includes('/@radix-ui/')) {
              return 'vendor-ui'
            }
            if (id.includes('/cmdk/')) {
              return 'vendor-command'
            }
            if (id.includes('/embla-carousel/')) {
              return 'vendor-carousel'
            }
            if (id.includes('/input-otp/')) {
              return 'vendor-input-otp'
            }
            if (id.includes('/vaul/')) {
              return 'vendor-drawer'
            }
            if (id.includes('/react-resizable-panels/')) {
              return 'vendor-resizable'
            }
            // Icons and utilities
            if (id.includes('/lucide-react/')) {
              return 'vendor-icons'
            }
            if (id.includes('/clsx/') || id.includes('/tailwind-merge/') || id.includes('/class-variance-authority/')) {
              return 'vendor-classnames'
            }
            if (id.includes('/tailwindcss-animate/')) {
              return 'vendor-animation-utils'
            }
            // Theme
            if (id.includes('/next-themes/')) {
              return 'vendor-theme'
            }
            // Error monitoring
            if (id.includes('/@sentry/')) {
              return 'vendor-monitoring'
            }
            // Notifications
            if (id.includes('/sonner/')) {
              return 'vendor-notifications'
            }
          }
          // Don't return a default value to avoid circular dependencies
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console in development
        drop_debugger: true,
      },
    },
    // Source maps
    sourcemap: false, // Disable for production to reduce size
    // Target
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

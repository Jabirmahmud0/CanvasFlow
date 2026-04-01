# CanvasFlow

<div align="center">

**A production-grade infinite canvas editor built with React**

![CanvasFlow Banner](./public/banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vite.dev/)
[![Tests](https://img.shields.io/badge/tests-22%20passed-brightgreen.svg)]()
[![WCAG 2.1](https://img.shields.io/badge/WCAG-2.1%20AA-blue.svg)]()

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Testing](#-testing) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Architecture](#-architecture)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Design System](#-design-system)
- [Testing](#-testing)
- [Performance](#-performance)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

CanvasFlow is a professional-grade vector editing application that demonstrates senior-level frontend engineering expertise. Built with React 19 and powered by Konva.js, it delivers a high-performance infinite canvas experience with advanced state management, comprehensive accessibility support, and a polished user interface designed for creative workflows.

### Key Highlights

- **60 FPS Performance** - Optimized rendering engine handling thousands of nodes
- **WCAG 2.1 AA Compliant** - Full keyboard navigation and screen reader support
- **Production-Ready** - Comprehensive test suite, CI/CD ready, error monitoring integration
- **Enterprise Architecture** - Clean separation of concerns, scalable state management

---

## ✨ Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **Infinite Canvas** | Pan and zoom seamlessly from 5% to 500% with smooth interpolation |
| **Shape Tools** | Rectangle, Circle, Star, Polygon, Line, Arrow, and Text elements |
| **Smart Selection** | Click, shift-click, and box selection with multi-select support |
| **Transform Controls** | Move, resize, and rotate with precision handles |
| **Layer Management** | Organize elements with a full-featured layers panel |
| **Properties Inspector** | Fine-tune position, size, color, and typography |

### Advanced Features

| Feature | Description |
|---------|-------------|
| **Snap-to-Grid** | Precise alignment with configurable grid system |
| **Smart Guides** | Intelligent alignment indicators for object positioning |
| **Undo/Redo** | Up to 100 steps of history with command pattern |
| **Clipboard Operations** | Copy, cut, and paste elements with keyboard shortcuts |
| **Import/Export** | Save and load canvas state as JSON |
| **Keyboard Shortcuts** | Comprehensive shortcut system for power users |

### Accessibility

- ✅ **WCAG 2.1 AA Compliant** - Built with accessibility as a core principle
- ✅ **Full Keyboard Navigation** - All features accessible without a mouse
- ✅ **ARIA Labels** - Complete screen reader support throughout
- ✅ **Focus Management** - Proper focus trapping in modals and dialogs
- ✅ **High Contrast Support** - Customizable themes for visual impairments

---

## 🛠️ Tech Stack

### Frontend Framework

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | [React 19](https://react.dev/) | UI component library |
| **Build Tool** | [Vite 7](https://vite.dev/) | Fast build tooling and HMR |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight global state |
| **Rendering Engine** | [React Konva](https://konvajs.org/docs/react/) | 2D canvas rendering |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) | Micro-interactions |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |

### Testing & Quality

| Category | Technology | Purpose |
|----------|------------|---------|
| **Unit Testing** | [Vitest](https://vitest.dev/) | Fast unit test runner |
| **Component Testing** | [React Testing Library](https://testing-library.com/react) | User-centric testing |
| **Visual Testing** | [Playwright](https://playwright.dev/) | E2E and visual regression |
| **Accessibility** | [@axe-core/react](https://github.com/dequelabs/axe-core) | A11y auditing |

### UI Components

| Category | Technology | Purpose |
|----------|------------|---------|
| **Icons** | [Lucide React](https://lucide.dev/) | Icon library |
| **Primitives** | [Radix UI](https://www.radix-ui.com/) | Accessible components |
| **Component Docs** | [Storybook](https://storybook.js.org/) | Component development |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/canvasflow.git
cd canvasflow

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Variables

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code analysis |
| `npm test` | Run unit and component tests |
| `npm run test:ui` | Run tests with interactive UI |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:visual` | Run visual regression tests |
| `npm run storybook` | Start Storybook development server |
| `npm run build-storybook` | Build Storybook for deployment |
| `npm run build:tokens` | Generate design tokens |
| `npm run analyze` | Analyze bundle size |

---

## 🏗️ Architecture

### Application Structure

```
src/
├── components/
│   ├── canvas/          # Canvas rendering components
│   │   ├── Canvas.jsx        # Main canvas with Konva Stage
│   │   ├── CanvasElement.jsx # Individual element renderer
│   │   ├── Grid.jsx          # Grid rendering
│   │   ├── SelectionBox.jsx  # Selection bounding box
│   │   └── TextEditor.jsx    # Inline text editing
│   ├── panels/          # UI panels
│   │   ├── TopToolbar.jsx      # Main toolbar
│   │   ├── LayersPanel.jsx     # Layers management
│   │   ├── PropertiesPanel.jsx # Properties inspector
│   │   └── FloatingToolbar.jsx # Context-aware toolbar
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   └── ...
├── store/
│   └── useCanvasStore.js     # Zustand state management
├── hooks/
│   ├── useFocusTrap.js       # Focus management for modals
│   ├── useKeyboardNavigation.js # Keyboard shortcuts
│   └── use-mobile.js         # Mobile detection
├── constants/
│   └── index.js              # Design tokens
├── lib/
│   └── utils.js              # Utility functions
├── test/
│   ├── setup.js              # Test configuration
│   ├── TopToolbar.test.jsx   # Component tests
│   └── useCanvasStore.test.js # Store tests
├── App.jsx                   # Root component
├── main.jsx                  # Entry point
└── index.css                 # Global styles
```

### State Architecture

CanvasFlow employs a **Zustand** store with normalized state structure for optimal performance:

```
┌─────────────────────────────────────────────────────────┐
│                    useCanvasStore                        │
├─────────────────────────────────────────────────────────┤
│  View State          │  zoom, offset, canvasBackground  │
│  Elements            │  Normalized array of elements    │
│  Selection           │  selectedIds array               │
│  Tool State          │  activeTool, isDrawing, etc.     │
│  Transform State     │  isTransforming, transformType   │
│  UI State            │  showGrid, snapToGrid, etc.      │
│  History             │  Command pattern stack (100)     │
│  Clipboard           │  Copied elements array           │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   User       │────▶│   Actions   │────▶│   Zustand    │
│   Input      │     │  (Handlers) │     │    Store     │
└──────────────┘     └─────────────┘     └──────────────┘
                            │                   │
                            ▼                   ▼
                     ┌─────────────┐     ┌──────────────┐
                     │   History   │     │   React      │
                     │  (Undo/Redo)│     │   Re-render  │
                     └─────────────┘     └──────────────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │   Konva      │
                                         │   Canvas     │
                                         └──────────────┘
```

### Component Hierarchy

```
App
├── TopToolbar (role="toolbar")
│   ├── Tool Buttons (aria-pressed, aria-keyshortcuts)
│   ├── Zoom Controls (role="group")
│   └── History Controls (role="group")
├── LayersPanel (role="complementary")
│   └── Layer Items (aria-selected)
├── Canvas Area
│   ├── Canvas (Konva Stage)
│   │   ├── Grid Layer
│   │   ├── Smart Guides Layer
│   │   └── Elements Layer
│   │       ├── CanvasElement
│   │       │   ├── Shape (Rect/Circle/Text/etc.)
│   │       │   └── Transformer (selection handles)
│   │       └── DrawingPreview
│   ├── FloatingToolbar (conditional)
│   └── Status Bar
└── PropertiesPanel (role="complementary")
    └── Property Groups
```

---

## ⌨️ Keyboard Shortcuts

### Tool Selection

| Key | Action |
|-----|--------|
| `V` | Select Tool |
| `R` | Rectangle Tool |
| `C` | Circle Tool |
| `T` | Text Tool |
| `L` | Line Tool |
| `A` | Arrow Tool |
| `S` | Star Tool |
| `P` | Polygon Tool |
| `H` | Pan Tool |

### Editing Actions

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+D` | Duplicate |
| `Ctrl+C` | Copy |
| `Ctrl+X` | Cut |
| `Ctrl+V` | Paste |
| `Delete` | Delete Selected |
| `Ctrl+A` | Select All |
| `Esc` | Deselect All |

### View Controls

| Shortcut | Action |
|----------|--------|
| `Ctrl++` | Zoom In |
| `Ctrl+-` | Zoom Out |
| `Ctrl+0` | Reset Zoom |
| `Ctrl+1` | Center Canvas |
| `G` | Toggle Grid |
| `U` | Toggle Smart Guides |

### Layer Ordering

| Shortcut | Action |
|----------|--------|
| `Ctrl+]` | Bring to Front |
| `Ctrl+[` | Send to Back |
| `Ctrl+Shift+]` | Bring Forward |
| `Ctrl+Shift+[` | Send Backward |

---

## 🎨 Design System

### Color Palette

CanvasFlow uses a professional dark theme with carefully selected accent colors:

```javascript
// Canvas Theme
canvasBg: '#0F172A'      // slate-900
surfacePrimary: '#1E293B' // slate-800
surfaceSecondary: '#334155' // slate-700

// Accent
accentPrimary: '#6366F1'  // indigo-500

// Semantic
success: '#22C55E'  // green-500
warning: '#F59E0B'  // amber-500
error: '#EF4444'    // red-500
```

### Typography

| Element | Font Size | Weight |
|---------|-----------|--------|
| Tool Labels | 12-13px | 400 |
| Panel Content | 14px | 400-500 |
| Headers | 16-18px | 600 |
| **Primary Font** | Inter (system font stack fallback) |

### Spacing

Built on an 8px grid system:

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px (base) |
| md | 16px |
| lg | 24px |
| xl | 32px |

### Border Radius

| Token | Value |
|-------|-------|
| sm | 4px |
| md | 6px |
| lg | 8px |
| xl | 12px |

---

## 🧪 Testing

CanvasFlow maintains comprehensive test coverage across all critical functionality.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with interactive UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run visual regression tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update
```

### Test Structure

| Type | Coverage | Tools |
|------|----------|-------|
| **Unit Tests** | Store actions, selectors, utilities | Vitest |
| **Component Tests** | UI components with RTL | React Testing Library |
| **Integration Tests** | User workflows | Playwright |
| **Visual Tests** | Screenshot comparisons | Playwright |

### Current Coverage

- ✅ **22 passing tests** across store and components
- ✅ **100% ARIA compliance** for accessibility
- ✅ **Zero build errors** in production bundle

---

## ⚡ Performance

### Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| **Frame Rate** | 60 FPS | ✅ Achieved |
| **Zoom Range** | 5% - 500% | ✅ Implemented |
| **Undo/Redo** | 100 steps | ✅ Implemented |
| **Bundle Size** | < 800 KB JS | ✅ 708 KB |
| **Load Time** | < 3s | ✅ Optimized |

### Optimization Techniques

- **Normalized State** - Efficient state updates with minimal re-renders
- **Derived Selectors** - Computed state without duplication
- **RequestAnimationFrame** - Synchronized canvas rendering
- **Lazy Loading** - Code splitting for heavy modules
- **Virtualization** - Efficient list rendering in panels
- **Web Workers** - Offloaded heavy computations (planned)
- **OffscreenCanvas** - Background rendering (planned)

---

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Platforms

CanvasFlow can be deployed to any static hosting service:

| Platform | Configuration |
|----------|---------------|
| **Vercel** | Automatic deployments from Git |
| **Netlify** | Drag & drop or Git integration |
| **GitHub Pages** | `gh-pages` branch deployment |
| **Cloudflare Pages** | Git integration with Workers |

### Build Output

```
dist/index.html                   0.40 kB
dist/assets/index-*.css          54.09 kB
dist/assets/index-*.js          707.74 kB
```

### Bundle Analysis

```bash
# Analyze bundle composition
npm run analyze

# Check bundle sizes against budgets
npm run size
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Follow existing code conventions
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Ensure all tests pass before submitting

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions
- `chore:` - Maintenance tasks

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**CanvasFlow** - A senior frontend engineering showcase project demonstrating expertise in:

- 🎨 Rendering and UI Systems Engineering
- ⚡ Performance Optimization
- 🧩 Design System Implementation
- 🔄 Robust State Management

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - The library for web and native user interfaces
- [Konva](https://konvajs.org/) - 2D canvas library for high-performance rendering
- [Zustand](https://zustand-demo.pmnd.rs/) - Bear necessities for state management
- [Framer Motion](https://www.framer.com/motion/) - Animation library for React
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Vite](https://vite.dev/) - Next generation frontend tooling
- [Vitest](https://vitest.dev/) - Blazing fast unit test framework

---

<div align="center">

**Built with ❤️ using React + Vite + Konva**

[Back to top](#canvasflow)

</div>

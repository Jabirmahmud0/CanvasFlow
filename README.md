# CanvasFlow

**A production-grade infinite canvas editor built with React**

CanvasFlow is a professional-grade vector editing application that demonstrates senior-level frontend engineering expertise. It features a high-performance rendering engine, advanced state management, and a polished user interface designed for creative workflows.

![CanvasFlow Banner](./public/banner.png)

## 🌟 Features

### Core Functionality
- **Infinite Canvas** - Pan and zoom seamlessly from 5% to 500%
- **Shape Tools** - Rectangle, Circle, Star, Polygon, Line, Arrow, and Text
- **Smart Selection** - Click, shift-click, and box selection with multi-select support
- **Transform Controls** - Move, resize, and rotate with precision handles
- **Layer Management** - Organize elements with a full-featured layers panel
- **Properties Inspector** - Fine-tune position, size, color, and typography

### Advanced Features
- **Snap-to-Grid** - Precise alignment with configurable grid system
- **Smart Guides** - Intelligent alignment indicators for object positioning
- **Undo/Redo** - Up to 100 steps of history with command pattern
- **Clipboard Operations** - Copy, cut, and paste elements
- **Import/Export** - Save and load canvas state as JSON
- **Keyboard Shortcuts** - Comprehensive shortcut system for power users

### Accessibility
- **WCAG 2.1 AA Compliant** - Built with accessibility in mind
- **Full Keyboard Navigation** - All features accessible via keyboard
- **ARIA Labels** - Screen reader support throughout the application
- **Focus Management** - Proper focus trapping in modals and dialogs

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Build Tool** | Vite 7 |
| **State Management** | Zustand |
| **Rendering Engine** | React Konva (Konva.js) |
| **Animation** | Framer Motion |
| **Styling** | Tailwind CSS |
| **Testing** | Vitest + React Testing Library |
| **Icons** | Lucide React |

## 📐 Architecture

### Application Structure

```
src/
├── components/
│   ├── canvas/          # Canvas rendering components
│   │   ├── Canvas.jsx        # Main canvas component with Konva Stage
│   │   ├── CanvasElement.jsx # Individual element renderer
│   │   ├── Grid.jsx          # Grid rendering component
│   │   ├── SelectionBox.jsx  # Selection bounding box
│   │   └── TextEditor.jsx    # Inline text editing overlay
│   ├── panels/          # UI panels
│   │   ├── TopToolbar.jsx      # Main toolbar with tools and actions
│   │   ├── LayersPanel.jsx     # Layers management panel
│   │   ├── PropertiesPanel.jsx # Properties inspector
│   │   └── FloatingToolbar.jsx # Context-aware floating toolbar
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   └── ...
├── store/
│   └── useCanvasStore.js     # Zustand store with state and actions
├── hooks/
│   ├── useFocusTrap.js       # Focus management for modals
│   ├── useKeyboardNavigation.js # Keyboard shortcut handling
│   └── use-mobile.js         # Mobile detection hook
├── constants/
│   └── index.js              # Design tokens and configuration
├── lib/
│   └── utils.js              # Utility functions
├── test/
│   ├── setup.js              # Test configuration and mocks
│   ├── TopToolbar.test.jsx   # Toolbar component tests
│   └── useCanvasStore.test.js # Store unit tests
├── App.jsx                   # Main application component
├── main.jsx                  # Application entry point
└── index.css                 # Global styles
```

### State Architecture

CanvasFlow uses a **Zustand** store with a normalized state structure for optimal performance:

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
                     │   (Undo/Redo)│    │   Re-render  │
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

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

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

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite HMR) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage report |

## ⌨️ Keyboard Shortcuts

### Tools
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

### Actions
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

### View
| Shortcut | Action |
|----------|--------|
| `Ctrl++` | Zoom In |
| `Ctrl+-` | Zoom Out |
| `Ctrl+0` | Reset Zoom |
| `Ctrl+1` | Center Canvas |
| `G` | Toggle Grid |
| `U` | Toggle Smart Guides |

### Layer Order
| Shortcut | Action |
|----------|--------|
| `Ctrl+]` | Bring to Front |
| `Ctrl+[` | Send to Back |
| `Ctrl+Shift+]` | Bring Forward |
| `Ctrl+Shift+[` | Send Backward |

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

- **Primary Font**: Inter (system font stack fallback)
- **Tool Labels**: 12-13px
- **Panel Content**: 14px
- **Headers**: 16-18px

### Spacing

Built on an 8px grid system:
- xs: 4px
- sm: 8px (base)
- md: 16px
- lg: 24px
- xl: 32px

### Border Radius

- sm: 4px
- md: 6px
- lg: 8px
- xl: 12px

## 🧪 Testing

CanvasFlow includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Store actions, selectors, and utilities
- **Component Tests**: UI components with React Testing Library
- **Integration Tests**: User workflows and interactions

## 📦 Build & Deployment

### Production Build

```bash
npm run build
npm run preview
```

### Deployment

CanvasFlow can be deployed to any static hosting service:

- **Vercel**: Automatic deployments from Git
- **Netlify**: Drag & drop or Git integration
- **GitHub Pages**: `gh-pages` branch deployment
- **Cloudflare Pages**: Git integration

## 🔧 Configuration

### Vite Configuration

Located in `vite.config.js`:
- Path aliases (`@/` → `src/`)
- Test configuration (Vitest)
- React plugin

### Tailwind Configuration

Located in `tailwind.config.js`:
- Custom color palette
- Design tokens
- Animation utilities

### ESLint Configuration

Located in `eslint.config.js`:
- React Hooks rules
- React Refresh rules
- Modern ESLint flat config

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**CanvasFlow** - A senior frontend engineering showcase project

## 🙏 Acknowledgments

- [React](https://react.dev/) - The library for web and native user interfaces
- [Konva](https://konvajs.org/) - 2D canvas library
- [Zustand](https://zustand-demo.pmnd.rs/) - Bear necessities for state management
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components

---

**Built with ❤️ using React + Vite + Konva**

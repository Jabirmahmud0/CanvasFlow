// CanvasFlow Constants & Design Tokens

// Color Palette
export const COLORS = {
  // Canvas Theme
  canvasBg: '#0F172A', // slate-900
  canvasGrid: '#1E293B', // slate-800
  
  // Surface Layers
  surfacePrimary: '#1E293B', // slate-800
  surfaceSecondary: '#334155', // slate-700
  surfaceTertiary: '#475569', // slate-600
  
  // Accent Colors
  accentPrimary: '#6366F1', // indigo-500
  accentHover: '#4F46E5', // indigo-600
  accentActive: '#4338CA', // indigo-700
  
  // Text Colors
  textPrimary: '#F8FAFC', // slate-50
  textSecondary: '#CBD5E1', // slate-300
  textMuted: '#64748B', // slate-500
  
  // Semantic Colors
  success: '#22C55E', // green-500
  warning: '#F59E0B', // amber-500
  error: '#EF4444', // red-500
  info: '#3B82F6', // blue-500
  
  // Selection
  selection: '#6366F1',
  selectionBorder: '#818CF8',
  
  // Smart Guides
  smartGuide: '#F59E0B',
};

// Preset Colors
export const PRESET_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#84CC16', // Lime
  '#0F172A', // Slate-900
  '#1E293B', // Slate-800
  '#334155', // Slate-700
  '#475569', // Slate-600
  '#94A3B8', // Slate-400
  '#F8FAFC', // Slate-50
];

// Gradient Presets
export const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
  'linear-gradient(135deg, #22C55E 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
];

// Spacing System (8px base)
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
    '5xl': '48px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// Border Radius
export const BORDER_RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
};

// Canvas Settings
export const CANVAS = {
  minZoom: 0.05, // 5%
  maxZoom: 5, // 500%
  defaultZoom: 1,
  zoomStep: 0.1,
  gridSize: 20,
  snapThreshold: 10,
};

// Tools
export const TOOLS = {
  SELECT: 'select',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TEXT: 'text',
  LINE: 'line',
  ARROW: 'arrow',
  STAR: 'star',
  POLYGON: 'polygon',
  PAN: 'pan',
  ERASER: 'eraser',
  LASSO: 'lasso',
  PEN: 'pen',
  BRUSH: 'brush',
};

// Tool configurations
export const TOOL_CONFIG = {
  [TOOLS.SELECT]: {
    name: 'Select',
    icon: 'MousePointer2',
    shortcut: 'V',
    cursor: 'default',
  },
  [TOOLS.RECTANGLE]: {
    name: 'Rectangle',
    icon: 'Square',
    shortcut: 'R',
    cursor: 'crosshair',
  },
  [TOOLS.CIRCLE]: {
    name: 'Circle',
    icon: 'Circle',
    shortcut: 'C',
    cursor: 'crosshair',
  },
  [TOOLS.TEXT]: {
    name: 'Text',
    icon: 'Type',
    shortcut: 'T',
    cursor: 'text',
  },
  [TOOLS.LINE]: {
    name: 'Line',
    icon: 'Minus',
    shortcut: 'L',
    cursor: 'crosshair',
  },
  [TOOLS.ARROW]: {
    name: 'Arrow',
    icon: 'ArrowRight',
    shortcut: 'A',
    cursor: 'crosshair',
  },
  [TOOLS.STAR]: {
    name: 'Star',
    icon: 'Star',
    shortcut: 'S',
    cursor: 'crosshair',
  },
  [TOOLS.POLYGON]: {
    name: 'Polygon',
    icon: 'Hexagon',
    shortcut: 'Shift+P',
    cursor: 'crosshair',
  },
  [TOOLS.PAN]: {
    name: 'Pan',
    icon: 'Hand',
    shortcut: 'H',
    cursor: 'grab',
  },
  [TOOLS.ERASER]: {
    name: 'Eraser',
    icon: 'Eraser',
    shortcut: 'E',
    cursor: 'crosshair',
  },
  [TOOLS.LASSO]: {
    name: 'Lasso',
    icon: 'LassoSelect',
    shortcut: 'Q',
    cursor: 'crosshair',
  },
  [TOOLS.PEN]: {
    name: 'Pen',
    icon: 'Pen',
    shortcut: 'P',
    cursor: 'crosshair',
  },
  [TOOLS.BRUSH]: {
    name: 'Brush',
    icon: 'Brush',
    shortcut: 'B',
    cursor: 'crosshair',
  },
};

// Element Types
export const ELEMENT_TYPES = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TEXT: 'text',
  LINE: 'line',
  ARROW: 'arrow',
  STAR: 'star',
  POLYGON: 'polygon',
  PEN: 'pen',
  BRUSH: 'brush',
};

// History
export const HISTORY = {
  maxSteps: 100,
};

// Keyboard Shortcuts
export const SHORTCUTS = {
  // Tools
  selectTool: { key: 'v' },
  rectangleTool: { key: 'r' },
  circleTool: { key: 'c' },
  textTool: { key: 't' },
  lineTool: { key: 'l' },
  arrowTool: { key: 'a' },
  starTool: { key: 's' },
  polygonTool: { key: 'p', shift: true },
  panTool: { key: 'h' },
  eraserTool: { key: 'e' },
  lassoTool: { key: 'q' },
  penTool: { key: 'p' },
  brushTool: { key: 'b' },
  
  // Actions
  undo: { key: 'z', ctrl: true },
  redo: { key: 'y', ctrl: true },
  delete: { key: 'Delete' },
  selectAll: { key: 'a', ctrl: true },
  deselectAll: { key: 'Escape' },
  duplicate: { key: 'd', ctrl: true },
  copy: { key: 'c', ctrl: true },
  cut: { key: 'x', ctrl: true },
  paste: { key: 'v', ctrl: true },
  
  // Zoom
  zoomIn: { key: '=', ctrl: true },
  zoomOut: { key: '-', ctrl: true },
  resetZoom: { key: '0', ctrl: true },
  fitToScreen: { key: '1', ctrl: true },
  
  // Layer
  bringToFront: { key: ']', ctrl: true },
  sendToBack: { key: '[', ctrl: true },
  bringForward: { key: ']', ctrl: true, shift: true },
  sendBackward: { key: '[', ctrl: true, shift: true },
  
  // View
  toggleGrid: { key: 'g' },
  toggleSnap: { key: 's' },
  toggleSmartGuides: { key: 'u' },
};

// Resize handles
export const RESIZE_HANDLES = [
  { position: 'nw', cursor: 'nw-resize' },
  { position: 'n', cursor: 'n-resize' },
  { position: 'ne', cursor: 'ne-resize' },
  { position: 'e', cursor: 'e-resize' },
  { position: 'se', cursor: 'se-resize' },
  { position: 's', cursor: 's-resize' },
  { position: 'sw', cursor: 'sw-resize' },
  { position: 'w', cursor: 'w-resize' },
];

// Default element properties
// Colors from ColorHunt - cohesive palette for dark canvas
export const DEFAULT_PROPERTIES = {
  rectangle: {
    fill: 'transparent',  // Coral Red - warm, attention-grabbing
    stroke: '#FF6B6B',
    strokeWidth: 2,
    cornerRadius: 0,
  },
  circle: {
    fill: 'transparent',  // Turquoise - calm, balanced
    stroke: '#4ECDC4',
    strokeWidth: 2,
  },
  text: {
    fill: '#F8FAFC',
    fontSize: 16,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 'normal',
    text: 'Double-click to edit',
  },
  line: {
    stroke: '#95A5A6',
    strokeWidth: 2,
  },
  arrow: {
    stroke: '#9B59B6',  // Purple - directional emphasis
    strokeWidth: 2,
    pointerLength: 10,
    pointerWidth: 10,
    fill: '#9B59B6',
  },
  star: {
    fill: '#F9CA24',  // Golden Yellow - standout accent
    stroke: '#F0B920',
    strokeWidth: 2,
    numPoints: 5,
    innerRadius: 20,
    outerRadius: 40,
  },
  polygon: {
    fill: '#6C5CE7',  // Soft Purple - geometric emphasis
    stroke: '#5B4CDB',
    strokeWidth: 2,
    sides: 6,
  },
  pen: {
    stroke: '#F8FAFC',
    strokeWidth: 2,
    opacity: 1,
    tension: 0.5,
  },
  brush: {
    stroke: '#6366F1',
    strokeWidth: 8,
    opacity: 0.6,
    tension: 0.6,
  },
};

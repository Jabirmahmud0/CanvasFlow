import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer2, Square, Circle, Type, Minus, ArrowRight,
  Star, Hexagon, Hand, Undo2, Redo2,
  Sun, Moon, Contrast, ZoomIn, ZoomOut,
  ChevronDown, Download, Upload, Trash2, Grid3X3,
  Magnet, ScanLine, Keyboard, PanelLeftOpen, PanelRightOpen,
  FileText, Eye, ExternalLink, Eraser, LassoSelect,
  Pen, Brush,
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useTheme } from '@/hooks/useTheme';
import { TOOLS, CANVAS } from '@/constants';
import { ToolButton } from '@/components/ui/Tooltip';

/* ─── Logo ─── */
const Logo = () => (
  <div className="flex items-center gap-2.5 select-none group px-1">
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Background Gradient Glow (Visible on Hover) */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/30 via-violet-500/30 to-fuchsia-500/30 blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 scale-110" />
      
      {/* Main Icon Container */}
      <div className="relative w-7.5 h-7.5 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-violet-600 shadow-lg shadow-primary/20 flex items-center justify-center overflow-hidden border border-white/10">
        {/* Glass highlight effect */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/20 rotate-45 transition-transform duration-700 group-hover:translate-x-full group-hover:translate-y-full" />
        
        {/* The Modern Palette SVG */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
          <path 
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" 
            fill="white" 
            fillOpacity="0.1" 
          />
          <path 
            d="M12 22C17.52 22 22 17.52 22 12H12V22Z" 
            fill="white" 
            fillOpacity="0.15" 
          />
          {/* Flow Swoosh */}
          <path 
            d="M4 12C4 12 7 8 12 8C17 8 20 12 20 12" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="drop-shadow-sm"
          />
          {/* Palette Paint Dots */}
          <circle cx="8" cy="16" r="1.5" fill="white" />
          <circle cx="12" cy="18" r="1.5" fill="white" fillOpacity="0.7" />
          <circle cx="16" cy="16" r="1.5" fill="white" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
    
    <div className="flex flex-col leading-tight cursor-default">
      <div className="flex items-center">
        <span className="text-[15px] font-extrabold tracking-tight text-foreground transition-all group-hover:text-primary">
          Canvas
        </span>
        <span className="text-primary font-black ml-0.5 text-[15px]">
          Flow
        </span>
      </div>
      <span className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-0.5 opacity-50 group-hover:opacity-80 transition-opacity">
        Creative Studio
      </span>
    </div>
  </div>
);

/* ─── Tool groups ─── */
const TOOL_GROUPS = [
  {
    id: 'select',
    tools: [
      { id: TOOLS.SELECT, icon: MousePointer2, label: 'Select', shortcut: 'V' },
      { id: TOOLS.LASSO,  icon: LassoSelect,   label: 'Lasso',  shortcut: 'Q' },
      { id: TOOLS.PAN,    icon: Hand,          label: 'Pan',    shortcut: 'H' },
      { id: TOOLS.ERASER, icon: Eraser,        label: "Eraser", shortcut: 'E' },
    ],
  },
  {
    id: 'drawing',
    tools: [
      { id: TOOLS.PEN,   icon: Pen,   label: 'Pen',   shortcut: 'P' },
      { id: TOOLS.BRUSH, icon: Brush, label: 'Brush', shortcut: 'B' },
    ],
  },
  {
    id: 'shapes',
    tools: [
      { id: TOOLS.RECTANGLE, icon: Square,       label: 'Rectangle', shortcut: 'R' },
      { id: TOOLS.CIRCLE,    icon: Circle,       label: 'Circle',    shortcut: 'C' },
      { id: TOOLS.STAR,      icon: Star,         label: 'Star',      shortcut: 'S' },
      { id: TOOLS.POLYGON,   icon: Hexagon,      label: 'Polygon',   shortcut: 'P' },
    ],
  },
  {
    id: 'connectors',
    tools: [
      { id: TOOLS.LINE,  icon: Minus,      label: 'Line',  shortcut: 'L' },
      { id: TOOLS.ARROW, icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
    ],
  },
  {
    id: 'text',
    tools: [
      { id: TOOLS.TEXT, icon: Type, label: 'Text', shortcut: 'T' },
    ],
  },
];

/* ─── Zoom Popover ─── */
const ZOOM_PRESETS = [
  { label: 'Fit to Screen', value: null },
  { label: '25%',  value: 0.25 },
  { label: '50%',  value: 0.50 },
  { label: '75%',  value: 0.75 },
  { label: '100%', value: 1.00 },
  { label: '150%', value: 1.50 },
  { label: '200%', value: 2.00 },
  { label: '400%', value: 4.00 },
];

const ZoomControl = ({ zoom, onZoomIn, onZoomOut, onSetZoom, onFitScreen }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const pct = Math.round(zoom * 100);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative flex items-center gap-0.5" ref={ref}>
      <button
        type="button"
        className="tool-btn !w-7 !h-7 !rounded-md"
        onClick={onZoomOut}
        aria-label="Zoom out"
      >
        <ZoomOut size={14} />
      </button>

      <button
        type="button"
        className="flex items-center gap-1 px-2.5 h-7 rounded-md text-xs font-mono font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors select-none"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {pct}%
        <ChevronDown size={10} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      <button
        type="button"
        className="tool-btn !w-7 !h-7 !rounded-md"
        onClick={onZoomIn}
        aria-label="Zoom in"
      >
        <ZoomIn size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full mt-2 right-0 z-50 glass rounded-xl shadow-2xl shadow-black/40 p-1 min-w-[140px]"
          >
            {ZOOM_PRESETS.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-accent transition-colors ${value === zoom ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                onClick={() => {
                  if (value === null) { onFitScreen(); } else { onSetZoom(value); }
                  setOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Theme Toggle ─── */
const THEME_META = {
  dark:          { icon: Moon,     label: 'Dark',            next: 'light' },
  light:         { icon: Sun,      label: 'Light',           next: 'high-contrast' },
  'high-contrast':{ icon: Contrast, label: 'High Contrast',  next: 'dark' },
};

const ThemeToggle = ({ theme, setTheme }) => {
  const meta = THEME_META[theme];
  const Icon = meta.icon;
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      className="tool-btn"
      onClick={() => setTheme(meta.next)}
      aria-label={`Switch to ${THEME_META[meta.next].label} theme`}
      title={`${meta.label} mode — click to switch`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0,   opacity: 1, scale: 1 }}
          exit={{   rotate: 30,  opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={17} strokeWidth={1.8} />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

/* ─── File Menu ─── */
const FileMenu = ({ onExport, onImport, onClear, onToggleShortcuts }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = [
    { icon: Upload,   label: 'Import JSON',       shortcut: '',        action: onImport },
    { icon: Download, label: 'Export JSON',        shortcut: '',        action: onExport },
    { type: 'sep' },
    { icon: Trash2,   label: 'Clear Canvas',       shortcut: '',        action: onClear,          danger: true },
    { type: 'sep' },
    { icon: Keyboard, label: 'Keyboard Shortcuts', shortcut: '?',       action: onToggleShortcuts },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-1 px-2.5 h-7 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <FileText size={13} />
        <span className="hidden sm:block">File</span>
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="context-menu absolute top-full mt-2 left-0 z-50"
            style={{ minWidth: 200 }}
          >
            {items.map((item, i) =>
              item.type === 'sep'
                ? <div key={i} className="context-menu-separator" />
                : (
                  <button
                    key={i}
                    type="button"
                    className={`context-menu-item w-full ${item.danger ? 'destructive' : ''}`}
                    onClick={() => { item.action?.(); setOpen(false); }}
                  >
                    <item.icon size={14} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
                  </button>
                )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── View Menu ─── */
const ViewMenu = ({ showGrid, snapToGrid, showSmartGuides, onToggleGrid, onToggleSnap, onToggleGuides }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = [
    { icon: Grid3X3,  label: 'Show Grid',         shortcut: 'G', active: showGrid,        action: onToggleGrid },
    { icon: Magnet,   label: 'Snap to Grid',       shortcut: '',  active: snapToGrid,       action: onToggleSnap },
    { icon: ScanLine, label: 'Smart Guides',        shortcut: 'U', active: showSmartGuides, action: onToggleGuides },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-1 px-2.5 h-7 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <Eye size={13} />
        <span className="hidden sm:block">View</span>
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="context-menu absolute top-full mt-2 left-0 z-50"
            style={{ minWidth: 200 }}
          >
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                className="context-menu-item w-full"
                onClick={() => { item.action?.(); setOpen(false); }}
              >
                <item.icon size={14} className={item.active ? 'text-primary' : ''} />
                <span className={`flex-1 text-left ${item.active ? 'text-foreground font-medium' : ''}`}>{item.label}</span>
                {item.active && (
                  <span className="w-2 h-2 rounded-full bg-primary ml-1 flex-shrink-0" />
                )}
                {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main TopToolbar ─── */
const TopToolbar = ({
  onToggleShortcuts,
  leftCollapsed,
  rightCollapsed,
  onToggleLeft,
  onToggleRight,
}) => {
  const {
    activeTool, setActiveTool,
    zoom, zoomIn, zoomOut, setZoom, centerCanvas,
    undo, redo, canUndo, canRedo,
    exportToJSON, importFromJSON, clearCanvas,
    showGrid, snapToGrid, showSmartGuides,
    toggleGrid, toggleSnapToGrid, toggleSmartGuides,
    drawingSettings, setDrawingSetting,
  } = useCanvasStore();

  const { theme, setTheme } = useTheme();

  const handleExport = useCallback(() => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvasflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportToJSON]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => importFromJSON(ev.target.result);
      reader.readAsText(file);
    };
    input.click();
  }, [importFromJSON]);

  const isUndoDisabled = !canUndo();
  const isRedoDisabled = !canRedo();

  return (
    <header className="flex items-center h-12 px-3 gap-2 border-b border-border bg-background/95 backdrop-blur-sm flex-shrink-0 z-40">
      {/* ── Left: Logo + Menus ── */}
      <div className="flex items-center gap-1 mr-1">
        {/* Sidebar toggle left */}
        <ToolButton
          icon={PanelLeftOpen}
          label={leftCollapsed ? 'Show Layers' : 'Hide Layers'}
          shortcut=""
          tooltipSide="bottom"
          onClick={onToggleLeft}
          className={`!w-7 !h-7 mr-1 ${leftCollapsed ? '' : 'active'}`}
        />
        <Logo />
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key="menus"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex items-center gap-0.5"
        >
          <FileMenu
            onExport={handleExport}
            onImport={handleImport}
            onClear={clearCanvas}
            onToggleShortcuts={onToggleShortcuts}
          />
          <ViewMenu
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            showSmartGuides={showSmartGuides}
            onToggleGrid={toggleGrid}
            onToggleSnap={toggleSnapToGrid}
            onToggleGuides={toggleSmartGuides}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Center: Tool Palette (Figma pill style) ── */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-0.5 px-1.5 py-1 bg-secondary/50 rounded-xl border border-border/50">
          {TOOL_GROUPS.map((group, gi) => (
            <React.Fragment key={group.id}>
              {gi > 0 && <div className="toolbar-separator mx-1" />}
              {group.tools.map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <motion.button
                    key={tool.id}
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`tool-btn relative ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTool(tool.id)}
                    aria-label={tool.label}
                    aria-pressed={isActive}
                    title={`${tool.label} (${tool.shortcut})`}
                  >
                    <tool.icon size={17} strokeWidth={isActive ? 2.2 : 1.7} />
                    {isActive && (
                      <motion.div
                        layoutId="tool-active-bg"
                        className="absolute inset-0 rounded-lg bg-primary/15 ring-1 ring-primary/30"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Right: History + Zoom + Theme + Sidebar ── */}
      <div className="flex items-center gap-1">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <ToolButton
            icon={Undo2}
            label="Undo"
            shortcut="Ctrl+Z"
            disabled={isUndoDisabled}
            onClick={undo}
          />
          <ToolButton
            icon={Redo2}
            label="Redo"
            shortcut="Ctrl+Y"
            disabled={isRedoDisabled}
            onClick={redo}
          />
        </div>

        <div className="toolbar-separator" />

        {/* Zoom */}
        <ZoomControl
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onSetZoom={setZoom}
          onFitScreen={centerCanvas}
        />

        <div className="toolbar-separator" />

        {/* Theme */}
        <ThemeToggle theme={theme} setTheme={setTheme} />

        <div className="toolbar-separator" />

        {/* Right sidebar toggle */}
        <ToolButton
          icon={PanelRightOpen}
          label={rightCollapsed ? 'Show Properties' : 'Hide Properties'}
          tooltipSide="bottom"
          onClick={onToggleRight}
          className={`!w-7 !h-7 ${rightCollapsed ? '' : 'active'}`}
        />
      </div>
    </header>
  );
};

export default TopToolbar;

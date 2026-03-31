import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Hand,
  Minus,
  ArrowRight,
  Star,
  Hexagon,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Magnet,
  Undo2,
  Redo2,
  Download,
  Upload,
  Trash2,
  FilePlus,
  ChevronDown,
  Settings,
  Layers,
  Target,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useTheme } from '@/hooks/useTheme';
import { TOOLS, TOOL_CONFIG, COLORS } from '@/constants';
import Portal from '@/components/ui/Portal';

const ToolButton = ({ tool, activeTool, onClick, icon: Icon, label, shortcut }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onClick(tool)}
    className={`
      relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
      ${activeTool === tool
        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
      }
    `}
    title={`${label} (${shortcut})`}
    aria-label={label}
    aria-pressed={activeTool === tool}
    aria-keyshortcuts={shortcut}
  >
    <Icon size={18} aria-hidden="true" />
    <span className="text-xs font-medium hidden lg:block">{label}</span>
  </motion.button>
);

const ActionButton = ({ onClick, icon: Icon, label, disabled, shortcut, variant = 'default' }) => {
  const baseClasses = 'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200';
  const variantClasses = {
    default: disabled
      ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white',
    danger: disabled
      ? 'bg-red-500/10 text-red-600/50 cursor-not-allowed'
      : 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
    primary: 'bg-indigo-500 text-white hover:bg-indigo-600',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={`${label} (${shortcut})`}
      aria-label={label}
      aria-disabled={disabled}
      aria-keyshortcuts={shortcut}
    >
      <Icon size={16} aria-hidden="true" />
    </motion.button>
  );
};

const TopToolbar = ({ onConfirmLoadSamples, onConfirmClear }) => {
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [menuPositions, setMenuPositions] = useState({});

  const fileMenuRef = useRef(null);
  const viewMenuRef = useRef(null);
  const themeMenuRef = useRef(null);

  const { theme, setTheme } = useTheme();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) {
        setShowFileMenu(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target)) {
        setShowViewMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setShowThemeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle functions
  const toggleFileMenu = () => {
    setShowFileMenu(prev => !prev);
    setShowViewMenu(false);
    setShowThemeMenu(false);
  };

  const toggleViewMenu = () => {
    setShowViewMenu(prev => !prev);
    setShowFileMenu(false);
    setShowThemeMenu(false);
  };

  const toggleThemeMenu = () => {
    setShowThemeMenu(prev => !prev);
    setShowFileMenu(false);
    setShowViewMenu(false);
  };

  // Calculate menu positions when opened
  useEffect(() => {
    if (showFileMenu && fileMenuRef.current) {
      const rect = fileMenuRef.current.getBoundingClientRect();
      setMenuPositions(prev => ({ ...prev, file: { top: rect.bottom, left: rect.left } }));
    }
    if (showViewMenu && viewMenuRef.current) {
      const rect = viewMenuRef.current.getBoundingClientRect();
      setMenuPositions(prev => ({ ...prev, view: { top: rect.bottom, left: rect.left } }));
    }
    if (showThemeMenu && themeMenuRef.current) {
      const rect = themeMenuRef.current.getBoundingClientRect();
      setMenuPositions(prev => ({ ...prev, theme: { top: rect.bottom, right: window.innerWidth - rect.right } }));
    }
  }, [showFileMenu, showViewMenu, showThemeMenu]);
  
  const {
    activeTool,
    zoom,
    showGrid,
    snapToGrid,
    showSmartGuides,
    setActiveTool,
    zoomIn,
    zoomOut,
    resetZoom,
    centerCanvas,
    toggleGrid,
    toggleSnapToGrid,
    toggleSmartGuides,
    undo,
    redo,
    canUndo,
    canRedo,
    clearCanvas,
    exportToJSON,
    importFromJSON,
    initializeWithSamples,
  } = useCanvasStore();

  const tools = [
    { tool: TOOLS.SELECT, icon: MousePointer2, label: 'Select', shortcut: 'V' },
    { tool: TOOLS.RECTANGLE, icon: Square, label: 'Rectangle', shortcut: 'R' },
    { tool: TOOLS.CIRCLE, icon: Circle, label: 'Circle', shortcut: 'C' },
    { tool: TOOLS.TEXT, icon: Type, label: 'Text', shortcut: 'T' },
    { tool: TOOLS.LINE, icon: Minus, label: 'Line', shortcut: 'L' },
    { tool: TOOLS.ARROW, icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
    { tool: TOOLS.STAR, icon: Star, label: 'Star', shortcut: 'S' },
    { tool: TOOLS.POLYGON, icon: Hexagon, label: 'Polygon', shortcut: 'P' },
    { tool: TOOLS.PAN, icon: Hand, label: 'Pan', shortcut: 'H' },
  ];

  const handleExport = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvasflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowFileMenu(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          importFromJSON(event.target.result);
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setShowFileMenu(false);
  };

  const handleLoadSamples = () => {
    onConfirmLoadSamples();
    setShowFileMenu(false);
  };

  const handleClear = () => {
    onConfirmClear();
    setShowFileMenu(false);
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-4 py-3 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800"
      role="toolbar"
      aria-label="CanvasFlow main toolbar"
    >
      {/* Left - Logo & File Menu */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold text-white">CanvasFlow</span>
        </div>

        {/* File Menu */}
        <div className="relative">
          <button
            ref={fileMenuRef}
            onClick={toggleFileMenu}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            aria-label="File menu"
            aria-expanded={showFileMenu}
            aria-haspopup="menu"
          >
            File
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          <AnimatePresence>
            {showFileMenu && menuPositions.file && (
              <Portal>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ position: 'fixed', top: menuPositions.file.top, left: menuPositions.file.left }}
                  className="w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-[9999] py-1"
                  role="menu"
                >
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  role="menuitem"
                >
                  <Download size={16} aria-hidden="true" />
                  Export JSON
                </button>
                <button
                  onClick={handleImport}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  role="menuitem"
                >
                  <Upload size={16} aria-hidden="true" />
                  Import JSON
                </button>
                <button
                  onClick={handleLoadSamples}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  role="menuitem"
                >
                  <FilePlus size={16} aria-hidden="true" />
                  Load Sample Data
                </button>
                <div className="border-t border-slate-700 my-1" role="separator" />
                <button
                  onClick={handleClear}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  role="menuitem"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Clear Canvas
                </button>
              </motion.div>
            </Portal>
            )}
          </AnimatePresence>
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            ref={viewMenuRef}
            onClick={toggleViewMenu}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            aria-label="View menu"
            aria-expanded={showViewMenu}
            aria-haspopup="menu"
          >
            View
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          <AnimatePresence>
            {showViewMenu && menuPositions.view && (
              <Portal>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ position: 'fixed', top: menuPositions.view.top, left: menuPositions.view.left }}
                  className="w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-[9999] py-1"
                  role="menu"
                >
                <button
                  onClick={() => { toggleGrid(); setShowViewMenu(false); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  role="menuitem"
                >
                  <span className="flex items-center gap-3">
                    <Grid3X3 size={16} aria-hidden="true" />
                    Show Grid
                  </span>
                  {showGrid && <span className="text-indigo-400" aria-label="enabled">✓</span>}
                </button>
                <button
                  onClick={() => { toggleSnapToGrid(); setShowViewMenu(false); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  role="menuitem"
                >
                  <span className="flex items-center gap-3">
                    <Magnet size={16} aria-hidden="true" />
                    Snap to Grid
                  </span>
                  {snapToGrid && <span className="text-indigo-400" aria-label="enabled">✓</span>}
                </button>
                <button
                  onClick={() => { toggleSmartGuides(); setShowViewMenu(false); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  role="menuitem"
                >
                  <span className="flex items-center gap-3">
                    <Target size={16} aria-hidden="true" />
                    Smart Guides
                  </span>
                  {showSmartGuides && <span className="text-indigo-400" aria-label="enabled">✓</span>}
                </button>
                <div className="border-t border-slate-700 my-1" role="separator" />
                <button
                  onClick={() => { centerCanvas(); setShowViewMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  role="menuitem"
                >
                  <Settings size={16} aria-hidden="true" />
                  Center Canvas
                </button>
              </motion.div>
            </Portal>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Center - Tools */}
      <div className="flex items-center gap-1 p-1.5 bg-slate-800/50 rounded-xl">
        {tools.map(({ tool, icon, label, shortcut }) => (
          <ToolButton
            key={tool}
            tool={tool}
            activeTool={activeTool}
            onClick={setActiveTool}
            icon={icon}
            label={label}
            shortcut={shortcut}
          />
        ))}
      </div>

      {/* Right - Zoom & Actions */}
      <div className="flex items-center gap-3">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1" role="group" aria-label="Zoom controls">
          <ActionButton
            onClick={zoomOut}
            icon={ZoomOut}
            label="Zoom Out"
            shortcut="Ctrl+-"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetZoom}
            className="px-3 py-2 text-slate-300 hover:text-white transition-colors min-w-[70px] text-center"
            aria-label={`Reset zoom to 100%, current zoom is ${Math.round(zoom * 100)}%`}
          >
            <span className="text-sm font-medium tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
          </motion.button>
          <ActionButton
            onClick={zoomIn}
            icon={ZoomIn}
            label="Zoom In"
            shortcut="Ctrl++"
          />
        </div>

        <div className="w-px h-8 bg-slate-700" role="separator" aria-hidden="true" />
        
        {/* Theme Menu */}
        <div className="relative">
          <button
            ref={themeMenuRef}
            onClick={toggleThemeMenu}
            className="flex items-center justify-center p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Theme Settings"
            aria-label="Theme settings"
          >
            {theme === 'light' ? <Sun size={18} /> : theme === 'high-contrast' ? <Palette size={18} /> : <Moon size={18} />}
          </button>
          <AnimatePresence>
            {showThemeMenu && menuPositions.theme && (
              <Portal>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{ position: 'fixed', top: menuPositions.theme.top, right: menuPositions.theme.right }}
                  className="w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-[9999] py-1"
                  role="menu"
                >
                <button
                  onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${theme === 'dark' ? 'text-indigo-400 bg-slate-700/50' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                  role="menuitem"
                >
                  <span className="flex items-center gap-2"><Moon size={14} /> Dark</span>
                  {theme === 'dark' && <span>✓</span>}
                </button>
                <button
                  onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${theme === 'light' ? 'text-indigo-400 bg-slate-700/50' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                  role="menuitem"
                >
                  <span className="flex items-center gap-2"><Sun size={14} /> Light</span>
                  {theme === 'light' && <span>✓</span>}
                </button>
                <button
                  onClick={() => { setTheme('high-contrast'); setShowThemeMenu(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${theme === 'high-contrast' ? 'text-indigo-400 bg-slate-700/50' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                  role="menuitem"
                >
                  <span className="flex items-center gap-2"><Palette size={14} /> High Contrast</span>
                  {theme === 'high-contrast' && <span>✓</span>}
                </button>
              </motion.div>
            </Portal>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-8 bg-slate-700" role="separator" aria-hidden="true" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1" role="group" aria-label="History controls">
          <ActionButton
            onClick={undo}
            icon={Undo2}
            label="Undo"
            disabled={!canUndo()}
            shortcut="Ctrl+Z"
          />
          <ActionButton
            onClick={redo}
            icon={Redo2}
            label="Redo"
            disabled={!canRedo()}
            shortcut="Ctrl+Y"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TopToolbar;

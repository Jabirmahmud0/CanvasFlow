import React, { useEffect, useRef, useState, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '@/store/useCanvasStore';
import { TOOLS, SHORTCUTS } from '@/constants';
import TopToolbar from '@/components/panels/TopToolbar';
import Canvas from '@/components/canvas/Canvas';
import { PWAUpdatePrompt } from '@/components/ui/PWAUpdatePrompt';
import './App.css';

const LeftSidebar = lazy(() => import('@/components/panels/LeftSidebar'));
const PropertiesPanel = lazy(() => import('@/components/panels/PropertiesPanel'));
const FloatingToolbar = lazy(() => import('@/components/panels/FloatingToolbar'));

// Context Menu Component
const ContextMenu = ({ x, y, onClose, items }) => {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ left: x, top: y }}
      className="fixed z-50 min-w-[160px] bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1"
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.divider ? (
            <div className="border-t border-slate-700 my-1" />
          ) : (
            <button
              onClick={() => { item.onClick(); onClose(); }}
              disabled={item.disabled}
              className={`
                w-full flex items-center justify-between px-4 py-2 text-sm transition-colors
                ${item.disabled 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
                ${item.danger ? 'text-red-400 hover:bg-red-500/10' : ''}
              `}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
              {item.shortcut && (
                <span className="text-xs text-slate-500">{item.shortcut}</span>
              )}
            </button>
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

// Toast Notification
const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    info: 'bg-slate-800 border-slate-700 text-slate-200',
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    warning: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg border ${colors[type]} shadow-xl z-50`}
    >
      {message}
    </motion.div>
  );
};

function App() {
  const canvasContainerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const {
    initialize,
    activeTool,
    setActiveTool,
    undo,
    redo,
    deleteSelected,
    selectAll,
    deselectAll,
    duplicateSelected,
    copy,
    cut,
    paste,
    canUndo,
    canRedo,
    zoomIn,
    zoomOut,
    resetZoom,
    centerCanvas,
    toggleGrid,
    toggleSnapToGrid,
    toggleSmartGuides,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    selectedIds,
    elements,
  } = useCanvasStore();

  // Show toast helper
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  // Initialize canvas with empty state
  useEffect(() => {
    initialize();
    showToast('Welcome to CanvasFlow! Press ? for keyboard shortcuts', 'info');
  }, [initialize, showToast]);

  // Update canvas size
  useEffect(() => {
    const updateSize = () => {
      if (canvasContainerRef.current) {
        const { width, height } = canvasContainerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    const { key, ctrlKey, shiftKey, metaKey, altKey } = e;
    const isCtrl = ctrlKey || metaKey;

    // Space key for temporary pan (hold to pan)
    if (key === ' ' && !isCtrl && !shiftKey && !altKey) {
      e.preventDefault();
      const previousTool = useCanvasStore.getState().activeTool;
      if (previousTool !== TOOLS.PAN) {
        // Store previous tool and switch to pan
        window._previousTool = previousTool;
        setActiveTool(TOOLS.PAN);
      }
      return;
    }

    // Help
    if (key === '?') {
      setShowShortcuts(true);
      return;
    }

    // Tool shortcuts (single key, no modifiers)
    if (!isCtrl && !shiftKey && !altKey) {
      switch (key.toLowerCase()) {
        case 'v':
          setActiveTool(TOOLS.SELECT);
          return;
        case 'r':
          setActiveTool(TOOLS.RECTANGLE);
          return;
        case 'c':
          setActiveTool(TOOLS.CIRCLE);
          return;
        case 't':
          setActiveTool(TOOLS.TEXT);
          return;
        case 'l':
          setActiveTool(TOOLS.LINE);
          return;
        case 'a':
          setActiveTool(TOOLS.ARROW);
          return;
        case 's':
          if (!isCtrl) {
            setActiveTool(TOOLS.STAR);
            return;
          }
          break;
        case 'p':
          setActiveTool(TOOLS.POLYGON);
          return;
        case 'h':
          setActiveTool(TOOLS.PAN);
          return;
        case 'g':
          toggleGrid();
          showToast(`Grid ${!useCanvasStore.getState().showGrid ? 'shown' : 'hidden'}`, 'info');
          return;
        case 'u':
          toggleSmartGuides();
          showToast(`Smart guides ${!useCanvasStore.getState().showSmartGuides ? 'enabled' : 'disabled'}`, 'info');
          return;
      }
    }

    // Action shortcuts with Ctrl
    if (isCtrl) {
      switch (key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          if (shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        case 'y':
          e.preventDefault();
          redo();
          return;
        case 'a':
          e.preventDefault();
          selectAll();
          return;
        case 'd':
          e.preventDefault();
          duplicateSelected();
          showToast('Duplicated', 'success');
          return;
        case 'c':
          e.preventDefault();
          copy();
          showToast('Copied to clipboard', 'success');
          return;
        case 'x':
          e.preventDefault();
          cut();
          showToast('Cut to clipboard', 'success');
          return;
        case 'v':
          e.preventDefault();
          paste();
          showToast('Pasted', 'success');
          return;
        case '=':
        case '+':
          e.preventDefault();
          zoomIn();
          return;
        case '-':
          e.preventDefault();
          zoomOut();
          return;
        case '0':
          e.preventDefault();
          resetZoom();
          showToast('Zoom reset', 'info');
          return;
        case '1':
          e.preventDefault();
          centerCanvas();
          showToast('Canvas centered', 'info');
          return;
        case ']':
          e.preventDefault();
          if (shiftKey) {
            bringForward();
          } else {
            bringToFront();
          }
          return;
        case '[':
          e.preventDefault();
          if (shiftKey) {
            sendBackward();
          } else {
            sendToBack();
          }
          return;
      }
    }

    // Delete
    if (key === 'Delete' || key === 'Backspace') {
      if (selectedIds.length > 0) {
        deleteSelected();
        showToast('Deleted', 'info');
      }
      return;
    }

    // Escape - clear selection and reset tool
    if (key === 'Escape') {
      deselectAll();
      setActiveTool(TOOLS.SELECT);
      return;
    }
  }, [
    setActiveTool,
    undo,
    redo,
    deleteSelected,
    selectAll,
    deselectAll,
    duplicateSelected,
    copy,
    cut,
    paste,
    zoomIn,
    zoomOut,
    resetZoom,
    centerCanvas,
    toggleGrid,
    toggleSmartGuides,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    selectedIds,
    showToast,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle space key release - restore previous tool
  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === ' ' && window._previousTool) {
        // Restore previous tool when space is released
        setActiveTool(window._previousTool);
        window._previousTool = null;
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [setActiveTool]);

  // Handle context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // Context menu items
  const contextMenuItems = [
    { 
      label: 'Undo', 
      onClick: undo, 
      shortcut: 'Ctrl+Z',
      disabled: !canUndo(),
      icon: <span>↩</span>
    },
    { 
      label: 'Redo', 
      onClick: redo, 
      shortcut: 'Ctrl+Y',
      disabled: !canRedo(),
      icon: <span>↪</span>
    },
    { divider: true },
    { 
      label: 'Cut', 
      onClick: cut, 
      shortcut: 'Ctrl+X',
      disabled: selectedIds.length === 0,
      icon: <span>✂</span>
    },
    { 
      label: 'Copy', 
      onClick: copy, 
      shortcut: 'Ctrl+C',
      disabled: selectedIds.length === 0,
      icon: <span>📋</span>
    },
    { 
      label: 'Paste', 
      onClick: paste, 
      shortcut: 'Ctrl+V',
      disabled: false,
      icon: <span>📄</span>
    },
    { divider: true },
    { 
      label: 'Select All', 
      onClick: selectAll, 
      shortcut: 'Ctrl+A',
      icon: <span>☐</span>
    },
    { 
      label: 'Deselect', 
      onClick: deselectAll, 
      shortcut: 'Esc',
      disabled: selectedIds.length === 0,
      icon: <span>⊘</span>
    },
    { divider: true },
    { 
      label: 'Delete', 
      onClick: deleteSelected, 
      shortcut: 'Del',
      disabled: selectedIds.length === 0,
      danger: true,
      icon: <span>🗑</span>
    },
  ];

  // Keyboard shortcuts help
  const shortcutsList = [
    { category: 'Tools', shortcuts: [
      { key: 'V', action: 'Select' },
      { key: 'R', action: 'Rectangle' },
      { key: 'C', action: 'Circle' },
      { key: 'T', action: 'Text' },
      { key: 'L', action: 'Line' },
      { key: 'A', action: 'Arrow' },
      { key: 'S', action: 'Star' },
      { key: 'P', action: 'Polygon' },
      { key: 'H', action: 'Pan' },
      { key: 'Space (hold)', action: 'Temporary Pan' },
    ]},
    { category: 'Actions', shortcuts: [
      { key: 'Ctrl+Z', action: 'Undo' },
      { key: 'Ctrl+Y', action: 'Redo' },
      { key: 'Ctrl+D', action: 'Duplicate' },
      { key: 'Ctrl+C', action: 'Copy' },
      { key: 'Ctrl+X', action: 'Cut' },
      { key: 'Ctrl+V', action: 'Paste' },
      { key: 'Delete', action: 'Delete' },
      { key: 'Ctrl+A', action: 'Select All' },
      { key: 'Esc', action: 'Deselect' },
    ]},
    { category: 'View', shortcuts: [
      { key: 'Ctrl++', action: 'Zoom In' },
      { key: 'Ctrl+-', action: 'Zoom Out' },
      { key: 'Ctrl+0', action: 'Reset Zoom' },
      { key: 'Ctrl+1', action: 'Center Canvas' },
      { key: 'G', action: 'Toggle Grid' },
      { key: 'U', action: 'Toggle Smart Guides' },
    ]},
    { category: 'Layer', shortcuts: [
      { key: 'Ctrl+]', action: 'Bring to Front' },
      { key: 'Ctrl+[', action: 'Send to Back' },
      { key: 'Ctrl+Shift+]', action: 'Bring Forward' },
      { key: 'Ctrl+Shift+[', action: 'Send Backward' },
    ]},
  ];

  return (
    <div 
      className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden"
      onContextMenu={handleContextMenu}
    >
      {/* Top Toolbar */}
      <TopToolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Layers & Assets */}
        <Suspense fallback={<div className="w-72 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 flex flex-col relative z-10" />}>
          <LeftSidebar />
        </Suspense>

        {/* Canvas Area */}
        <div 
          ref={canvasContainerRef}
          className="flex-1 relative bg-slate-900 overflow-hidden"
        >
          <Canvas 
            width={canvasSize.width} 
            height={canvasSize.height} 
          />
          
          {/* Floating Toolbar */}
          <Suspense fallback={null}>
            <FloatingToolbar />
          </Suspense>

          {/* Status Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-0 left-0 right-0 h-8 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 flex items-center justify-between px-4 text-xs text-slate-500"
          >
            <div className="flex items-center gap-4">
              <span className="font-medium text-slate-400">CanvasFlow</span>
              <span className="text-slate-700">|</span>
              <span>{elements.length} elements</span>
              {selectedIds.length > 0 && (
                <>
                  <span className="text-slate-700">|</span>
                  <span className="text-indigo-400">{selectedIds.length} selected</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>Hold Space to Pan</span>
              <span>Scroll to Zoom</span>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => setShowShortcuts(true)}
                className="hover:text-slate-300 transition-colors"
              >
                Press ? for shortcuts
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Properties */}
        <Suspense fallback={<div className="w-72 bg-slate-900/95 backdrop-blur-sm border-l border-slate-800" />}>
          <PropertiesPanel />
        </Suspense>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            items={contextMenuItems}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-8">
                {shortcutsList.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.shortcuts.map((shortcut) => (
                        <div key={shortcut.key} className="flex items-center justify-between">
                          <span className="text-slate-300">{shortcut.action}</span>
                          <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 font-mono">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Update Prompt */}
      <PWAUpdatePrompt />
    </div>
  );
}

export default App;

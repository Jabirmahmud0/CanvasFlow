import React, { useEffect, useRef, useState, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Undo2, Redo2, Copy, Scissors, Clipboard, Trash2,
  MousePointer2, Square as SquareIcon, X, Keyboard,
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useTheme } from '@/hooks/useTheme';
import { TOOLS } from '@/constants';
import TopToolbar from '@/components/panels/TopToolbar';
import Canvas from '@/components/canvas/Canvas';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Toaster, toast } from 'sonner';
import './App.css';

const LeftSidebar  = lazy(() => import('@/components/panels/LeftSidebar'));
const PropertiesPanel = lazy(() => import('@/components/panels/PropertiesPanel'));
const FloatingToolbar = lazy(() => import('@/components/panels/FloatingToolbar'));
const PWAUpdatePrompt = lazy(() => import('@/components/ui/PWAUpdatePrompt').then(m => ({ default: m.PWAUpdatePrompt })));

/* ─── Context Menu ─── */
const ContextMenu = ({ x, y, onClose, items }) => {
  useEffect(() => {
    const h = () => onClose();
    document.addEventListener('click', h);
    document.addEventListener('contextmenu', h);
    return () => { document.removeEventListener('click', h); document.removeEventListener('contextmenu', h); };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.1 }}
      style={{ left: Math.min(x, window.innerWidth - 210), top: Math.min(y, window.innerHeight - 320) }}
      className="context-menu fixed"
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="context-menu-separator" />
        ) : (
          <button
            key={i}
            type="button"
            disabled={item.disabled}
            className={`context-menu-item w-full ${item.danger ? 'destructive' : ''} ${item.disabled ? 'opacity-40 pointer-events-none' : ''}`}
            onClick={() => { item.onClick(); onClose(); }}
          >
            {item.icon && React.isValidElement(item.icon) ? item.icon : null}
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
          </button>
        )
      )}
    </motion.div>
  );
};


/* ─── Shortcuts Modal ─── */
const SHORTCUT_GROUPS = [
  { category: 'Tools', items: [
    { key: 'V',          action: 'Select' },
    { key: 'E',          action: 'Eraser' },
    { key: 'R',          action: 'Rectangle' },
    { key: 'C',          action: 'Circle' },
    { key: 'T',          action: 'Text' },
    { key: 'L',          action: 'Line' },
    { key: 'A',          action: 'Arrow' },
    { key: 'S',          action: 'Star' },
    { key: 'P',          action: 'Polygon' },
    { key: 'H',          action: 'Pan' },
    { key: 'Space ↓',   action: 'Temporary Pan' },
  ]},
  { category: 'Actions', items: [
    { key: 'Ctrl+Z',     action: 'Undo' },
    { key: 'Ctrl+Shift+Z', action: 'Redo' },
    { key: 'Ctrl+D',     action: 'Duplicate' },
    { key: 'Ctrl+C',     action: 'Copy' },
    { key: 'Ctrl+X',     action: 'Cut' },
    { key: 'Ctrl+V',     action: 'Paste' },
    { key: 'Del',        action: 'Delete' },
    { key: 'Ctrl+A',     action: 'Select All' },
    { key: 'Esc',        action: 'Deselect' },
  ]},
  { category: 'View', items: [
    { key: 'Ctrl++',     action: 'Zoom In' },
    { key: 'Ctrl+-',     action: 'Zoom Out' },
    { key: 'Ctrl+0',     action: 'Reset Zoom' },
    { key: 'Ctrl+1',     action: 'Fit to Screen' },
    { key: 'G',          action: 'Toggle Grid' },
    { key: 'U',          action: 'Toggle Guides' },
    { key: '?',          action: 'Show Shortcuts' },
  ]},
  { category: 'Layer', items: [
    { key: 'Ctrl+]',     action: 'Bring to Front' },
    { key: 'Ctrl+[',     action: 'Send to Back' },
    { key: 'Ctrl+⇧+]',  action: 'Bring Forward' },
    { key: 'Ctrl+⇧+[',  action: 'Send Backward' },
  ]},
];

const ShortcutsModal = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.93, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.93, opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      className="bg-[hsl(var(--surface-elevated))] border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border bg-[hsl(var(--surface-elevated))] z-10">
        <div className="flex items-center gap-2">
          <Keyboard size={16} className="text-primary" />
          <h2 className="text-base font-semibold text-foreground">Keyboard Shortcuts</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="tool-btn !w-7 !h-7 !rounded-md opacity-50 hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>

      {/* Grid of shortcut groups */}
      <div className="p-6 grid grid-cols-2 gap-6">
        {SHORTCUT_GROUPS.map(({ category, items }) => (
          <div key={category}>
            <p className="panel-section-header mb-3">{category}</p>
            <div className="flex flex-col gap-1.5">
              {items.map(({ key, action }) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{action}</span>
                  <kbd>{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

/* ─── Status Bar ─── */
const StatusBar = ({ onShowShortcuts }) => {
  const { elements, selectedIds, zoom } = useCanvasStore();
  return (
    <div className="status-bar">
      <div className="flex items-center gap-1.5">
        <span className="status-badge">
          {elements.length} layer{elements.length !== 1 ? 's' : ''}
        </span>
        {selectedIds.length > 0 && (
          <span className="status-badge accent">
            {selectedIds.length} selected
          </span>
        )}
      </div>
      <div className="flex-1" />
      <button
        type="button"
        title="Keyboard Shortcuts"
        className="tool-btn !w-6 !h-6 !rounded opacity-40 hover:opacity-100 transition-opacity ml-2"
        onClick={onShowShortcuts}
      >
        <Keyboard size={12} />
      </button>
    </div>
  );
};

/* ─── App ─── */
function App() {
  const canvasContainerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const {
    initialize, activeTool, setActiveTool,
    undo, redo, deleteSelected, selectAll, clearSelection,
    duplicateSelected, copy, cut, paste,
    canUndo, canRedo, zoomIn, zoomOut, resetZoom, centerCanvas,
    toggleGrid, toggleSnapToGrid, toggleSmartGuides,
    bringToFront, sendToBack, bringForward, sendBackward,
    selectedIds, elements,
  } = useCanvasStore();

  const showToast = useCallback((message, type = 'info') => {
    toast[type] ? toast[type](message) : toast(message);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Canvas container resize observer
  useEffect(() => {
    const update = () => {
      if (canvasContainerRef.current) {
        const { width, height } = canvasContainerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (canvasContainerRef.current) ro.observe(canvasContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    const { key, ctrlKey, shiftKey, metaKey } = e;
    const isCtrl = ctrlKey || metaKey;

    if (key === ' ' && !isCtrl && !shiftKey) {
      e.preventDefault();
      const prev = useCanvasStore.getState().activeTool;
      if (prev !== TOOLS.PAN) { window._previousTool = prev; setActiveTool(TOOLS.PAN); }
      return;
    }
    if (key === '?') { setShowShortcuts(true); return; }

    if (!isCtrl && !shiftKey) {
      const toolMap = { 
        v: TOOLS.SELECT, 
        e: TOOLS.ERASER, 
        r: TOOLS.RECTANGLE, 
        c: TOOLS.CIRCLE, 
        t: TOOLS.TEXT, 
        l: TOOLS.LINE, 
        a: TOOLS.ARROW, 
        s: TOOLS.STAR, 
        p: TOOLS.POLYGON, 
        h: TOOLS.PAN 
      };
      if (toolMap[key.toLowerCase()]) { setActiveTool(toolMap[key.toLowerCase()]); return; }
      if (key.toLowerCase() === 'g') { toggleGrid(); return; }
      if (key.toLowerCase() === 'u') { toggleSmartGuides(); return; }
    }

    if (isCtrl) {
      e.preventDefault();
      switch (key.toLowerCase()) {
        case 'z': shiftKey ? redo() : undo(); return;
        case 'y': redo(); return;
        case 'a': selectAll(); return;
        case 'd': duplicateSelected(); showToast('Duplicated', 'success'); return;
        case 'c': copy(); showToast('Copied', 'success'); return;
        case 'x': cut(); showToast('Cut', 'success'); return;
        case 'v': paste(); showToast('Pasted', 'success'); return;
        case '=': case '+': zoomIn(); return;
        case '-': zoomOut(); return;
        case '0': resetZoom(); return;
        case '1': centerCanvas(); return;
        case ']': shiftKey ? bringForward() : bringToFront(); return;
        case '[': shiftKey ? sendBackward() : sendToBack(); return;
      }
    }

    if (key === 'Delete' || key === 'Backspace') {
      if (selectedIds.length > 0) { deleteSelected(); showToast('Deleted', 'info'); }
      return;
    }
    if (key === 'Escape') { clearSelection(); setActiveTool(TOOLS.SELECT); }
  }, [setActiveTool, undo, redo, deleteSelected, selectAll, clearSelection, duplicateSelected, copy, cut, paste, zoomIn, zoomOut, resetZoom, centerCanvas, toggleGrid, toggleSmartGuides, bringToFront, sendToBack, bringForward, sendBackward, selectedIds, showToast]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const up = (e) => {
      if (e.key === ' ' && window._previousTool) { setActiveTool(window._previousTool); window._previousTool = null; }
    };
    window.addEventListener('keyup', up);
    return () => window.removeEventListener('keyup', up);
  }, [setActiveTool]);

  // Context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const contextMenuItems = [
    { icon: <Undo2 size={13} />, label: 'Undo',       shortcut: 'Ctrl+Z', onClick: undo,          disabled: !canUndo() },
    { icon: <Undo2 size={13} className="scale-x-[-1]" />, label: 'Redo', shortcut: 'Ctrl+Y', onClick: redo, disabled: !canRedo() },
    { divider: true },
    { icon: <Scissors size={13} />,    label: 'Cut',         shortcut: 'Ctrl+X', onClick: cut,    disabled: selectedIds.length === 0 },
    { icon: <Copy size={13} />,        label: 'Copy',        shortcut: 'Ctrl+C', onClick: copy,   disabled: selectedIds.length === 0 },
    { icon: <Clipboard size={13} />,   label: 'Paste',       shortcut: 'Ctrl+V', onClick: paste },
    { divider: true },
    { icon: <MousePointer2 size={13} />, label: 'Select All', shortcut: 'Ctrl+A', onClick: selectAll },
    { divider: true },
    { icon: <Trash2 size={13} />, label: 'Delete', shortcut: 'Del', onClick: deleteSelected, disabled: selectedIds.length === 0, danger: true },
  ];

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground"
      onContextMenu={handleContextMenu}
    >
      {/* ── Top Toolbar ── */}
      <TopToolbar
        onToggleShortcuts={() => setShowShortcuts(true)}
        leftCollapsed={leftCollapsed}
        rightCollapsed={rightCollapsed}
        onToggleLeft={() => setLeftCollapsed(p => !p)}
        onToggleRight={() => setRightCollapsed(p => !p)}
      />

      {/* ── Main Body ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <Suspense fallback={<div className="w-[240px] border-r border-border bg-[hsl(var(--sidebar-background))]" />}>
          <LeftSidebar collapsed={leftCollapsed} onToggle={() => setLeftCollapsed(p => !p)} />
        </Suspense>

        {/* Canvas Area */}
        <div ref={canvasContainerRef} className="flex-1 relative overflow-hidden">
          {canvasSize.width > 0 && (
            <Canvas width={canvasSize.width} height={canvasSize.height} />
          )}

          {/* Floating Toolbar */}
          <Suspense fallback={null}>
            <FloatingToolbar />
          </Suspense>

          {/* Status Bar */}
          <StatusBar onShowShortcuts={() => setShowShortcuts(true)} />
        </div>

        {/* Right — Properties */}
        <Suspense fallback={<div className="w-[240px] border-l border-border bg-[hsl(var(--sidebar-background))]" />}>
          <AnimatePresence initial={false}>
            {!rightCollapsed && (
              <PropertiesPanel
                collapsed={false}
                onToggle={() => setRightCollapsed(true)}
              />
            )}
          </AnimatePresence>
        </Suspense>
      </div>

      {/* ── Overlays ── */}
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

      <Toaster 
        position="bottom-center" 
        expand={false} 
        theme={useTheme().theme === 'dark' ? 'dark' : (useTheme().theme === 'high-contrast' ? 'dark' : 'light')} 
        toastOptions={{
          style: {
            background: 'hsl(var(--surface-elevated))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            borderRadius: '12px',
          }
        }}
      />

      <AnimatePresence>
        {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {confirmation && (
          <ConfirmDialog
            title={confirmation.title}
            message={confirmation.message}
            type={confirmation.type}
            onConfirm={() => { confirmation.onConfirm(); setConfirmation(null); }}
            onCancel={() => setConfirmation(null)}
          />
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <PWAUpdatePrompt />
      </Suspense>
    </div>
  );
}

export default App;

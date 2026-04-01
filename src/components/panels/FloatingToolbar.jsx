import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Copy, Scissors, Clipboard, ChevronUp, ChevronDown,
  Layers, AlignLeft, AlignCenter, AlignRight,
  AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter,
  AlignStartVertical, AlignEndVertical,
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { ToolButton } from '@/components/ui/tooltip';

const FloatingToolbar = () => {
  const {
    selectedIds, deleteSelected, duplicateSelected,
    copy, cut, paste, clipboard, elements, updateElement,
    bringToFront, sendToBack,
  } = useCanvasStore();

  const hasSelection = selectedIds.length > 0;
  const multiSelection = selectedIds.length > 1;
  const hasClipboard = clipboard.length > 0;

  const handleAlign = (alignType) => {
    const selected = elements.filter(el => selectedIds.includes(el.id));
    if (selected.length < 2) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    let totalX = 0, totalY = 0;
    selected.forEach(el => {
      const w = el.width || el.radius * 2 || 100;
      const h = el.height || el.radius * 2 || 100;
      minX = Math.min(minX, el.x); maxX = Math.max(maxX, el.x + w);
      minY = Math.min(minY, el.y); maxY = Math.max(maxY, el.y + h);
      totalX += el.x + w / 2; totalY += el.y + h / 2;
    });
    const cx = totalX / selected.length;
    const cy = totalY / selected.length;
    selected.forEach(el => {
      const w = el.width || el.radius * 2 || 100;
      const h = el.height || el.radius * 2 || 100;
      const updates = {};
      if (alignType === 'left')   updates.x = minX;
      if (alignType === 'center') updates.x = cx - w / 2;
      if (alignType === 'right')  updates.x = maxX - w;
      if (alignType === 'top')    updates.y = minY;
      if (alignType === 'middle') updates.y = cy - h / 2;
      if (alignType === 'bottom') updates.y = maxY - h;
      updateElement(el.id, updates);
    });
  };

  return (
    <AnimatePresence>
      {hasSelection && (
        <motion.div
          initial={{ y: 16, opacity: 0, scale: 0.92 }}
          animate={{ y: 0,  opacity: 1, scale: 1 }}
          exit={{ y: 16,   opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28, mass: 0.8 }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
          <div className="floating-toolbar flex items-center gap-0.5 px-2 py-1.5">
            {/* Clipboard */}
            <div className="flex items-center gap-0.5 pr-1.5 mr-0.5 border-r border-border">
              <ToolButton icon={Copy}      label="Copy"  shortcut="Ctrl+C" onClick={copy}  tooltipSide="top" />
              <ToolButton icon={Scissors}  label="Cut"   shortcut="Ctrl+X" onClick={cut}   tooltipSide="top" />
              <ToolButton
                icon={Clipboard}
                label="Paste"
                shortcut="Ctrl+V"
                disabled={!hasClipboard}
                onClick={paste}
                tooltipSide="top"
              />
            </div>

            {/* Order */}
            <div className="flex items-center gap-0.5 pr-1.5 mr-0.5 border-r border-border">
              <ToolButton icon={ChevronUp}   label="Bring to Front" shortcut="Ctrl+]" onClick={bringToFront} tooltipSide="top" />
              <ToolButton icon={ChevronDown} label="Send to Back"   shortcut="Ctrl+[" onClick={sendToBack}   tooltipSide="top" />
            </div>

            {/* Duplicate & Delete */}
            <div className={`flex items-center gap-0.5 ${multiSelection ? 'pr-1.5 mr-0.5 border-r border-border' : ''}`}>
              <ToolButton icon={Layers} label="Duplicate" shortcut="Ctrl+D" onClick={duplicateSelected} tooltipSide="top" />
              <ToolButton icon={Trash2} label="Delete" shortcut="Del" onClick={deleteSelected} danger tooltipSide="top" />
            </div>

            {/* Alignment (multi-select only) */}
            {multiSelection && (
              <div className="flex items-center gap-0.5">
                <ToolButton icon={AlignLeft}                   label="Align Left"   onClick={() => handleAlign('left')}   tooltipSide="top" />
                <ToolButton icon={AlignHorizontalJustifyCenter} label="Align Center" onClick={() => handleAlign('center')} tooltipSide="top" />
                <ToolButton icon={AlignRight}                  label="Align Right"  onClick={() => handleAlign('right')}  tooltipSide="top" />
                <div className="toolbar-separator mx-0.5" />
                <ToolButton icon={AlignStartVertical}          label="Align Top"    onClick={() => handleAlign('top')}    tooltipSide="top" />
                <ToolButton icon={AlignVerticalJustifyCenter}  label="Align Middle" onClick={() => handleAlign('middle')} tooltipSide="top" />
                <ToolButton icon={AlignEndVertical}            label="Align Bottom" onClick={() => handleAlign('bottom')} tooltipSide="top" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingToolbar;

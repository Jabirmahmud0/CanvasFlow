import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Copy, 
  Scissors,
  Clipboard,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  AlignStartVertical,
  AlignEndVertical,
  ChevronUp,
  ChevronDown,
  Group,
  Ungroup
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';

const FloatingToolbar = () => {
  const {
    selectedIds,
    deleteSelected,
    duplicateSelected,
    copy,
    cut,
    paste,
    clipboard,
    elements,
    updateElement,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  } = useCanvasStore();

  const hasSelection = selectedIds.length > 0;
  const multiSelection = selectedIds.length > 1;
  const hasClipboard = clipboard.length > 0;

  const handleAlign = (alignType) => {
    const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
    if (selectedElements.length < 2) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let totalX = 0, totalY = 0;

    selectedElements.forEach((el) => {
      const width = el.width || el.radius * 2 || 100;
      const height = el.height || el.radius * 2 || 100;
      minX = Math.min(minX, el.x);
      maxX = Math.max(maxX, el.x + width);
      minY = Math.min(minY, el.y);
      maxY = Math.max(maxY, el.y + height);
      totalX += el.x + width / 2;
      totalY += el.y + height / 2;
    });

    const centerX = totalX / selectedElements.length;
    const centerY = totalY / selectedElements.length;

    selectedElements.forEach((el) => {
      const width = el.width || el.radius * 2 || 100;
      const height = el.height || el.radius * 2 || 100;
      let newX = el.x;
      let newY = el.y;

      switch (alignType) {
        case 'left':
          newX = minX;
          break;
        case 'center':
          newX = centerX - width / 2;
          break;
        case 'right':
          newX = maxX - width;
          break;
        case 'top':
          newY = minY;
          break;
        case 'middle':
          newY = centerY - height / 2;
          break;
        case 'bottom':
          newY = maxY - height;
          break;
      }

      updateElement(el.id, { x: newX, y: newY });
    });
  };

  const handleDistribute = (axis) => {
    const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
    if (selectedElements.length < 3) return;

    const sorted = [...selectedElements].sort((a, b) => 
      axis === 'x' ? a.x - b.x : a.y - b.y
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const firstSize = axis === 'x' 
      ? (first.width || first.radius * 2 || 100)
      : (first.height || first.radius * 2 || 100);
    const lastSize = axis === 'x'
      ? (last.width || last.radius * 2 || 100)
      : (last.height || last.radius * 2 || 100);

    const totalSpace = axis === 'x'
      ? (last.x + lastSize / 2) - (first.x + firstSize / 2)
      : (last.y + lastSize / 2) - (first.y + firstSize / 2);
    
    const spacing = totalSpace / (sorted.length - 1);

    sorted.forEach((el, index) => {
      if (index === 0 || index === sorted.length - 1) return;
      
      const size = axis === 'x'
        ? (el.width || el.radius * 2 || 100)
        : (el.height || el.radius * 2 || 100);
      
      const newPos = axis === 'x'
        ? first.x + firstSize / 2 + spacing * index - size / 2
        : first.y + firstSize / 2 + spacing * index - size / 2;

      updateElement(el.id, { [axis]: newPos });
    });
  };

  return (
    <AnimatePresence>
      {hasSelection && (
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-1 px-2 py-2 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl shadow-black/50">
            {/* Clipboard */}
            <div className="flex items-center gap-1 pr-2 border-r border-slate-700">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copy}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Copy (Ctrl+C)"
              >
                <Copy size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={cut}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Cut (Ctrl+X)"
              >
                <Scissors size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={paste}
                disabled={!hasClipboard}
                className={`p-2 rounded-lg transition-colors ${
                  hasClipboard 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                    : 'text-slate-600 cursor-not-allowed'
                }`}
                title="Paste (Ctrl+V)"
              >
                <Clipboard size={18} />
              </motion.button>
            </div>

            {/* Layer Order */}
            <div className="flex items-center gap-1 pr-2 border-r border-slate-700">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={bringToFront}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Bring to Front (Ctrl+])"
              >
                <ChevronUp size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={sendToBack}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Send to Back (Ctrl+[)"
              >
                <ChevronDown size={18} />
              </motion.button>
            </div>

            {/* Duplicate & Delete */}
            <div className="flex items-center gap-1 pr-2 border-r border-slate-700">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={duplicateSelected}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Duplicate (Ctrl+D)"
              >
                <Layers size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={deleteSelected}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete (Del)"
              >
                <Trash2 size={18} />
              </motion.button>
            </div>

            {/* Alignment */}
            {multiSelection && (
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAlign('left')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Align Left"
                >
                  <AlignLeft size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAlign('center')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Align Center"
                >
                  <AlignHorizontalJustifyCenter size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAlign('right')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Align Right"
                >
                  <AlignRight size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAlign('top')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Align Top"
                >
                  <AlignStartVertical size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAlign('middle')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Align Middle"
                >
                  <AlignVerticalJustifyCenter size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAlign('bottom')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  title="Align Bottom"
                >
                  <AlignEndVertical size={18} />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingToolbar;

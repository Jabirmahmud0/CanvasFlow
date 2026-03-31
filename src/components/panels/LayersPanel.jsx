import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Layers,
  Square,
  Circle,
  Type,
  Minus,
  ArrowRight,
  Star,
  Hexagon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Search,
  ChevronUp,
  ChevronDown,
  GripVertical,
  X
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { COLORS } from '@/constants';
import { VirtualList } from '@/components/ui/VirtualList';

const getElementIcon = (type) => {
  switch (type) {
    case 'rectangle': return Square;
    case 'circle': return Circle;
    case 'text': return Type;
    case 'line': return Minus;
    case 'arrow': return ArrowRight;
    case 'star': return Star;
    case 'polygon': return Hexagon;
    default: return Square;
  }
};

const LayerItem = ({ 
  element, 
  isSelected, 
  onClick, 
  onToggleVisibility, 
  onToggleLock,
  index,
  total
}) => {
  const Icon = getElementIcon(element.type);
  const isVisible = element.visible !== false;
  const isLocked = element.locked === true;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onClick}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'bg-indigo-500/20 border border-indigo-500/50' 
          : 'hover:bg-slate-800/50 border border-transparent'
        }
      `}
    >
      {/* Drag Handle */}
      <GripVertical size={14} className="text-slate-600 cursor-grab active:cursor-grabbing" />

      {/* Icon */}
      <div 
        className="w-6 h-6 rounded flex items-center justify-center"
        style={{ backgroundColor: element.fill?.startsWith('#') ? element.fill : COLORS.surfaceSecondary }}
      >
        <Icon size={12} className="text-white/80" />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-slate-300 truncate block">
          {element.type.charAt(0).toUpperCase() + element.type.slice(1)} {index + 1}
        </span>
        <span className="text-xs text-slate-600">
          {Math.round(element.x)}, {Math.round(element.y)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${isVisible ? 'text-slate-400' : 'text-slate-600'}`}
          title={isVisible ? 'Hide' : 'Show'}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${isLocked ? 'text-amber-400' : 'text-slate-400'}`}
          title={isLocked ? 'Unlock' : 'Lock'}
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
      </div>
    </motion.div>
  );
};

const LayersPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showActions, setShowActions] = useState(false);

  const {
    elements,
    selectedIds,
    selectElement,
    updateElement,
    deleteSelected,
    duplicateSelected,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  } = useCanvasStore();

  // Filter elements based on search
  const filteredElements = useMemo(() => {
    if (!searchQuery) return elements;
    return elements.filter(el =>
      el.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (el.text && el.text.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [elements, searchQuery]);

  // Reverse for display (top layer first)
  const displayElements = useMemo(() => [...filteredElements].reverse(), [filteredElements]);

  const handleToggleVisibility = (id) => {
    const element = elements.find((el) => el.id === id);
    if (element) {
      updateElement(id, { visible: element.visible === false });
    }
  };

  const handleToggleLock = (id) => {
    const element = elements.find((el) => el.id === id);
    if (element) {
      updateElement(id, { locked: element.locked !== true });
    }
  };

  const hasSelection = selectedIds.length > 0;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 flex flex-col"
      role="complementary"
      aria-label="Layers panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <span className="text-sm font-medium text-slate-200">Layers</span>
        </div>
        <span className="text-xs text-slate-500" aria-live="polite">{elements.length} items</span>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search layers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            aria-label="Search layers"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Layer List - Virtualized for performance */}
      <div className="flex-1 overflow-hidden p-2">
        {displayElements.length > 0 ? (
          <VirtualList
            items={displayElements}
            itemHeight={48} // Height of each layer item
            overscan={5} // Render 5 items above/below viewport
            className="h-full"
            renderItem={({ item, index }) => {
              const originalIndex = elements.findIndex(el => el.id === item.id);
              return (
                <LayerItem
                  element={item}
                  isSelected={selectedIds.includes(item.id)}
                  onClick={() => selectElement(item.id)}
                  onToggleVisibility={() => handleToggleVisibility(item.id)}
                  onToggleLock={() => handleToggleLock(item.id)}
                  index={originalIndex}
                  total={elements.length}
                />
              );
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Layers className="w-8 h-8 mb-2 opacity-50" aria-hidden="true" />
            <span className="text-sm">
              {searchQuery ? 'No matching layers' : 'No layers yet'}
            </span>
            <span className="text-xs mt-1 text-slate-600">
              {searchQuery ? 'Try a different search' : 'Create shapes to get started'}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {hasSelection && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-3 border-t border-slate-800 space-y-2"
        >
          {/* Layer Order */}
          <div className="flex gap-1">
            <button
              onClick={bringToFront}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition-colors text-xs"
              title="Bring to Front (Ctrl+])"
            >
              <ChevronUp size={12} />
              Front
            </button>
            <button
              onClick={bringForward}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition-colors text-xs"
              title="Bring Forward (Ctrl+Shift+])"
            >
              <ChevronUp size={12} />
              Up
            </button>
            <button
              onClick={sendBackward}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition-colors text-xs"
              title="Send Backward (Ctrl+Shift+[)"
            >
              <ChevronDown size={12} />
              Down
            </button>
            <button
              onClick={sendToBack}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition-colors text-xs"
              title="Send to Back (Ctrl+[)"
            >
              <ChevronDown size={12} />
              Back
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={duplicateSelected}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
            >
              <Copy size={14} />
              <span className="text-xs">Duplicate</span>
            </button>
            <button
              onClick={deleteSelected}
              className="flex items-center justify-center px-3 py-2 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LayersPanel;

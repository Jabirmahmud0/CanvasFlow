import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Square, Circle, Type, Minus, ArrowRight, Star, Hexagon,
  Eye, EyeOff, Lock, Unlock, Trash2, ChevronDown,
  Plus, AlignJustify,
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { ToolButton } from '@/components/ui/tooltip';

/* ─── Element type metadata ─── */
const TYPE_META = {
  rectangle: { icon: Square,      color: 'bg-indigo-500',  label: 'Rectangle' },
  circle:    { icon: Circle,      color: 'bg-cyan-500',    label: 'Circle' },
  text:      { icon: Type,        color: 'bg-amber-500',   label: 'Text' },
  line:      { icon: Minus,       color: 'bg-slate-400',   label: 'Line' },
  arrow:     { icon: ArrowRight,  color: 'bg-purple-500',  label: 'Arrow' },
  star:      { icon: Star,        color: 'bg-yellow-500',  label: 'Star' },
  polygon:   { icon: Hexagon,     color: 'bg-emerald-500', label: 'Polygon' },
};

/* ─── Layer Item ─── */
const LayerItem = React.memo(({ element, isSelected, index, total }) => {
  const { selectElement, updateElement, deleteElement } = useCanvasStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const inputRef = useRef(null);

  const meta = TYPE_META[element.type] || { icon: Square, color: 'bg-slate-500', label: 'Element' };
  const Icon = meta.icon;
  const displayName = element.name || `${meta.label}`;
  const isVisible = element.visible !== false;
  const isLocked = element.locked === true;

  const handleClick = useCallback((e) => {
    selectElement(element.id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [element.id, selectElement]);

  const handleDoubleClick = useCallback(() => {
    setNameValue(displayName);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 50);
  }, [displayName]);

  const commitRename = useCallback(() => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== displayName) {
      updateElement(element.id, { name: trimmed });
    }
    setIsRenaming(false);
  }, [nameValue, displayName, element.id, updateElement]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setIsRenaming(false);
  }, [commitRename]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8, height: 0 }}
      transition={{ duration: 0.14 }}
      className={`layer-item group ${isSelected ? 'selected' : ''} ${!isVisible ? 'opacity-50' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Type dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.color}`} />

      {/* Icon */}
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-muted-foreground">
        <Icon size={13} strokeWidth={1.7} />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            ref={inputRef}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-background border border-primary/50 rounded px-1 py-0 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary/40"
          />
        ) : (
          <span className="text-xs text-muted-foreground group-hover:text-foreground truncate block layer-name">
            {displayName}
          </span>
        )}
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
        <button
          type="button"
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => { e.stopPropagation(); updateElement(element.id, { visible: !isVisible }); }}
          aria-label={isVisible ? 'Hide' : 'Show'}
        >
          {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => { e.stopPropagation(); updateElement(element.id, { locked: !isLocked }); }}
          aria-label={isLocked ? 'Unlock' : 'Lock'}
        >
          {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
          onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
          aria-label="Delete element"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
});
LayerItem.displayName = 'LayerItem';

/* ─── Layers Panel ─── */
const LayersPanel = () => {
  const { elements, selectedIds, selectAll, clearSelection, deleteSelected } = useCanvasStore();
  const [sortOrder, setSortOrder] = useState('top-to-bottom'); // 'top-to-bottom' | 'bottom-to-top'

  // Display in reverse order (top elements first)
  const displayElements = sortOrder === 'top-to-bottom'
    ? [...elements].reverse()
    : elements;

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {elements.length} {elements.length === 1 ? 'Layer' : 'Layers'}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={() => setSortOrder(s => s === 'top-to-bottom' ? 'bottom-to-top' : 'top-to-bottom')}
            title="Reverse sort order"
          >
            <AlignJustify size={12} />
          </button>
          {hasSelection && (
            <button
              type="button"
              className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={deleteSelected}
              title="Delete selected"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Layer List ── */}
      <div className="flex-1 overflow-y-auto py-1 px-1.5">
        {elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Square size={18} className="text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
              No layers yet.<br />Draw something on the canvas.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {displayElements.map((element, i) => (
              <LayerItem
                key={element.id}
                element={element}
                isSelected={selectedIds.includes(element.id)}
                index={i}
                total={elements.length}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Footer ── */}
      {elements.length > 0 && (
        <div className="flex items-center gap-1 px-3 py-2 border-t border-border flex-shrink-0">
          <button
            type="button"
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            onClick={hasSelection ? clearSelection : selectAll}
          >
            {hasSelection
              ? `Deselect (${selectedIds.length})`
              : 'Select all'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LayersPanel;

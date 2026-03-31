import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, 
  Move, 
  Maximize2, 
  Palette, 
  Type,
  Hash,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { COLORS, PRESET_COLORS, GRADIENT_PRESETS } from '@/constants';

const PropertyGroup = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="mb-2 border-b border-border/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:bg-accent/30 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon size={14} />
          {title}
        </span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PropertyRow = ({ label, children, tooltip }) => (
  <div className="flex items-center justify-between gap-4" title={tooltip}>
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      {children}
    </div>
  </div>
);

const NumberInput = ({ value, onChange, min, max, step = 1, suffix }) => (
  <div className="flex items-center gap-1">
    <input
      type="number"
      value={value === 'mixed' ? '' : value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      min={min}
      max={max}
      step={step}
      placeholder={value === 'mixed' ? '—' : ''}
      className="w-20 px-2 py-1.5 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-indigo-500 tabular-nums transition-colors"
    />
    {suffix && <span className="text-xs text-muted-foreground/50">{suffix}</span>}
  </div>
);

const ColorInput = ({ value, onChange, showPresets = true }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-8 h-8 rounded-lg border border-border overflow-hidden"
          style={{ background: value?.startsWith('linear') ? value : value || '#6366F1' }}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#6366F1"
          className="w-24 px-2 py-1.5 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-indigo-500 font-mono"
        />
      </div>
      
      {showPicker && showPresets && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-xl z-50 w-56"
        >
          <div className="grid grid-cols-8 gap-1 mb-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => { onChange(color); setShowPicker(false); }}
                className="w-5 h-5 rounded hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="border-t border-border pt-2">
            <span className="text-xs text-muted-foreground/50 mb-1 block">Gradients</span>
            <div className="space-y-1">
              {GRADIENT_PRESETS.map((gradient, i) => (
                <button
                  key={i}
                  onClick={() => { onChange(gradient); setShowPicker(false); }}
                  className="w-full h-6 rounded hover:scale-[1.02] transition-transform"
                  style={{ background: gradient }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const ToggleButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
      ${active
        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
        : 'bg-muted text-muted-foreground hover:bg-accent'
      }
    `}
    aria-pressed={active}
    aria-label={label}
  >
    <Icon size={14} aria-hidden="true" />
    <span>{label}</span>
  </button>
);

const PropertiesPanel = () => {
  const {
    selectedIds,
    elements,
    updateElement,
    updateElements,
    getSelectedElements,
  } = useCanvasStore();

  const selectedElements = getSelectedElements();
  const hasSelection = selectedElements.length > 0;
  const singleSelection = selectedElements.length === 1;
  const multiSelection = selectedElements.length > 1;

  // Get common property (returns 'mixed' if values differ)
  const getCommonProperty = (prop) => {
    if (selectedElements.length === 0) return null;
    const firstValue = selectedElements[0][prop];
    const allSame = selectedElements.every((el) => el[prop] === firstValue);
    return allSame ? firstValue : 'mixed';
  };

  const handleUpdate = (prop, value) => {
    selectedElements.forEach((el) => {
      updateElement(el.id, { [prop]: value });
    });
  };

  const handleToggleVisibility = () => {
    const currentVisible = getCommonProperty('visible');
    const newVisible = currentVisible === false ? true : false;
    handleUpdate('visible', newVisible);
  };

  const handleToggleLock = () => {
    const currentLocked = getCommonProperty('locked');
    const newLocked = currentLocked === true ? false : true;
    handleUpdate('locked', newLocked);
  };

  if (!hasSelection) {
    return (
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 bg-sidebar/95 backdrop-blur-sm border-l border-border flex flex-col"
        role="complementary"
        aria-label="Properties panel"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Settings2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">Properties</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Settings2 className="w-12 h-12 mb-3 opacity-30" aria-hidden="true" />
          <span className="text-sm">No selection</span>
          <span className="text-xs mt-1 text-muted-foreground/50">Select an element to edit properties</span>
        </div>
      </motion.div>
    );
  }

  const element = singleSelection ? selectedElements[0] : null;
  const isVisible = getCommonProperty('visible') !== false;
  const isLocked = getCommonProperty('locked') === true;

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 bg-sidebar/95 backdrop-blur-sm border-l border-border flex flex-col overflow-hidden"
      role="complementary"
      aria-label="Properties panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">
            {multiSelection ? `${selectedElements.length} items selected` : 'Properties'}
          </span>
        </div>
        {singleSelection && (
          <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded">
            {element.type}
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 px-4 py-2 border-b border-border">
        <ToggleButton
          active={isVisible}
          onClick={handleToggleVisibility}
          icon={isVisible ? Eye : EyeOff}
          label={isVisible ? 'Visible' : 'Hidden'}
        />
        <ToggleButton
          active={isLocked}
          onClick={handleToggleLock}
          icon={isLocked ? Lock : Unlock}
          label={isLocked ? 'Locked' : 'Unlocked'}
        />
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence mode="wait">
          {/* Transform */}
          <PropertyGroup title="Transform" icon={Move}>
            <PropertyRow label="X Position">
              <NumberInput
                value={getCommonProperty('x')}
                onChange={(v) => handleUpdate('x', v)}
              />
            </PropertyRow>
            <PropertyRow label="Y Position">
              <NumberInput
                value={getCommonProperty('y')}
                onChange={(v) => handleUpdate('y', v)}
              />
            </PropertyRow>
            <PropertyRow label="Rotation">
              <NumberInput
                value={getCommonProperty('rotation')}
                onChange={(v) => handleUpdate('rotation', v)}
                suffix="°"
              />
            </PropertyRow>
            <PropertyRow label="Opacity">
              <NumberInput
                value={Math.round((getCommonProperty('opacity') ?? 1) * 100)}
                onChange={(v) => handleUpdate('opacity', Math.max(0, Math.min(100, v)) / 100)}
                min={0}
                max={100}
                suffix="%"
              />
            </PropertyRow>
          </PropertyGroup>

          {/* Size */}
          {(element?.type === 'rectangle' || multiSelection) && (
            <PropertyGroup title="Size" icon={Maximize2}>
              <PropertyRow label="Width">
                <NumberInput
                  value={getCommonProperty('width')}
                  onChange={(v) => handleUpdate('width', Math.max(1, v))}
                  min={1}
                />
              </PropertyRow>
              <PropertyRow label="Height">
                <NumberInput
                  value={getCommonProperty('height')}
                  onChange={(v) => handleUpdate('height', Math.max(1, v))}
                  min={1}
                />
              </PropertyRow>
              {element?.type === 'rectangle' && (
                <PropertyRow label="Corner Radius">
                  <NumberInput
                    value={getCommonProperty('cornerRadius') || 0}
                    onChange={(v) => handleUpdate('cornerRadius', Math.max(0, v))}
                    min={0}
                  />
                </PropertyRow>
              )}
            </PropertyGroup>
          )}

          {/* Circle/Star/Polygon Size */}
          {(element?.type === 'circle' || element?.type === 'star' || element?.type === 'polygon') && (
            <PropertyGroup title="Size" icon={Maximize2}>
              <PropertyRow label="Radius">
                <NumberInput
                  value={element?.radius}
                  onChange={(v) => handleUpdate('radius', Math.max(1, v))}
                  min={1}
                />
              </PropertyRow>
              {element?.type === 'star' && (
                <>
                  <PropertyRow label="Points">
                    <NumberInput
                      value={element?.numPoints || 5}
                      onChange={(v) => handleUpdate('numPoints', Math.max(3, v))}
                      min={3}
                    />
                  </PropertyRow>
                  <PropertyRow label="Inner Radius">
                    <NumberInput
                      value={element?.innerRadius || 20}
                      onChange={(v) => handleUpdate('innerRadius', Math.max(1, v))}
                      min={1}
                    />
                  </PropertyRow>
                </>
              )}
              {element?.type === 'polygon' && (
                <PropertyRow label="Sides">
                  <NumberInput
                    value={element?.sides || 6}
                    onChange={(v) => handleUpdate('sides', Math.max(3, v))}
                    min={3}
                  />
                </PropertyRow>
              )}
            </PropertyGroup>
          )}

          {/* Appearance */}
          <PropertyGroup title="Appearance" icon={Palette}>
            <PropertyRow label="Fill">
              <ColorInput
                value={getCommonProperty('fill')}
                onChange={(v) => handleUpdate('fill', v)}
              />
            </PropertyRow>
            <PropertyRow label="Stroke">
              <ColorInput
                value={getCommonProperty('stroke')}
                onChange={(v) => handleUpdate('stroke', v)}
                showPresets={false}
              />
            </PropertyRow>
            <PropertyRow label="Stroke Width">
              <NumberInput
                value={getCommonProperty('strokeWidth') || 0}
                onChange={(v) => handleUpdate('strokeWidth', Math.max(0, v))}
                min={0}
              />
            </PropertyRow>
            {element?.type === 'line' && (
              <PropertyRow label="Dash">
                <NumberInput
                  value={(getCommonProperty('dash') || [0, 0])[0]}
                  onChange={(v) => handleUpdate('dash', v > 0 ? [v, v] : null)}
                  min={0}
                />
              </PropertyRow>
            )}
          </PropertyGroup>

          {/* Text Properties */}
          {element?.type === 'text' && (
            <PropertyGroup title="Typography" icon={Type}>
              <PropertyRow label="Content">
                <textarea
                  value={element.text}
                  onChange={(e) => handleUpdate('text', e.target.value)}
                  className="w-32 px-2 py-1.5 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-indigo-500 resize-none"
                  rows={2}
                />
              </PropertyRow>
              <PropertyRow label="Font Size">
                <NumberInput
                  value={element.fontSize}
                  onChange={(v) => handleUpdate('fontSize', Math.max(8, v))}
                  min={8}
                />
              </PropertyRow>
              <PropertyRow label="Font Weight">
                <select
                  value={element.fontWeight || 'normal'}
                  onChange={(e) => handleUpdate('fontWeight', e.target.value)}
                  className="w-24 px-2 py-1.5 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-indigo-500"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Light</option>
                </select>
              </PropertyRow>
              <PropertyRow label="Line Height">
                <NumberInput
                  value={Math.round((element.lineHeight || 1.2) * 100)}
                  onChange={(v) => handleUpdate('lineHeight', v / 100)}
                  min={50}
                  max={300}
                  suffix="%"
                />
              </PropertyRow>
            </PropertyGroup>
          )}

          {/* Arrow Properties */}
          {element?.type === 'arrow' && (
            <PropertyGroup title="Arrow" icon={Sliders}>
              <PropertyRow label="Pointer Length">
                <NumberInput
                  value={element.pointerLength || 10}
                  onChange={(v) => handleUpdate('pointerLength', Math.max(5, v))}
                  min={5}
                />
              </PropertyRow>
              <PropertyRow label="Pointer Width">
                <NumberInput
                  value={element.pointerWidth || 10}
                  onChange={(v) => handleUpdate('pointerWidth', Math.max(5, v))}
                  min={5}
                />
              </PropertyRow>
            </PropertyGroup>
          )}

          {/* Layer Info */}
          {singleSelection && (
            <PropertyGroup title="Layer Info" icon={Hash} defaultOpen={false}>
              <PropertyRow label="ID">
                <span className="text-xs text-muted-foreground/50 font-mono truncate max-w-[140px]">
                  {element.id}
                </span>
              </PropertyRow>
              <PropertyRow label="Type">
                <span className="text-xs text-muted-foreground/50 capitalize">
                  {element.type}
                </span>
              </PropertyRow>
              <PropertyRow label="Created">
                <span className="text-xs text-muted-foreground/50">
                  {new Date(element.createdAt).toLocaleString()}
                </span>
              </PropertyRow>
              {element.updatedAt && (
                <PropertyRow label="Modified">
                  <span className="text-xs text-muted-foreground/50">
                    {new Date(element.updatedAt).toLocaleString()}
                  </span>
                </PropertyRow>
              )}
            </PropertyGroup>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PropertiesPanel;

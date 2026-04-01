import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2, ChevronRight, Link2, Unlink2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Type, Layers, Eye, Plus, Minus
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import ColorPicker from '@/components/ui/ColorPicker';
import { TOOLS } from '@/constants';

const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'System', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
];

/* ─── Labelled number input ─── */
const NumInput = ({ label, value, onChange, min, max, step = 1, unit = '' }) => {
  const [localVal, setLocalVal] = useState(value);
  
  React.useEffect(() => {
    // Only update localVal if it's numerically different from value
    // This prevents wiping out partial inputs like "1." or "-"
    const roundedValue = typeof value === 'number' ? Math.round(value * 100) / 100 : value;
    if (localVal === undefined || localVal === '' || Number(localVal) !== roundedValue) {
      setLocalVal(roundedValue);
    }
  }, [value]);

  const commit = () => {
    const num = Number(localVal);
    if (!isNaN(num)) {
      let finalNum = num;
      if (min !== undefined && num < min) finalNum = min;
      if (max !== undefined && num > max) finalNum = max;
      
      setLocalVal(Math.round(finalNum * 100) / 100);
      onChange(finalNum);
    } else {
      setLocalVal(typeof value === 'number' ? Math.round(value * 100) / 100 : value);
    }
  };

  const handleInputChange = (e) => {
    const nextVal = e.target.value;
    setLocalVal(nextVal);
    
    const num = Number(nextVal);
    if (nextVal !== '' && nextVal !== '-' && !isNaN(num)) {
      // For live updates, we don't necessarily want to clamp strictly while typing
      // as it can prevent typing certain sequences (e.g. if min is 10 and you want to type 100, 
      // typing '1' would clamp to 10 immediately).
      // However, for certain properties like strokeWidth, 0 might be okay.
      onChange(num);
    }
  };

  const handleIncrement = () => {
    let num = Number(localVal);
    if (isNaN(num)) num = typeof value === 'number' ? value : 0;
    let finalNum = num + step;
    if (max !== undefined && finalNum > max) finalNum = max;
    setLocalVal(Math.round(finalNum * 1000) / 1000);
    onChange(finalNum);
  };

  const handleDecrement = () => {
    let num = Number(localVal);
    if (isNaN(num)) num = typeof value === 'number' ? value : 0;
    let finalNum = num - step;
    if (min !== undefined && finalNum < min) finalNum = min;
    setLocalVal(Math.round(finalNum * 1000) / 1000);
    onChange(finalNum);
  };

  return (
    <div className="prop-input h-8 relative flex items-center group">
      <span className="prop-input-label z-10" title={label}>{label}</span>
      <input
        type="number"
        value={localVal === undefined ? '' : localVal}
        min={min}
        max={max}
        step={step}
        onChange={handleInputChange}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
        }}
        className="w-full text-right"
      />
      {unit && <span className="text-[10px] text-muted-foreground/60 pr-[14px] flex-shrink-0 z-10 pointer-events-none">{unit}</span>}
      <div className="absolute right-0 top-0 bottom-0 w-[14px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button tabIndex={-1} type="button" onClick={handleIncrement} className="flex-1 flex items-center justify-center w-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <svg width="8" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
        <button tabIndex={-1} type="button" onClick={handleDecrement} className="flex-1 flex items-center justify-center w-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <svg width="8" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
    </div>
  );
};

/* ─── Section wrapper ─── */
const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setOpen(p => !p)}
      >
        {title}
        <ChevronRight
          size={12}
          className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 flex flex-col gap-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Panel ─── */
const PropertiesPanel = ({ collapsed, onToggle }) => {
  const {
    elements, selectedIds, updateElement, updateElements,
    activeTool, drawingSettings, setDrawingSetting
  } = useCanvasStore();

  const [linkedAspect, setLinkedAspect] = useState(false);

  const selectedElements = elements.filter(el => selectedIds.includes(el.id));
  const isSingle = selectedElements.length === 1;
  const isMulti = selectedElements.length > 1;
  const el = isSingle ? selectedElements[0] : null;
  const isText = isSingle && el?.type === 'text';
  const hasStroke = selectedElements.length > 0 && selectedElements.some(e => e.type !== 'text');
  const hasFill = selectedElements.length > 0 && selectedElements.some(e => e.type !== 'text');
  const isDrawingTool = activeTool === TOOLS.PEN || activeTool === TOOLS.BRUSH;

  const update = useCallback((key, val) => {
    if (isSingle && el) {
      updateElement(el.id, { [key]: val });
    } else if (isMulti) {
      updateElements(selectedIds, { [key]: val });
    }
  }, [isSingle, isMulti, el, updateElement, updateElements, selectedIds]);

  const updateMulti = useCallback((key, val) => {
    updateElements(selectedIds, { [key]: val });
  }, [selectedIds, updateElements]);

  const updateRelative = useCallback((key, delta, min = 0, max = 100) => {
    selectedElements.forEach(item => {
      const current = typeof item[key] === 'number' ? item[key] : (key === 'strokeWidth' ? 2 : 0);
      const newVal = Math.round((Math.min(max, Math.max(min, current + delta))) * 100) / 100;
      updateElement(item.id, { [key]: newVal });
    });
  }, [selectedElements, updateElement]);

  const handleWidthChange = useCallback((w) => {
    if (!el) return;
    if ((el.type === 'circle' || el.type === 'polygon' || el.type === 'star') && (el.radius !== undefined || el.outerRadius !== undefined)) {
      if (el.type === 'star') update('outerRadius', w / 2);
      else update('radius', w / 2);
    } else if (linkedAspect && el.height && el.width) {
      const ratio = el.height / el.width;
      updateElement(el.id, { width: w, height: Math.round(w * ratio) });
    } else {
      update('width', w);
    }
  }, [el, update, updateElement, linkedAspect]);

  const handleHeightChange = useCallback((h) => {
    if (!el) return;
    if ((el.type === 'circle' || el.type === 'polygon' || el.type === 'star') && (el.radius !== undefined || el.outerRadius !== undefined)) {
      if (el.type === 'star') update('outerRadius', h / 2);
      else update('radius', h / 2);
    } else if (linkedAspect && el.height && el.width) {
      const ratio = el.width / el.height;
      updateElement(el.id, { height: h, width: Math.round(h * ratio) });
    } else {
      update('height', h);
    }
  }, [el, update, updateElement, linkedAspect]);

  // ── Empty states ──────────────────────────────────────
  // ── Rendering Decision Logic ──
  // If a drawing tool is active, we show DRAWING settings primarily.
  // If NOT drawing, we show SELECTION settings.
  const showDrawingSettings = isDrawingTool;
  const showSelectionSettings = selectedElements.length > 0 && !isDrawingTool;

  if (!collapsed && !showDrawingSettings && !showSelectionSettings) {
    return (
      <aside className="flex flex-col border-l border-border bg-[hsl(var(--sidebar-background))] overflow-hidden flex-shrink-0" style={{ width: 240 }}>
        <PanelHeader />
        <div className="flex flex-col items-center justify-center flex-1 gap-3 px-4">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Settings2 size={22} className="text-muted-foreground/40" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">No selection</p>
            <p className="text-[11px] text-muted-foreground/50 mt-1">Select an element to see its properties</p>
          </div>
        </div>
      </aside>
    );
  }

  if (collapsed) return null;

  return (
    <motion.aside
      key="right-sidebar"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 240, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col border-l border-border bg-[hsl(var(--sidebar-background))] overflow-hidden flex-shrink-0"
      style={{ minWidth: 0 }}
    >
      <PanelHeader label={
        isDrawingTool ? (activeTool === TOOLS.PEN ? 'Pen Tool' : 'Brush Tool') 
        : isSingle ? el.name || titleOf(el.type) : `${selectedIds.length} elements`
      } />

      {/* ── Multi-select notice ── */}
      {isMulti && (
        <div className="px-3 py-2 border-b border-border/60 text-xs text-muted-foreground bg-primary/5">
          <span className="text-primary font-medium">{selectedIds.length}</span> elements selected. Editing shared properties.
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* ── Drawing Tool Settings (New Stroke) ── */}
        {showDrawingSettings && (
          <Section title={`${activeTool === TOOLS.PEN ? 'Pen' : 'Brush'} Default`} defaultOpen>
            <ColorPicker
              color={drawingSettings.stroke}
              onChange={v => setDrawingSetting('stroke', v)}
              label="Color"
            />
            
            <NumInput
              label="Size"
              value={drawingSettings.strokeWidth}
              onChange={v => setDrawingSetting('strokeWidth', v)}
              min={1}
              max={100}
              step={1}
              unit="px"
            />
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex-shrink-0 w-[40px]">Opacity</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((drawingSettings.opacity ?? 1) * 100)}
                onChange={e => setDrawingSetting('opacity', Number(e.target.value) / 100)}
                className="zoom-slider flex-1"
              />
              <span className="text-xs font-mono text-muted-foreground w-8 text-right flex-shrink-0">
                {Math.round((drawingSettings.opacity ?? 1) * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex-shrink-0 w-[40px]">Smooth</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((drawingSettings.tension ?? 0.5) * 100)}
                onChange={e => setDrawingSetting('tension', Number(e.target.value) / 100)}
                className="zoom-slider flex-1"
              />
              <span className="text-xs font-mono text-muted-foreground w-8 text-right flex-shrink-0">
                {Math.round((drawingSettings.tension ?? 0.5) * 100)}%
              </span>
            </div>
          </Section>
        )}

        {/* ── Position & Size ── */}
        {isSingle && !isDrawingTool && (
          <Section title="Transform" defaultOpen>
            {/* X Y */}
            <div className="grid grid-cols-2 gap-2">
              <NumInput label="X" value={el.x ?? 0} onChange={v => update('x', v)} step={0.5} />
              <NumInput label="Y" value={el.y ?? 0} onChange={v => update('y', v)} step={0.5} />
            </div>

            {/* W H */}
            {(el.width !== undefined || el.radius !== undefined || el.outerRadius !== undefined) && (
              <div className="flex items-center gap-1.5">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <NumInput
                    label="W"
                    value={el.width ?? ((el.outerRadius || el.radius || 0) * 2)}
                    onChange={handleWidthChange}
                    min={1}
                  />
                  <NumInput
                    label="H"
                    value={el.height ?? ((el.outerRadius || el.radius || 0) * 2)}
                    onChange={handleHeightChange}
                    min={1}
                  />
                </div>
                <button
                  type="button"
                  className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${linkedAspect ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                  onClick={() => setLinkedAspect(p => !p)}
                  title={linkedAspect ? 'Unlink aspect ratio' : 'Link aspect ratio'}
                >
                  {linkedAspect ? <Link2 size={12} /> : <Unlink2 size={12} />}
                </button>
              </div>
            )}

            {/* Rotation */}
            <div className="grid grid-cols-2 gap-2">
              <NumInput label="°" value={el.rotation ?? 0} onChange={v => update('rotation', v)} min={-360} max={360} />
            </div>

            {/* Corner radius for rectangles */}
            {selectedElements.some(e => e.type === 'rectangle') && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1">
                  <NumInput
                    label="r"
                    value={(isSingle ? el.cornerRadius : selectedElements.find(e => e.type === 'rectangle')?.cornerRadius) ?? 0}
                    onChange={v => update('cornerRadius', v)}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateRelative('cornerRadius', -2, 0, 100)}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-accent text-muted-foreground transition-colors"
                    title="Decrease rounding"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRelative('cornerRadius', 2, 0, 100)}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-accent text-muted-foreground transition-colors"
                    title="Increase rounding"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ── Shape Specific ── */}
        {isSingle && !isDrawingTool && (el.type === 'polygon' || el.type === 'star') && (
          <Section title="Shape" defaultOpen>
            {el.type === 'polygon' && (
              <NumInput
                label="Sides"
                value={el.sides || 3}
                onChange={v => update('sides', v)}
                min={3}
                max={20}
              />
            )}
            {el.type === 'star' && (
              <div className="flex flex-col gap-3">
                <NumInput
                  label="Points"
                  value={el.numPoints || 5}
                  onChange={v => update('numPoints', v)}
                  min={3}
                  max={20}
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Inner Radius</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{el.innerRadius || 25}px</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={el.outerRadius || 100}
                    value={el.innerRadius || 25}
                    onChange={e => update('innerRadius', Number(e.target.value))}
                    className="zoom-slider h-1.5"
                  />
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ── Fill ── */}
        {hasFill && !isDrawingTool && (
          <Section title="Fill" defaultOpen>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-medium text-foreground">Enabled</span>
              <button
                type="button"
                className={`w-8 h-4 rounded-full transition-colors relative ${(isSingle ? el.fill : selectedElements[0]?.fill) !== 'transparent' ? 'bg-primary' : 'bg-muted'}`}
                onClick={() => {
                  const currentFill = isSingle ? el.fill : selectedElements[0]?.fill;
                  if (currentFill === 'transparent') {
                    update('fill', '#6366F1');
                  } else {
                    update('fill', 'transparent');
                  }
                }}
              >
                <div className={`absolute top-0.5 left-0 w-3 h-3 rounded-full bg-white transition-transform ${(isSingle ? el.fill : selectedElements[0]?.fill) !== 'transparent' ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            {(isSingle ? (el?.fill !== 'transparent' && el?.fill) : (selectedElements[0]?.fill !== 'transparent')) && (
              <ColorPicker
                color={isSingle ? el.fill : (selectedElements[0]?.fill || '#6366F1')}
                onChange={v => update('fill', v)}
                label="Fill"
              />
            )}
          </Section>
        )}

        {/* ── Stroke ── */}
        {hasStroke && !isDrawingTool && (
          <Section title="Stroke" defaultOpen={true}>
            <ColorPicker
              color={(isSingle ? el.stroke : selectedElements[0].stroke) || '#6366F1'}
              onChange={v => update('stroke', v)}
              label="Stroke"
            />
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                <div className="flex-1">
                  <NumInput
                    label="W"
                    value={(isSingle ? el.strokeWidth : selectedElements[0].strokeWidth) ?? 2}
                    onChange={v => update('strokeWidth', v)}
                    min={0}
                    max={100}
                    step={0.5}
                    unit="px"
                  />
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateRelative('strokeWidth', -1, 0, 100)}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-accent text-muted-foreground transition-colors"
                    title="Decrease thickness"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRelative('strokeWidth', 1, 0, 100)}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:bg-accent text-muted-foreground transition-colors"
                    title="Increase thickness"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={0.5}
                  value={(isSingle ? el.strokeWidth : selectedElements[0].strokeWidth) ?? 2}
                  onChange={e => update('strokeWidth', Number(e.target.value))}
                  className="zoom-slider flex-1"
                />
              </div>
            </div>

            {/* Border Style Buttons */}
            <div className="flex gap-1 mt-3">
              {[
                { label: 'Solid', dash: [] },
                { label: 'Dash', dash: [8, 4] },
                { label: 'Dot', dash: [2, 4] },
              ].map((style) => {
                const currentDash = isSingle ? (el.dash || []) : (selectedElements[0].dash || []);
                const isActive = JSON.stringify(currentDash) === JSON.stringify(style.dash) || 
                               (style.dash.length === 0 && (!currentDash || currentDash.length === 0));
                return (
                  <button
                    key={style.label}
                    type="button"
                    className={`flex-1 h-7 rounded border text-[10px] uppercase font-semibold transition-colors
                      ${isActive
                        ? 'border-primary/50 bg-primary/10 text-primary' 
                        : 'border-border text-muted-foreground hover:bg-accent'}`}
                    onClick={() => update('dash', style.dash)}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Typography (text only) ── */}
        {isSingle && isText && !isDrawingTool && (
          <Section title="Typography" defaultOpen>
            {/* Font Family Selector */}
            <div className="prop-input h-8 px-2 flex items-center">
              <Type size={11} className="text-muted-foreground/50 mr-2 shrink-0" />
              <select
                value={el.fontFamily || 'Inter, sans-serif'}
                onChange={(e) => update('fontFamily', e.target.value)}
                className="w-full bg-transparent border-none text-[11px] text-foreground outline-none cursor-pointer font-medium appearance-none"
                style={{ fontFamily: el.fontFamily }}
              >
                {FONT_FAMILIES.map(f => (
                  <option key={f.value} value={f.value} className="bg-[hsl(var(--surface-elevated))] text-foreground font-sans">
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronRight size={10} className="text-muted-foreground/40 rotate-90 shrink-0 pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <NumInput label="Size" value={el.fontSize ?? 16} onChange={v => update('fontSize', v)} min={6} max={256} unit="px" />
              <NumInput label="Space" value={el.letterSpacing ?? 0} onChange={v => update('letterSpacing', v)} min={-10} max={100} unit="em" />
            </div>

            {/* Font weight */}
            <div className="flex gap-1">
              {[
                { val: 'normal', icon: Type, label: 'Normal' },
                { val: 'bold',   icon: Bold, label: 'Bold' },
                { val: 'italic', icon: Italic, label: 'Italic' },
              ].map(({ val, icon: Icon, label }) => (
                <button
                  key={val}
                  type="button"
                  className={`flex-1 flex items-center justify-center h-8 rounded-md border transition-colors text-xs
                    ${(el.fontWeight === val || (val === 'normal' && el.fontWeight !== 'bold' && el.fontStyle !== 'italic')) || (val === 'italic' && el.fontStyle === 'italic')
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent'
                    }`}
                  onClick={() => {
                    if (val === 'italic') {
                      update('fontStyle', el.fontStyle === 'italic' ? 'normal' : 'italic');
                    } else if (val === 'normal') {
                      updateElement(el.id, { fontWeight: 'normal', fontStyle: 'normal' });
                    } else {
                      update('fontWeight', el.fontWeight === val ? 'normal' : val);
                    }
                  }}
                  aria-label={label}
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>

            {/* Align */}
            <div className="flex gap-1">
              {[
                { val: 'left',    icon: AlignLeft,    label: 'Left' },
                { val: 'center',  icon: AlignCenter,  label: 'Center' },
                { val: 'right',   icon: AlignRight,   label: 'Right' },
                { val: 'justify', icon: AlignJustify, label: 'Justify' },
              ].map(({ val, icon: Icon, label }) => (
                <button
                  key={val}
                  type="button"
                  className={`flex-1 flex items-center justify-center h-8 rounded-md border transition-colors
                    ${(el.align === val || (!el.align && val === 'left'))
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent'
                    }`}
                  onClick={() => update('align', val)}
                  aria-label={label}
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* ── Appearance (Opacity) ── */}
        {(isSingle || isMulti) && !isDrawingTool && (
          <Section title="Appearance" defaultOpen>
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex-shrink-0 w-[40px]">Opacity</span>
              {isSingle ? (
                <>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((el.opacity ?? 1) * 100)}
                    onChange={e => update('opacity', Number(e.target.value) / 100)}
                    className="zoom-slider flex-1"
                  />
                  <span className="text-xs font-mono text-muted-foreground w-8 text-right flex-shrink-0">
                    {Math.round((el.opacity ?? 1) * 100)}%
                  </span>
                </>
              ) : (
                <>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={100}
                    onChange={e => updateMulti('opacity', Number(e.target.value) / 100)}
                    className="zoom-slider flex-1"
                  />
                  <span className="text-xs font-mono text-muted-foreground w-8 text-right flex-shrink-0">
                  </span>
                </>
              )}
            </div>
          </Section>
        )}

        {/* ── Arrange ── */}
        {isSingle && !isDrawingTool && (
          <Section title="Arrange" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Visible', key: 'visible', val: el.visible !== false },
                { label: 'Locked', key: 'locked', val: el.locked === true },
              ].map(({ label: lbl, key, val }) => (
                <button
                  key={key}
                  type="button"
                  className={`h-8 rounded-md border text-xs transition-colors flex items-center justify-center gap-1.5
                    ${val ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-accent'}`}
                  onClick={() => update(key, !val)}
                >
                  {key === 'visible' ? <Eye size={12} /> : <Layers size={12} />}
                  {lbl}
                </button>
              ))}
            </div>
          </Section>
        )}
      </div>
    </motion.aside>
  );
};

/* ─── Header ─── */
const titleOf = (type) => ({
  rectangle: 'Rectangle',
  circle: 'Circle',
  text: 'Text',
  line: 'Line',
  arrow: 'Arrow',
  star: 'Star',
  polygon: 'Polygon',
})[type] || 'Element';

const PanelHeader = ({ label }) => (
  <div className="flex items-center h-10 px-3 border-b border-border flex-shrink-0">
    <span className="text-xs font-semibold text-foreground truncate">
      {label || 'Properties'}
    </span>
  </div>
);

/* ─── Wrapper with collapse ─── */
const PropertiesPanelWrapper = ({ collapsed, onToggle }) => {
  const { selectedIds } = useCanvasStore();

  if (collapsed) return null;

  return (
    <AnimatePresence initial={false}>
      <PropertiesPanel collapsed={collapsed} onToggle={onToggle} />
    </AnimatePresence>
  );
};

export default PropertiesPanel;

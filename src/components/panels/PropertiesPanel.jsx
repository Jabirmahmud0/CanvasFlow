import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2, ChevronRight, Link2, Unlink2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Type, Layers, Palette, Eye, PanelRightClose,
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import ColorPicker from '@/components/ui/ColorPicker';

const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'System', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
];

/* ─── Labelled number input ─── */
const NumInput = ({ label, value, onChange, min, max, step = 1, unit = '' }) => (
  <div className="prop-input h-8">
    <span className="prop-input-label" title={label}>{label}</span>
    <input
      type="number"
      value={typeof value === 'number' ? Math.round(value * 100) / 100 : value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    {unit && <span className="text-[10px] text-muted-foreground/60 pr-1.5 flex-shrink-0">{unit}</span>}
  </div>
);

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
  } = useCanvasStore();

  const [linkedAspect, setLinkedAspect] = useState(false);

  const selectedElements = elements.filter(el => selectedIds.includes(el.id));
  const isSingle = selectedElements.length === 1;
  const isMulti = selectedElements.length > 1;
  const el = isSingle ? selectedElements[0] : null;
  const isText = el?.type === 'text';
  const isShape = el && ['rectangle', 'circle', 'star', 'polygon'].includes(el.type);
  const hasStroke = el && el.type !== 'text';

  const update = useCallback((key, val) => {
    if (!el) return;
    updateElement(el.id, { [key]: val });
  }, [el, updateElement]);

  const updateMulti = useCallback((key, val) => {
    updateElements(selectedIds, { [key]: val });
  }, [selectedIds, updateElements]);

  const handleWidthChange = useCallback((w) => {
    if (!el) return;
    if (linkedAspect && el.height && el.width) {
      const ratio = el.height / el.width;
      updateElement(el.id, { width: w, height: Math.round(w * ratio) });
    } else {
      update('width', w);
    }
  }, [el, update, updateElement, linkedAspect]);

  const handleHeightChange = useCallback((h) => {
    if (!el) return;
    if (linkedAspect && el.height && el.width) {
      const ratio = el.width / el.height;
      updateElement(el.id, { height: h, width: Math.round(h * ratio) });
    } else {
      update('height', h);
    }
  }, [el, update, updateElement, linkedAspect]);

  // ── Empty states ──────────────────────────────────────
  if (!collapsed && selectedElements.length === 0) {
    return (
      <aside className="flex flex-col border-l border-border bg-[hsl(var(--sidebar-background))] overflow-hidden flex-shrink-0" style={{ width: 240 }}>
        <PanelHeader onToggle={onToggle} />
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
      <PanelHeader onToggle={onToggle} label={isSingle ? el.name || titleOf(el.type) : `${selectedIds.length} elements`} />

      {/* ── Multi-select notice ── */}
      {isMulti && (
        <div className="px-3 py-2 border-b border-border/60 text-xs text-muted-foreground bg-primary/5">
          <span className="text-primary font-medium">{selectedIds.length}</span> elements selected. Editing shared properties.
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* ── Position & Size ── */}
        {isSingle && (
          <Section title="Transform" defaultOpen>
            {/* X Y */}
            <div className="grid grid-cols-2 gap-2">
              <NumInput label="X" value={el.x ?? 0} onChange={v => update('x', v)} step={0.5} />
              <NumInput label="Y" value={el.y ?? 0} onChange={v => update('y', v)} step={0.5} />
            </div>

            {/* W H */}
            {(el.width !== undefined || el.radius !== undefined) && (
              <div className="flex items-center gap-1.5">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <NumInput
                    label="W"
                    value={el.width ?? ((el.radius ?? 0) * 2)}
                    onChange={handleWidthChange}
                    min={1}
                  />
                  <NumInput
                    label="H"
                    value={el.height ?? ((el.radius ?? 0) * 2)}
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

            {/* Rotation + Opacity */}
            <div className="grid grid-cols-2 gap-2">
              <NumInput label="°" value={el.rotation ?? 0} onChange={v => update('rotation', v)} min={-360} max={360} />
              <NumInput label="%" value={Math.round((el.opacity ?? 1) * 100)} onChange={v => update('opacity', v / 100)} min={0} max={100} />
            </div>

            {/* Corner radius for rectangles */}
            {el.type === 'rectangle' && (
              <NumInput
                label="r"
                value={el.cornerRadius ?? 0}
                onChange={v => update('cornerRadius', v)}
                min={0}
                max={Math.min((el.width ?? 100) / 2, (el.height ?? 100) / 2)}
              />
            )}
          </Section>
        )}

        {/* ── Fill ── */}
        {isSingle && (
          <Section title="Fill" defaultOpen>
            {el.fill && (
              <ColorPicker
                color={el.fill}
                onChange={v => update('fill', v)}
                label="Fill"
              />
            )}
            {el.opacity !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex-shrink-0">Opacity</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round((el.opacity ?? 1) * 100)}
                  onChange={e => update('opacity', e.target.value / 100)}
                  className="zoom-slider flex-1"
                />
                <span className="text-xs font-mono text-muted-foreground w-8 text-right flex-shrink-0">
                  {Math.round((el.opacity ?? 1) * 100)}%
                </span>
              </div>
            )}
          </Section>
        )}

        {/* ── Stroke ── */}
        {isSingle && hasStroke && (
          <Section title="Stroke" defaultOpen={false}>
            <ColorPicker
              color={el.stroke || '#6366F1'}
              onChange={v => update('stroke', v)}
              label="Stroke"
            />
            <NumInput
              label="W"
              value={el.strokeWidth ?? 2}
              onChange={v => update('strokeWidth', v)}
              min={0}
              max={40}
              step={0.5}
              unit="px"
            />
          </Section>
        )}

        {/* ── Typography (text only) ── */}
        {isSingle && isText && (
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
                    ${el.fontWeight === val || (val === 'italic' && el.fontStyle === 'italic')
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-accent'
                    }`}
                  onClick={() => {
                    if (val === 'italic') {
                      update('fontStyle', el.fontStyle === 'italic' ? 'normal' : 'italic');
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
                    ${el.align === val
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

        {/* ── Multi-select: shared opacity ── */}
        {isMulti && (
          <Section title="Appearance" defaultOpen>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex-shrink-0">Opacity</span>
              <input
                type="range"
                min={0}
                max={100}
                defaultValue={100}
                onChange={e => updateMulti('opacity', e.target.value / 100)}
                className="zoom-slider flex-1"
              />
            </div>
          </Section>
        )}

        {/* ── Arrange ── */}
        {isSingle && (
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

const PanelHeader = ({ label, onToggle }) => (
  <div className="flex items-center justify-between h-10 px-3 border-b border-border flex-shrink-0">
    <span className="text-xs font-semibold text-foreground truncate">
      {label || 'Properties'}
    </span>
    <button
      type="button"
      className="tool-btn !w-7 !h-7 !rounded-md opacity-40 hover:opacity-100 flex-shrink-0"
      onClick={onToggle}
      aria-label="Collapse panel"
    >
      <PanelRightClose size={14} />
    </button>
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

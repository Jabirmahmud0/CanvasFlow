import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pipette, ChevronDown } from 'lucide-react';
import Portal from './Portal';

/* ─── Color utilities ─── */
const hexToHsl = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hslToHex = (h, s, l) => {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

const rgbToHex = (r, g, b) => {
  const f = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${f(r)}${f(g)}${f(b)}`;
};

const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/.test(hex);

/* ─── Preset swatches ─── */
const PRESET_COLORS = [
  '#6366F1','#8B5CF6','#EC4899','#EF4444',
  '#F59E0B','#22C55E','#3B82F6','#06B6D4',
  '#14B8A6','#84CC16','#111111','#1F1F1F',
  '#475569','#94A3B8','#FFFFFF','#000000',
];

const RECENT_KEY = 'canvasflow-recent-colors';
const getRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
};
const addRecent = (color) => {
  const recents = getRecent().filter(c => c !== color).slice(0, 7);
  recents.unshift(color);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
};

/* ─── SV Picker (saturation × lightness square) ─── */
const SVPicker = ({ hue, s, l, onChange }) => {
  const ref = useRef(null);
  const dragging = useRef(false);

  const pick = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    // x = saturation (0–100), y = brightness. Convert to HSL
    // Using HSB to HSL: brightness = y inverted
    const newS = Math.round(x * 100);
    const brightness = (1 - y);
    const newL = Math.round(((2 - newS / 100) * brightness / 2) * 100);
    const finalS = newL === 0 || newL === 100 ? 0 : Math.round(newS * brightness / (1 - Math.abs(2 * newL / 100 - 1)) / 100 * 100);
    onChange(Math.max(0, Math.min(100, finalS)), Math.max(0, Math.min(100, newL)));
  }, [onChange]);

  useEffect(() => {
    const up = () => { dragging.current = false; };
    const move = (e) => { if (dragging.current) pick(e); };
    window.addEventListener('mouseup', up);
    window.addEventListener('mousemove', move);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('mousemove', move); };
  }, [pick]);

  // Position the thumb from HSL to SV space
  const thumbX = s;
  const thumbY = 100 - (l + s * Math.min(l, 100 - l) / 100);

  return (
    <div
      ref={ref}
      className="w-full h-[140px] rounded-lg relative cursor-crosshair select-none"
      style={{
        background: `
          linear-gradient(to top, #000, transparent),
          linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
        `,
      }}
      onMouseDown={(e) => { dragging.current = true; pick(e); }}
    >
      {/* Thumb */}
      <div
        className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${thumbX}%`,
          top: `${thumbY}%`,
          background: hslToHex(hue, s, l),
          boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  );
};

/* ─── Hue Slider ─── */
const HueSlider = ({ hue, onChange }) => {
  const ref = useRef(null);
  const dragging = useRef(false);

  const pick = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(Math.round(x * 360));
  }, [onChange]);

  useEffect(() => {
    const up = () => { dragging.current = false; };
    const move = (e) => { if (dragging.current) pick(e); };
    window.addEventListener('mouseup', up);
    window.addEventListener('mousemove', move);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('mousemove', move); };
  }, [pick]);

  return (
    <div
      ref={ref}
      className="w-full h-3 rounded-full relative cursor-pointer select-none"
      style={{
        background: 'linear-gradient(to right, #f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
      }}
      onMouseDown={(e) => { dragging.current = true; pick(e); }}
    >
      <div
        className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-0.5"
        style={{
          left: `${(hue / 360) * 100}%`,
          background: `hsl(${hue}, 100%, 50%)`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
};

/* ─── Main Color Picker ─── */
const ColorPicker = ({ color = '#6366F1', onChange, label = 'Color' }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('RGB');
  const [hexInput, setHexInput] = useState(color);
  const [recent, setRecent] = useState(getRecent);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const safeColor = isValidHex(color) ? color : '#6366F1';
  const [h, s, l] = useMemo(() => hexToHsl(safeColor), [safeColor]);
  const [r, g, b] = useMemo(() => hexToRgb(safeColor), [safeColor]);

  useEffect(() => { setHexInput(color); }, [color]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPopoverPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX - (224 - rect.width),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handler = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (!popoverRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('mousedown', handler);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('mousedown', handler);
    };
  }, [open, updatePosition]);

  const pick = useCallback((newColor) => {
    onChange(newColor);
    addRecent(newColor);
    setRecent(getRecent());
  }, [onChange]);

  const handleHueChange = useCallback((newH) => {
    pick(hslToHex(newH, s, l));
  }, [s, l, pick]);

  const handleSLChange = useCallback((newS, newL) => {
    pick(hslToHex(h, newS, newL));
  }, [h, pick]);

  const handleRgbChange = useCallback((newR, newG, newB) => {
    pick(rgbToHex(newR, newG, newB));
  }, [pick]);

  const handleHexInput = useCallback((val) => {
    setHexInput(val);
    if (isValidHex(val)) pick(val);
    else if (isValidHex(`#${val}`)) pick(`#${val}`);
  }, [pick]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="flex items-center gap-2 w-full hover:bg-accent rounded-md p-1 -m-1 transition-colors"
        onClick={() => setOpen((p) => !p)}
        aria-label={`Edit ${label} color`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <div
          className="color-swatch w-6 h-6 rounded flex-shrink-0"
          style={{ background: safeColor }}
        />
        <span className="text-xs font-mono text-muted-foreground flex-1 text-left tracking-wide">
          {safeColor.toUpperCase()}
        </span>
        <ChevronDown size={12} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <Portal>
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.94, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -6 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-[10000] w-[224px] glass rounded-xl shadow-2xl shadow-black/80 p-3 flex flex-col gap-3"
              style={{
                top: popoverPos.top,
                left: popoverPos.left,
              }}
              role="dialog"
              aria-label="Color picker"
            >
              <SVPicker hue={h} s={s} l={l} onChange={handleSLChange} />
              <HueSlider hue={h} onChange={handleHueChange} />

              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-lg border border-border flex-shrink-0"
                  style={{ background: safeColor }}
                />
                <div className="prop-input flex-1 h-9">
                  <span className="prop-input-label">#</span>
                  <input
                    type="text"
                    value={hexInput.replace('#', '')}
                    onChange={(e) => handleHexInput(e.target.value)}
                    maxLength={6}
                    className="!text-left !pl-2 font-mono text-sm"
                    placeholder="HEX"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 bg-muted/30 p-2 rounded-lg border border-border/40">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{mode}</span>
                  <button
                    onClick={() => setMode(m => m === 'RGB' ? 'HSL' : 'RGB')}
                    className="text-[9px] uppercase font-bold text-primary hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors"
                  >
                    Switch
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {mode === 'RGB' ? (
                    <>
                      {[
                        { label: 'R', value: r, onChange: (v) => handleRgbChange(v, g, b) },
                        { label: 'G', value: g, onChange: (v) => handleRgbChange(r, v, b) },
                        { label: 'B', value: b, onChange: (v) => handleRgbChange(r, g, v) },
                      ].map(({ label: lbl, value, onChange: onCh }) => (
                        <div key={lbl} className="prop-input h-8 overflow-hidden">
                          <span className="prop-input-label !w-3.5 !pl-1.5 flex items-center justify-center">{lbl}</span>
                          <input
                            type="number"
                            min={0}
                            max={255}
                            value={value}
                            onChange={(e) => onCh(Number(e.target.value))}
                            className="!pl-3.5 text-center"
                          />
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { label: 'H', value: h, max: 360, onChange: (v) => handleHueChange(v) },
                        { label: 'S', value: s, max: 100, onChange: (v) => handleSLChange(v, l) },
                        { label: 'L', value: l, max: 100, onChange: (v) => handleSLChange(s, v) },
                      ].map(({ label: lbl, value, max, onChange: onCh }) => (
                        <div key={lbl} className="prop-input h-8 overflow-hidden">
                          <span className="prop-input-label !w-3.5 !pl-1.5 flex items-center justify-center">{lbl}</span>
                          <input
                            type="number"
                            min={0}
                            max={max}
                            value={value}
                            onChange={(e) => onCh(Number(e.target.value))}
                            className="!pl-3.5 text-center"
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="panel-section-header mb-1.5 !text-[10px]">Presets</p>
                <div className="grid grid-cols-8 gap-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="w-6 h-6 rounded border border-border/80 transition-transform hover:scale-110 focus-visible:ring-1 focus-visible:ring-primary"
                      style={{ background: c }}
                      onClick={() => pick(c)}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>

              {recent.length > 0 && (
                <div>
                  <p className="panel-section-header mb-1.5 !text-[10px]">Recent</p>
                  <div className="flex gap-1 flex-wrap">
                    {recent.slice(0, 8).map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="w-6 h-6 rounded border border-border/80 transition-transform hover:scale-110"
                        style={{ background: c }}
                        onClick={() => pick(c)}
                        aria-label={c}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ColorPicker;

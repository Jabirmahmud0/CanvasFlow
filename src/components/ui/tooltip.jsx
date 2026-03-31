import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PADDING = 8; // min gap from viewport edge

/**
 * Lightweight Tooltip — renders via Portal to escape overflow:hidden parents.
 * Clamps to viewport so it never overflows the screen edge.
 */
const Tooltip = ({
  children,
  label,
  shortcut,
  side = 'bottom',
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState({ cx: 0, cy: 0, rect: null });
  const [style, setStyle] = useState({});
  const anchorRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);

  const computeAnchor = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setAnchor({
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      rect,
    });
  }, []);

  const show = useCallback(() => {
    computeAnchor();
    timerRef.current = setTimeout(() => setVisible(true), 350);
  }, [computeAnchor]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  // Recalculate on scroll/resize while visible
  useEffect(() => {
    if (!visible) return;
    const update = () => computeAnchor();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [visible, computeAnchor]);

  // After tooltip mounts, measure its width and clamp position to viewport
  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current || !anchor.rect) return;
    const tipW = tooltipRef.current.offsetWidth;
    const tipH = tooltipRef.current.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { cx, cy, rect } = anchor;

    let left, top;

    if (side === 'bottom') {
      left = cx - tipW / 2;
      top  = rect.bottom + 6;
    } else if (side === 'top') {
      left = cx - tipW / 2;
      top  = rect.top - tipH - 6;
    } else if (side === 'left') {
      left = rect.left - tipW - 6;
      top  = cy - tipH / 2;
    } else { // right
      left = rect.right + 6;
      top  = cy - tipH / 2;
    }

    // Clamp within viewport
    left = Math.max(PADDING, Math.min(left, vw - tipW - PADDING));
    top  = Math.max(PADDING, Math.min(top,  vh - tipH - PADDING));

    setStyle({ position: 'fixed', zIndex: 9999, pointerEvents: 'none', left, top });
  }, [visible, anchor, side]);

  if (disabled || !label) return children;

  return (
    <span
      ref={anchorRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.1 }}
              style={style}
              className="tooltip-content"
              role="tooltip"
            >
              <span>{label}</span>
              {shortcut && <kbd className="ml-1.5">{shortcut}</kbd>}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </span>
  );
};

/**
 * ToolButton — icon-only button with integrated tooltip.
 */
export const ToolButton = React.forwardRef(({
  icon: Icon,
  label,
  shortcut,
  active = false,
  disabled = false,
  danger = false,
  size = 17,
  tooltipSide = 'bottom',
  className = '',
  onClick,
  ...rest
}, ref) => {
  const activeClass = danger
    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
    : active
    ? 'active'
    : '';

  return (
    <Tooltip label={label} shortcut={shortcut} side={tooltipSide} disabled={disabled}>
      <button
        ref={ref}
        type="button"
        className={`tool-btn ${activeClass} ${className}`}
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        {...rest}
      >
        <Icon size={size} strokeWidth={active ? 2.2 : 1.8} />
      </button>
    </Tooltip>
  );
});

ToolButton.displayName = 'ToolButton';

export default Tooltip;

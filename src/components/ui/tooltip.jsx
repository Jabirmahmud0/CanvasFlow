import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Lightweight Tooltip — no Radix dependency.
 * Shows on hover with optional keyboard shortcut.
 */
const Tooltip = ({
  children,
  label,
  shortcut,
  side = 'bottom',
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const positionClass = {
    bottom: 'top-full mt-1.5 left-1/2 -translate-x-1/2',
    top:    'bottom-full mb-1.5 left-1/2 -translate-x-1/2',
    left:   'right-full mr-1.5 top-1/2 -translate-y-1/2',
    right:  'left-full ml-1.5 top-1/2 -translate-y-1/2',
  }[side];

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), 350);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  if (disabled || !label) return children;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.1 }}
            className={`tooltip-content absolute z-[9999] pointer-events-none whitespace-nowrap ${positionClass}`}
            role="tooltip"
          >
            <span>{label}</span>
            {shortcut && <kbd className="ml-1.5">{shortcut}</kbd>}
          </motion.div>
        )}
      </AnimatePresence>
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

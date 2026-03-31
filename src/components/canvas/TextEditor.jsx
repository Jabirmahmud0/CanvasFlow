import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/hooks/useTheme';

const TextEditor = ({ x, y, text, fontSize, fontFamily, fill, width, zoom, onClose }) => {
  const textareaRef = useRef(null);
  const [value, setValue] = useState(text);
  const { theme } = useTheme();
  
  const bgColor = theme === 'light' ? 'rgba(248, 250, 252, 0.95)' : (theme === 'high-contrast' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(15, 23, 42, 0.95)');
  const borderColor = theme === 'light' ? '#6366F1' : (theme === 'high-contrast' ? '#FFFFFF' : '#4ECDC4');

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.select();

      // Auto-resize
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose(value, false); // false = don't save
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onClose(value, true); // true = save
      }
    };

    const handleClickOutside = (e) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target)) {
        onClose(value, true); // Save on click outside
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value, onClose]);

  const handleChange = (e) => {
    setValue(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // Calculate editor styles to match canvas text exactly
  const editorStyle = {
    position: 'fixed',
    left: `${x}px`,
    top: `${y}px`,
    fontSize: `${fontSize * zoom}px`,
    fontFamily: fontFamily,
    color: fill,
    background: bgColor,
    border: `2px solid ${borderColor}`,
    borderRadius: '6px',
    padding: '6px 10px',
    outline: 'none',
    resize: 'none',
    overflow: 'hidden',
    minWidth: width ? `${width * zoom}px` : '120px',
    minHeight: `${fontSize * zoom * 1.5}px`,
    lineHeight: '1.3',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    zIndex: 1000,
    boxShadow: theme === 'light' ? '0 4px 20px rgba(0, 0, 0, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.5)',
    fontWeight: '400',
    letterSpacing: 'normal',
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 1000,
        pointerEvents: 'none', // Let clicks pass through container
      }}
    >
      {/* Visual indicator that text is being edited */}
      <div
        style={{
          position: 'absolute',
          inset: '-4px',
          border: `2px solid ${borderColor}`,
          borderRadius: '6px',
          animation: 'pulse 1.5s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        style={editorStyle}
        className="text-editor-input"
      />
    </div>,
    document.body
  );
};

export default TextEditor;

import { useEffect, useCallback } from 'react';

/**
 * Custom hook to manage keyboard navigation with proper focus handling
 * Provides accessible keyboard shortcuts with focus context awareness
 */
export const useKeyboardNavigation = (handlers, options = {}) => {
  const { ignoreInputFields = true, preventDefault = true } = options;

  const handleKeyDown = useCallback((e) => {
    // Ignore if typing in input fields (optional)
    if (ignoreInputFields) {
      const tagName = e.target.tagName.toLowerCase();
      const isEditable = e.target.isContentEditable || 
        tagName === 'input' || 
        tagName === 'textarea' || 
        tagName === 'select';

      if (isEditable && e.key !== 'Escape') {
        return;
      }
    }

    const { key, ctrlKey, shiftKey, metaKey, altKey } = e;
    const isCtrl = ctrlKey || metaKey;

    // Find matching handler
    for (const [combo, handler] of Object.entries(handlers)) {
      const [mainKey, ...modifiers] = combo.toLowerCase().split('+');
      const needsCtrl = modifiers.includes('ctrl') || modifiers.includes('meta');
      const needsShift = modifiers.includes('shift');
      const needsAlt = modifiers.includes('alt');

      const matches = (
        key.toLowerCase() === mainKey &&
        (needsCtrl ? isCtrl : !isCtrl) &&
        (needsShift ? shiftKey : !shiftKey) &&
        (needsAlt ? altKey : !altKey)
      );

      if (matches && handler) {
        if (preventDefault) {
          e.preventDefault();
        }
        handler(e);
        return;
      }
    }
  }, [handlers, ignoreInputFields, preventDefault]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return handleKeyDown;
};

/**
 * Hook to manage focus restoration after an action
 */
export const useFocusRestore = (triggerRef) => {
  useEffect(() => {
    const trigger = triggerRef?.current;
    if (!trigger) return;

    const previousFocus = document.activeElement;

    return () => {
      // Restore focus when component unmounts
      if (previousFocus && previousFocus.focus) {
        previousFocus.focus();
      }
    };
  }, [triggerRef]);
};

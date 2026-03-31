import { useCallback } from 'react';
import * as analytics from '@/lib/analytics';

/**
 * React Hook for Analytics
 * Provides typed methods for tracking events in components
 */
export const useAnalytics = () => {
  // Generic event tracking
  const trackEvent = useCallback((eventName, params = {}) => {
    analytics.trackEvent(eventName, params);
  }, []);

  // CanvasFlow-specific tracking methods
  const trackToolUse = useCallback((toolName) => {
    analytics.trackToolUse(toolName);
  }, []);

  const trackElementCreate = useCallback((elementType) => {
    analytics.trackElementCreate(elementType);
  }, []);

  const trackElementDelete = useCallback((count = 1) => {
    analytics.trackElementDelete(count);
  }, []);

  const trackExport = useCallback((format) => {
    analytics.trackExport(format);
  }, []);

  const trackZoom = useCallback((zoomLevel) => {
    analytics.trackEvent('zoom_change', { zoom: zoomLevel });
  }, []);

  const trackPanelToggle = useCallback((panelName, isVisible) => {
    analytics.trackEvent('panel_toggle', { panel: panelName, visible: isVisible });
  }, []);

  const trackKeyboardShortcut = useCallback((shortcut) => {
    analytics.trackEvent('keyboard_shortcut', { shortcut });
  }, []);

  const trackAction = useCallback((actionName, metadata = {}) => {
    analytics.trackEvent('action', { name: actionName, ...metadata });
  }, []);

  return {
    trackEvent,
    trackToolUse,
    trackElementCreate,
    trackElementDelete,
    trackExport,
    trackZoom,
    trackPanelToggle,
    trackKeyboardShortcut,
    trackAction,
  };
};

export default useAnalytics;

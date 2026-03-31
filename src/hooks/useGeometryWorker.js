import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to use the geometry web worker
 * Provides methods for offloading heavy geometry calculations
 */
export const useGeometryWorker = () => {
  const workerRef = useRef(null);
  const callbacksRef = useRef(new Map());
  const messageIdRef = useRef(0);

  // Initialize worker
  useEffect(() => {
    // Create worker from URL (Vite will handle this)
    workerRef.current = new Worker(
      new URL('@/workers/geometry.worker.js', import.meta.url),
      { type: 'module' }
    );

    // Handle messages from worker
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      
      // Handle errors
      if (type === 'ERROR') {
        console.error('[GeometryWorker] Error:', payload.error);
        return;
      }

      // Call the appropriate callback
      if (payload.requestId !== undefined) {
        const callback = callbacksRef.current.get(payload.requestId);
        if (callback) {
          callback(payload);
          callbacksRef.current.delete(payload.requestId);
        }
      }
    };

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      callbacksRef.current.clear();
    };
  }, []);

  // Send message to worker
  const sendToWorker = useCallback((type, payload) => {
    if (!workerRef.current) {
      console.warn('[GeometryWorker] Worker not initialized');
      return Promise.reject(new Error('Worker not initialized'));
    }

    return new Promise((resolve) => {
      const requestId = messageIdRef.current++;
      callbacksRef.current.set(requestId, resolve);

      workerRef.current.postMessage({
        type,
        payload: { ...payload, requestId },
      });
    });
  }, []);

  // Public API
  const calculateSmartGuides = useCallback((element, allElements, threshold = 5) => {
    return sendToWorker('CALCULATE_SMART_GUIDES', { element, allElements, threshold });
  }, [sendToWorker]);

  const calculateBounds = useCallback((elements) => {
    return sendToWorker('CALCULATE_BOUNDS', { elements });
  }, [sendToWorker]);

  const findElementsAtPoint = useCallback((point, elements) => {
    return sendToWorker('FIND_ELEMENTS_AT_POINT', { point, elements });
  }, [sendToWorker]);

  const calculateStarPath = useCallback((cx, cy, numPoints, innerRadius, outerRadius) => {
    return sendToWorker('CALCULATE_STAR_PATH', { cx, cy, numPoints, innerRadius, outerRadius });
  }, [sendToWorker]);

  const calculatePolygonPath = useCallback((cx, cy, sides, radius) => {
    return sendToWorker('CALCULATE_POLYGON_PATH', { cx, cy, sides, radius });
  }, [sendToWorker]);

  const generateThumbnail = useCallback((width, height, elements) => {
    return new Promise((resolve, reject) => {
      const offscreenWorker = new Worker(
        new URL('@/workers/offscreen.worker.js', import.meta.url),
        { type: 'module' }
      );
      offscreenWorker.onmessage = (e) => {
        if (e.data.error) reject(new Error(e.data.error));
        else resolve(e.data.imageBitmap);
        offscreenWorker.terminate();
      };
      offscreenWorker.postMessage({ id: 'thumb', type: 'thumbnail', width, height, elements });
    });
  }, []);

  return {
    calculateSmartGuides,
    calculateBounds,
    findElementsAtPoint,
    calculateStarPath,
    calculatePolygonPath,
    generateThumbnail,
    isReady: workerRef.current !== null,
  };
};

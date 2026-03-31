import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '@/store/useCanvasStore';

describe('useCanvasStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const store = useCanvasStore.getState();
    useCanvasStore.setState({
      ...store,
      elements: [],
      selectedIds: [],
      zoom: 1,
      offset: { x: 0, y: 0 },
      history: [],
      historyIndex: -1,
    });
  });

  describe('Zoom actions', () => {
    it('should zoom in', () => {
      const { zoomIn, zoom } = useCanvasStore.getState();
      const initialZoom = zoom;
      
      zoomIn();
      
      const { zoom: newZoom } = useCanvasStore.getState();
      expect(newZoom).toBeGreaterThan(initialZoom);
    });

    it('should zoom out', () => {
      const { zoomOut, zoom } = useCanvasStore.getState();
      const initialZoom = zoom;
      
      zoomOut();
      
      const { zoom: newZoom } = useCanvasStore.getState();
      expect(newZoom).toBeLessThan(initialZoom);
    });

    it('should respect min/max zoom limits', () => {
      const { setZoom } = useCanvasStore.getState();
      
      setZoom(0.01); // Below min
      expect(useCanvasStore.getState().zoom).toBeGreaterThanOrEqual(0.05);
      
      setZoom(10); // Above max
      expect(useCanvasStore.getState().zoom).toBeLessThanOrEqual(5);
    });

    it('should reset zoom', () => {
      const { setZoom, resetZoom } = useCanvasStore.getState();
      setZoom(2);
      
      resetZoom();
      
      expect(useCanvasStore.getState().zoom).toBe(1);
    });
  });

  describe('Element actions', () => {
    it('should add an element', () => {
      const { addElement, elements } = useCanvasStore.getState();
      
      const id = addElement({
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      
      const { elements: newElements } = useCanvasStore.getState();
      expect(newElements.length).toBeGreaterThan(elements.length);
      expect(newElements.find((el) => el.id === id)).toBeDefined();
    });

    it('should select an element', () => {
      const { addElement, selectElement } = useCanvasStore.getState();
      
      const id = addElement({
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      
      selectElement(id);
      
      const { selectedIds } = useCanvasStore.getState();
      expect(selectedIds).toContain(id);
    });

    it('should update an element', () => {
      const { addElement, updateElement } = useCanvasStore.getState();
      
      const id = addElement({
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      
      updateElement(id, { x: 50 });
      
      const element = useCanvasStore.getState().elements.find((el) => el.id === id);
      expect(element.x).toBe(50);
    });

    it('should delete an element', () => {
      const { addElement, deleteElement } = useCanvasStore.getState();
      
      const id = addElement({
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      
      const elementsBefore = useCanvasStore.getState().elements.length;
      deleteElement(id);
      
      const { elements: newElements } = useCanvasStore.getState();
      expect(newElements.length).toBe(elementsBefore - 1);
      expect(newElements.find((el) => el.id === id)).toBeUndefined();
    });
  });

  describe('Selection actions', () => {
    it('should select all elements', () => {
      const { addElement, selectAll } = useCanvasStore.getState();
      
      addElement({ type: 'rectangle', x: 0, y: 0, width: 100, height: 100 });
      addElement({ type: 'circle', x: 50, y: 50, radius: 25 });
      
      selectAll();
      
      const { selectedIds, elements } = useCanvasStore.getState();
      expect(selectedIds).toHaveLength(elements.length);
    });

    it('should clear selection', () => {
      const { addElement, selectElement, clearSelection } = useCanvasStore.getState();
      
      const id = addElement({
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      selectElement(id);
      
      clearSelection();
      
      const { selectedIds } = useCanvasStore.getState();
      expect(selectedIds).toHaveLength(0);
    });
  });

  describe('History actions', () => {
    it('should add to history', () => {
      const { addElement, addToHistory } = useCanvasStore.getState();
      
      addElement({ type: 'rectangle', x: 0, y: 0, width: 100, height: 100 });
      addToHistory();
      
      const { history } = useCanvasStore.getState();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should undo', () => {
      const { addElement, addToHistory, undo } = useCanvasStore.getState();
      
      addElement({ type: 'rectangle', x: 0, y: 0, width: 100, height: 100 });
      addToHistory();
      addToHistory(); // Add another state so we can undo
      
      undo();
      
      const { historyIndex } = useCanvasStore.getState();
      expect(historyIndex).toBeLessThan(useCanvasStore.getState().history.length - 1);
    });

    it('should return correct canUndo state', () => {
      const { canUndo, addToHistory } = useCanvasStore.getState();
      
      // Initially at index -1, can't undo
      expect(canUndo()).toBe(false);
      
      addToHistory(); // Now at index 0
      
      // At index 0, still can't undo (no previous state)
      expect(useCanvasStore.getState().canUndo()).toBe(false);
      
      addToHistory(); // Now at index 1
      
      // Now we can undo
      expect(useCanvasStore.getState().canUndo()).toBe(true);
    });

    it('should return correct canRedo state', () => {
      const { canRedo, addToHistory, undo } = useCanvasStore.getState();
      
      // Initially can't redo
      expect(canRedo()).toBe(false);
      
      addToHistory(); // State 1
      addToHistory(); // State 2
      
      // At latest state, can't redo
      expect(useCanvasStore.getState().canRedo()).toBe(false);
      
      undo(); // Go back to state 1
      
      // Now we can redo
      expect(useCanvasStore.getState().canRedo()).toBe(true);
    });
  });

  describe('Clipboard actions', () => {
    it('should copy selected elements', () => {
      const { addElement, selectElement, copy } = useCanvasStore.getState();
      
      const id = addElement({
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      selectElement(id);
      
      copy();
      
      const { clipboard } = useCanvasStore.getState();
      expect(clipboard).toHaveLength(1);
      expect(clipboard[0].id).toBe(id);
    });

    it('should paste elements', () => {
      const { addElement, selectElement, copy, paste } = useCanvasStore.getState();
      
      const id = addElement({
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      selectElement(id);
      copy();
      
      paste();
      
      const { elements } = useCanvasStore.getState();
      expect(elements).toHaveLength(2);
    });
  });
});

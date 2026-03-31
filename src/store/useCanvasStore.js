import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CANVAS, TOOLS, HISTORY, ELEMENT_TYPES } from '@/constants';

// Generate unique ID
const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Deep clone helper
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Initial state
const initialState = {
  // Canvas View State
  zoom: CANVAS.defaultZoom,
  offset: { x: 0, y: 0 },
  
  // Elements
  elements: [],
  
  // Selection
  selectedIds: [],
  
  // Tool
  activeTool: TOOLS.SELECT,
  
  // Drawing state
  isDrawing: false,
  drawingStart: null,
  drawingShape: null,
  
  // Transform state
  isTransforming: false,
  transformType: null, // 'move', 'resize', 'rotate'
  transformStart: null,
  transformInitial: {},
  
  // UI State
  showGrid: false,
  snapToGrid: true,
  showSmartGuides: true,
  canvasBackground: '#0F172A',
  
  // Editing
  editingElementId: null,
  
  // Clipboard
  clipboard: [],
  
  // History
  history: [],
  historyIndex: -1,
  
  // Groups
  groups: {},
  
  // Settings
  defaultFill: '#6366F1',
  defaultStroke: '#818CF8',
  defaultStrokeWidth: 2,
};

// Create store with selector subscription
export const useCanvasStore = create(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ============ View Actions ============
    
    setZoom: (zoom) => {
      const clampedZoom = Math.max(CANVAS.minZoom, Math.min(CANVAS.maxZoom, zoom));
      set({ zoom: clampedZoom });
    },
    
    zoomIn: () => {
      const { zoom } = get();
      const newZoom = Math.min(CANVAS.maxZoom, zoom + CANVAS.zoomStep);
      set({ zoom: newZoom });
    },
    
    zoomOut: () => {
      const { zoom } = get();
      const newZoom = Math.max(CANVAS.minZoom, zoom - CANVAS.zoomStep);
      set({ zoom: newZoom });
    },
    
    resetZoom: () => set({ zoom: CANVAS.defaultZoom, offset: { x: 0, y: 0 } }),
    
    setOffset: (offset) => set({ offset }),
    
    pan: (deltaX, deltaY) => {
      const { offset } = get();
      set({
        offset: {
          x: offset.x + deltaX,
          y: offset.y + deltaY,
        },
      });
    },

    centerCanvas: () => {
      const { elements } = get();
      if (elements.length === 0) {
        set({ offset: { x: 0, y: 0 }, zoom: 1 });
        return;
      }
      
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      
      elements.forEach((el) => {
        const width = el.width || el.radius * 2 || 100;
        const height = el.height || el.radius * 2 || 100;
        minX = Math.min(minX, el.x);
        maxX = Math.max(maxX, el.x + width);
        minY = Math.min(minY, el.y);
        maxY = Math.max(maxY, el.y + height);
      });
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      set({
        offset: { x: -centerX + window.innerWidth / 2, y: -centerY + window.innerHeight / 2 },
        zoom: 1,
      });
    },

    // ============ Element Actions ============
    
    addElement: (element) => {
      const newElement = {
        id: generateId(),
        ...element,
        rotation: element.rotation || 0,
        opacity: element.opacity ?? 1,
        visible: element.visible ?? true,
        locked: element.locked ?? false,
        createdAt: Date.now(),
      };
      
      set((state) => ({
        elements: [...state.elements, newElement],
        selectedIds: [newElement.id],
      }));
      
      get().addToHistory();
      return newElement.id;
    },
    
    addElements: (newElements) => {
      const elementsWithIds = newElements.map((el) => ({
        ...el,
        id: generateId(),
        rotation: el.rotation || 0,
        opacity: el.opacity ?? 1,
        visible: el.visible ?? true,
        locked: el.locked ?? false,
        createdAt: Date.now(),
      }));
      
      set((state) => ({
        elements: [...state.elements, ...elementsWithIds],
        selectedIds: elementsWithIds.map((el) => el.id),
      }));
      
      get().addToHistory();
      return elementsWithIds.map((el) => el.id);
    },
    
    updateElement: (id, updates) => {
      set((state) => ({
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, ...updates, updatedAt: Date.now() } : el
        ),
      }));
    },
    
    updateElements: (ids, updates) => {
      set((state) => ({
        elements: state.elements.map((el) =>
          ids.includes(el.id) ? { ...el, ...updates, updatedAt: Date.now() } : el
        ),
      }));
    },
    
    deleteElement: (id) => {
      set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        selectedIds: state.selectedIds.filter((sid) => sid !== id),
      }));
      get().addToHistory();
    },
    
    deleteSelected: () => {
      const { selectedIds } = get();
      if (selectedIds.length === 0) return;
      
      set((state) => ({
        elements: state.elements.filter((el) => !selectedIds.includes(el.id)),
        selectedIds: [],
      }));
      get().addToHistory();
    },
    
    duplicateSelected: () => {
      const { selectedIds, elements } = get();
      if (selectedIds.length === 0) return;
      
      const newElements = [];
      const newSelectedIds = [];
      
      selectedIds.forEach((id) => {
        const original = elements.find((el) => el.id === id);
        if (original) {
          const newElement = {
            ...deepClone(original),
            id: generateId(),
            x: original.x + 20,
            y: original.y + 20,
            createdAt: Date.now(),
          };
          delete newElement.updatedAt;
          newElements.push(newElement);
          newSelectedIds.push(newElement.id);
        }
      });
      
      set((state) => ({
        elements: [...state.elements, ...newElements],
        selectedIds: newSelectedIds,
      }));
      get().addToHistory();
    },
    
    bringToFront: () => {
      const { selectedIds, elements } = get();
      if (selectedIds.length === 0) return;
      
      const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
      const otherElements = elements.filter((el) => !selectedIds.includes(el.id));
      
      set({
        elements: [...otherElements, ...selectedElements],
      });
      get().addToHistory();
    },
    
    sendToBack: () => {
      const { selectedIds, elements } = get();
      if (selectedIds.length === 0) return;
      
      const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
      const otherElements = elements.filter((el) => !selectedIds.includes(el.id));
      
      set({
        elements: [...selectedElements, ...otherElements],
      });
      get().addToHistory();
    },
    
    bringForward: () => {
      const { selectedIds, elements } = get();
      if (selectedIds.length === 0) return;
      
      const newElements = [...elements];
      selectedIds.forEach((id) => {
        const index = newElements.findIndex((el) => el.id === id);
        if (index < newElements.length - 1) {
          const [el] = newElements.splice(index, 1);
          newElements.splice(index + 1, 0, el);
        }
      });
      
      set({ elements: newElements });
      get().addToHistory();
    },
    
    sendBackward: () => {
      const { selectedIds, elements } = get();
      if (selectedIds.length === 0) return;
      
      const newElements = [...elements];
      selectedIds.forEach((id) => {
        const index = newElements.findIndex((el) => el.id === id);
        if (index > 0) {
          const [el] = newElements.splice(index, 1);
          newElements.splice(index - 1, 0, el);
        }
      });
      
      set({ elements: newElements });
      get().addToHistory();
    },

    // ============ Selection Actions ============
    
    selectElement: (id, additive = false) => {
      if (additive) {
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        }));
      } else {
        set({ selectedIds: id ? [id] : [] });
      }
    },
    
    selectElements: (ids) => {
      set({ selectedIds: ids });
    },
    
    selectAll: () => {
      const { elements } = get();
      set({ selectedIds: elements.filter((el) => el.visible !== false).map((el) => el.id) });
    },
    
    clearSelection: () => set({ selectedIds: [], editingElementId: null }),
    
    invertSelection: () => {
      const { elements, selectedIds } = get();
      set({
        selectedIds: elements
          .filter((el) => el.visible !== false && !selectedIds.includes(el.id))
          .map((el) => el.id),
      });
    },
    
    getSelectedElements: () => {
      const { elements, selectedIds } = get();
      return elements.filter((el) => selectedIds.includes(el.id));
    },

    // ============ Tool Actions ============

    setActiveTool: (tool) => set({ activeTool: tool, editingElementId: null }),

    // ============ Drawing Actions ============
    
    startDrawing: (point, shapeType) => set({ 
      isDrawing: true, 
      drawingStart: point,
      drawingShape: shapeType,
    }),
    
    endDrawing: () => set({ 
      isDrawing: false, 
      drawingStart: null,
      drawingShape: null,
    }),

    // ============ Transform Actions ============
    
    startTransform: (type, point, initialData) => {
      set({
        isTransforming: true,
        transformType: type,
        transformStart: point,
        transformInitial: initialData,
      });
    },
    
    updateTransform: (currentPoint) => {
      const { isTransforming, transformType, transformStart, transformInitial, snapToGrid } = get();
      if (!isTransforming || !transformStart) return;
      
      const deltaX = currentPoint.x - transformStart.x;
      const deltaY = currentPoint.y - transformStart.y;
      
      if (transformType === 'move') {
        set((state) => ({
          elements: state.elements.map((el) => {
            if (state.selectedIds.includes(el.id)) {
              let newX = transformInitial[el.id].x + deltaX;
              let newY = transformInitial[el.id].y + deltaY;
              
              if (snapToGrid) {
                newX = Math.round(newX / CANVAS.gridSize) * CANVAS.gridSize;
                newY = Math.round(newY / CANVAS.gridSize) * CANVAS.gridSize;
              }
              
              return { ...el, x: newX, y: newY };
            }
            return el;
          }),
        }));
      } else if (transformType === 'resize') {
        const { elementId, handleIndex, initialBounds } = transformInitial;
        // Resize logic handled in component
      }
    },
    
    endTransform: () => {
      const { isTransforming } = get();
      if (isTransforming) {
        set({ 
          isTransforming: false, 
          transformType: null, 
          transformStart: null, 
          transformInitial: {} 
        });
        get().addToHistory();
      }
    },

    // ============ Text Editing ============
    
    startEditing: (elementId) => {
      set({ editingElementId: elementId });
    },
    
    endEditing: () => {
      set({ editingElementId: null });
      get().addToHistory();
    },
    
    updateText: (elementId, text) => {
      set((state) => ({
        elements: state.elements.map((el) =>
          el.id === elementId ? { ...el, text, updatedAt: Date.now() } : el
        ),
      }));
    },

    // ============ Clipboard Actions ============
    
    copy: () => {
      const { selectedIds, elements } = get();
      if (selectedIds.length === 0) return;
      
      const clipboardData = elements
        .filter((el) => selectedIds.includes(el.id))
        .map((el) => deepClone(el));
      
      set({ clipboard: clipboardData });
    },
    
    cut: () => {
      const { selectedIds, elements } = get();
      if (selectedIds.length === 0) return;
      
      const clipboardData = elements
        .filter((el) => selectedIds.includes(el.id))
        .map((el) => deepClone(el));
      
      set({
        clipboard: clipboardData,
        elements: elements.filter((el) => !selectedIds.includes(el.id)),
        selectedIds: [],
      });
      get().addToHistory();
    },
    
    paste: () => {
      const { clipboard } = get();
      if (clipboard.length === 0) return;
      
      const newElements = [];
      const newSelectedIds = [];
      
      clipboard.forEach((el) => {
        const newElement = {
          ...deepClone(el),
          id: generateId(),
          x: el.x + 30,
          y: el.y + 30,
          createdAt: Date.now(),
        };
        delete newElement.updatedAt;
        newElements.push(newElement);
        newSelectedIds.push(newElement.id);
      });
      
      set((state) => ({
        elements: [...state.elements, ...newElements],
        selectedIds: newSelectedIds,
      }));
      get().addToHistory();
    },

    // ============ UI Actions ============
    
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
    toggleSmartGuides: () => set((state) => ({ showSmartGuides: !state.showSmartGuides })),
    setCanvasBackground: (color) => set({ canvasBackground: color }),

    // ============ History Actions ============
    
    addToHistory: () => {
      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push({
          elements: deepClone(state.elements),
          timestamp: Date.now(),
        });
        
        if (newHistory.length > HISTORY.maxSteps) {
          newHistory.shift();
        }
        
        return {
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },
    
    undo: () => {
      set((state) => {
        if (state.historyIndex <= 0) return state;
        
        const newIndex = state.historyIndex - 1;
        const historyState = state.history[newIndex];
        
        return {
          elements: deepClone(historyState.elements),
          historyIndex: newIndex,
          selectedIds: [],
          editingElementId: null,
        };
      });
    },
    
    redo: () => {
      set((state) => {
        if (state.historyIndex >= state.history.length - 1) return state;
        
        const newIndex = state.historyIndex + 1;
        const historyState = state.history[newIndex];
        
        return {
          elements: deepClone(historyState.elements),
          historyIndex: newIndex,
          selectedIds: [],
          editingElementId: null,
        };
      });
    },
    
    canUndo: () => {
      const { historyIndex } = get();
      return historyIndex > 0;
    },
    
    canRedo: () => {
      const { historyIndex, history } = get();
      return historyIndex < history.length - 1;
    },

    // ============ Import/Export ============
    
    exportToJSON: () => {
      const { elements } = get();
      return JSON.stringify({
        version: '1.0',
        exportedAt: Date.now(),
        elements: deepClone(elements),
      }, null, 2);
    },
    
    importFromJSON: (jsonString) => {
      try {
        const data = JSON.parse(jsonString);
        if (data.elements && Array.isArray(data.elements)) {
          const importedElements = data.elements.map((el) => ({
            ...el,
            id: generateId(),
            createdAt: Date.now(),
          }));
          
          set({
            elements: importedElements,
            selectedIds: [],
          });
          get().addToHistory();
          return true;
        }
      } catch (e) {
        console.error('Import failed:', e);
      }
      return false;
    },
    
    clearCanvas: () => {
      set({
        elements: [],
        selectedIds: [],
      });
      get().addToHistory();
    },

    // ============ Utility Actions ============
    
    getElementById: (id) => {
      const { elements } = get();
      return elements.find((el) => el.id === id);
    },
    
    getBounds: () => {
      const { selectedIds, elements } = get();
      if (selectedIds.length === 0) return null;
      
      const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
      if (selectedElements.length === 0) return null;
      
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      
      selectedElements.forEach((el) => {
        const width = el.width || el.radius * 2 || (el.text ? el.text.length * (el.fontSize || 16) : 100);
        const height = el.height || el.radius * 2 || (el.fontSize || 16) * 1.5;
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + width);
        maxY = Math.max(maxY, el.y + height);
      });
      
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    },
    
    getSmartGuides: (elementId) => {
      const { elements, showSmartGuides } = get();
      if (!showSmartGuides) return [];
      
      const element = elements.find((el) => el.id === elementId);
      if (!element) return [];
      
      const guides = [];
      const threshold = 5;
      
      elements.forEach((other) => {
        if (other.id === elementId) return;
        
        const ew = element.width || element.radius * 2 || 100;
        const eh = element.height || element.radius * 2 || 100;
        const ow = other.width || other.radius * 2 || 100;
        const oh = other.height || other.radius * 2 || 100;
        
        // Left align
        if (Math.abs(element.x - other.x) < threshold) {
          guides.push({ type: 'vertical', x: other.x });
        }
        // Right align
        if (Math.abs((element.x + ew) - (other.x + ow)) < threshold) {
          guides.push({ type: 'vertical', x: other.x + ow - ew });
        }
        // Center align horizontal
        if (Math.abs((element.x + ew / 2) - (other.x + ow / 2)) < threshold) {
          guides.push({ type: 'vertical', x: other.x + ow / 2 - ew / 2 });
        }
        // Top align
        if (Math.abs(element.y - other.y) < threshold) {
          guides.push({ type: 'horizontal', y: other.y });
        }
        // Bottom align
        if (Math.abs((element.y + eh) - (other.y + oh)) < threshold) {
          guides.push({ type: 'horizontal', y: other.y + oh - eh });
        }
        // Center align vertical
        if (Math.abs((element.y + eh / 2) - (other.y + oh / 2)) < threshold) {
          guides.push({ type: 'horizontal', y: other.y + oh / 2 - eh / 2 });
        }
      });
      
      return guides;
    },

    // Initialize with empty canvas (default)
    initialize: () => {
      set({
        elements: [],
        selectedIds: [],
      });

      // Add initial empty state to history
      set((state) => ({
        history: [{ elements: [], timestamp: Date.now() }],
        historyIndex: 0,
      }));
    },

    // Initialize with sample data (for demos/tutorials)
    initializeWithSamples: () => {
      const sampleElements = [
        // Header text
        {
          id: generateId(),
          type: 'text',
          x: 300,
          y: 50,
          text: 'CanvasFlow Editor',
          fontSize: 48,
          fill: '#F8FAFC',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'bold',
          createdAt: Date.now(),
        },
        // Subtitle
        {
          id: generateId(),
          type: 'text',
          x: 320,
          y: 110,
          text: 'Professional Infinite Canvas',
          fontSize: 18,
          fill: '#94A3B8',
          fontFamily: 'Inter, sans-serif',
          createdAt: Date.now(),
        },
        // Main rectangle
        {
          id: generateId(),
          type: 'rectangle',
          x: 100,
          y: 200,
          width: 280,
          height: 180,
          fill: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          stroke: '#818CF8',
          strokeWidth: 3,
          cornerRadius: 12,
          createdAt: Date.now(),
        },
        // Secondary rectangle
        {
          id: generateId(),
          type: 'rectangle',
          x: 450,
          y: 200,
          width: 200,
          height: 150,
          fill: '#1E293B',
          stroke: '#334155',
          strokeWidth: 2,
          cornerRadius: 8,
          createdAt: Date.now(),
        },
        // Accent circle
        {
          id: generateId(),
          type: 'circle',
          x: 750,
          y: 280,
          radius: 60,
          fill: '#22C55E',
          stroke: '#4ADE80',
          strokeWidth: 3,
          createdAt: Date.now(),
        },
        // Small accent circles
        {
          id: generateId(),
          type: 'circle',
          x: 200,
          y: 480,
          radius: 40,
          fill: '#F59E0B',
          stroke: '#FBBF24',
          strokeWidth: 2,
          createdAt: Date.now(),
        },
        {
          id: generateId(),
          type: 'circle',
          x: 320,
          y: 480,
          radius: 40,
          fill: '#EF4444',
          stroke: '#F87171',
          strokeWidth: 2,
          createdAt: Date.now(),
        },
        {
          id: generateId(),
          type: 'circle',
          x: 440,
          y: 480,
          radius: 40,
          fill: '#3B82F6',
          stroke: '#60A5FA',
          strokeWidth: 2,
          createdAt: Date.now(),
        },
        // Info card
        {
          id: generateId(),
          type: 'rectangle',
          x: 550,
          y: 420,
          width: 250,
          height: 120,
          fill: '#0F172A',
          stroke: '#475569',
          strokeWidth: 1,
          cornerRadius: 8,
          createdAt: Date.now(),
        },
        // Info text
        {
          id: generateId(),
          type: 'text',
          x: 570,
          y: 450,
          text: 'Features:',
          fontSize: 16,
          fill: '#CBD5E1',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '600',
          createdAt: Date.now(),
        },
        {
          id: generateId(),
          type: 'text',
          x: 570,
          y: 475,
          text: '• Pan & Zoom (Space + Drag)',
          fontSize: 13,
          fill: '#94A3B8',
          fontFamily: 'Inter, sans-serif',
          createdAt: Date.now(),
        },
        {
          id: generateId(),
          type: 'text',
          x: 570,
          y: 495,
          text: '• Draw Shapes (R, C, T)',
          fontSize: 13,
          fill: '#94A3B8',
          fontFamily: 'Inter, sans-serif',
          createdAt: Date.now(),
        },
        {
          id: generateId(),
          type: 'text',
          x: 570,
          y: 515,
          text: '• Undo/Redo (Ctrl+Z/Y)',
          fontSize: 13,
          fill: '#94A3B8',
          fontFamily: 'Inter, sans-serif',
          createdAt: Date.now(),
        },
        // Arrow line
        {
          id: generateId(),
          type: 'arrow',
          x: 400,
          y: 380,
          points: [0, 0, 150, 0],
          stroke: '#6366F1',
          strokeWidth: 3,
          pointerLength: 15,
          pointerWidth: 10,
          createdAt: Date.now(),
        },
        // Star shape
        {
          id: generateId(),
          type: 'star',
          x: 700,
          y: 450,
          numPoints: 5,
          innerRadius: 25,
          outerRadius: 50,
          fill: '#F59E0B',
          stroke: '#FBBF24',
          strokeWidth: 2,
          createdAt: Date.now(),
        },
        // Polygon
        {
          id: generateId(),
          type: 'polygon',
          x: 850,
          y: 200,
          sides: 6,
          radius: 60,
          fill: '#EC4899',
          stroke: '#F472B6',
          strokeWidth: 2,
          createdAt: Date.now(),
        },
        // Line
        {
          id: generateId(),
          type: 'line',
          x: 150,
          y: 600,
          points: [0, 0, 200, 100],
          stroke: '#64748B',
          strokeWidth: 2,
          dash: [10, 5],
          createdAt: Date.now(),
        },
        // More decorative elements
        {
          id: generateId(),
          type: 'rectangle',
          x: 50,
          y: 50,
          width: 80,
          height: 80,
          fill: 'transparent',
          stroke: '#334155',
          strokeWidth: 1,
          dash: [5, 5],
          createdAt: Date.now(),
        },
        {
          id: generateId(),
          type: 'text',
          x: 100,
          y: 650,
          text: 'Double-click text to edit',
          fontSize: 14,
          fill: '#64748B',
          fontFamily: 'Inter, sans-serif',
          fontStyle: 'italic',
          createdAt: Date.now(),
        },
      ];

      set({
        elements: sampleElements,
        selectedIds: [],
      });

      // Add initial state to history
      set((state) => ({
        history: [{ elements: deepClone(sampleElements), timestamp: Date.now() }],
        historyIndex: 0,
      }));
    },
  }))
);

// Selectors for better performance
export const selectZoom = (state) => state.zoom;
export const selectOffset = (state) => state.offset;
export const selectElements = (state) => state.elements;
export const selectSelectedIds = (state) => state.selectedIds;
export const selectActiveTool = (state) => state.activeTool;
export const selectShowGrid = (state) => state.showGrid;
export const selectSnapToGrid = (state) => state.snapToGrid;
export const selectEditingElementId = (state) => state.editingElementId;

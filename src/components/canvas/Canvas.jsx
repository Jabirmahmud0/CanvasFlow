import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Line as KonvaLine, Group, Text, Circle, Star, RegularPolygon } from 'react-konva';
import { useCanvasStore } from '@/store/useCanvasStore';
import { TOOLS, COLORS, CANVAS, DEFAULT_PROPERTIES } from '@/constants';
import { useGeometryWorker } from '@/hooks/useGeometryWorker';
import { useTheme } from '@/hooks/useTheme';
import Grid from './Grid';
import CanvasElement from './CanvasElement';
import TextEditor from './TextEditor';

// Smart Guides Component
const SmartGuides = ({ guides, zoom }) => {
  if (!guides || guides.length === 0) return null;
  
  return (
    <Group>
      {guides.map((guide, index) => (
        <KonvaLine
          key={index}
          points={
            guide.type === 'vertical'
              ? [guide.x, -10000, guide.x, 10000]
              : [-10000, guide.y, 10000, guide.y]
          }
          stroke={COLORS.smartGuide}
          strokeWidth={1 / zoom}
          dash={[5 / zoom, 5 / zoom]}
          opacity={0.8}
        />
      ))}
    </Group>
  );
};

// Drawing Preview Component - Shows actual shape being drawn
const DrawingPreview = ({ tool, start, current, zoom }) => {
  if (!start || !current) return null;
  
  const width = current.x - start.x;
  const height = current.y - start.y;
  const absWidth = Math.abs(width);
  const absHeight = Math.abs(height);
  const x = width > 0 ? start.x : current.x;
  const y = height > 0 ? start.y : current.y;
  
  const previewProps = {
    opacity: 0.3,
    stroke: COLORS.accentPrimary,
    strokeWidth: 2 / zoom,
    dash: [5 / zoom, 5 / zoom],
  };

  switch (tool) {
    case TOOLS.RECTANGLE:
      return (
        <Rect
          x={x}
          y={y}
          width={absWidth}
          height={absHeight}
          fill={DEFAULT_PROPERTIES.rectangle.fill}
          {...previewProps}
        />
      );
      
    case TOOLS.CIRCLE:
      return (
        <Circle
          x={start.x + width / 2}
          y={start.y + height / 2}
          radius={Math.min(absWidth, absHeight) / 2}
          fill={DEFAULT_PROPERTIES.circle.fill}
          {...previewProps}
        />
      );
      
    case TOOLS.LINE:
      return (
        <KonvaLine
          points={[start.x, start.y, current.x, current.y]}
          stroke={DEFAULT_PROPERTIES.line.stroke}
          strokeWidth={DEFAULT_PROPERTIES.line.strokeWidth / zoom}
          lineCap="round"
        />
      );
      
    case TOOLS.ARROW:
      // Simple line for arrow preview
      return (
        <KonvaLine
          points={[start.x, start.y, current.x, current.y]}
          stroke={DEFAULT_PROPERTIES.arrow.stroke}
          strokeWidth={DEFAULT_PROPERTIES.arrow.strokeWidth / zoom}
          lineCap="round"
        />
      );
      
    case TOOLS.STAR:
      return (
        <Star
          x={start.x + width / 2}
          y={start.y + height / 2}
          numPoints={DEFAULT_PROPERTIES.star.numPoints}
          innerRadius={Math.min(absWidth, absHeight) / 4}
          outerRadius={Math.min(absWidth, absHeight) / 2}
          fill={DEFAULT_PROPERTIES.star.fill}
          {...previewProps}
        />
      );
      
    case TOOLS.POLYGON:
      return (
        <RegularPolygon
          x={start.x + width / 2}
          y={start.y + height / 2}
          sides={DEFAULT_PROPERTIES.polygon.sides}
          radius={Math.min(absWidth, absHeight) / 2}
          fill={DEFAULT_PROPERTIES.polygon.fill}
          {...previewProps}
        />
      );
      
    default:
      return null;
  }
};

const Canvas = ({ width, height }) => {
  const stageRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const [smartGuides, setSmartGuides] = useState([]);
  const [textEditor, setTextEditor] = useState(null);
  const [drawingCurrent, setDrawingCurrent] = useState(null);
  const [isErasing, setIsErasing] = useState(false);

  // Get theme for light/dark mode
  const { theme, canvasBackground: themeCanvasBg } = useTheme();

  // Initialize geometry worker
  const { calculateSmartGuides: calculateSmartGuidesWorker, isReady: workerReady } = useGeometryWorker();

  // Get state from store
  const {
    zoom,
    offset,
    elements,
    selectedIds,
    activeTool,
    isDrawing,
    drawingStart,
    drawingShape,
    showGrid,
    snapToGrid,
    showSmartGuides,
    canvasBackground,
    editingElementId,
    setZoom,
    setOffset,
    pan,
    addElement,
    selectElement,
    clearSelection,
    startDrawing,
    endDrawing,
    updateElement,
    getBounds,
    getSmartGuides: getSmartGuidesFromStore,
    startEditing,
    endEditing,
    addToHistory,
    setActiveTool,
    deleteElement,
  } = useCanvasStore();

  // Convert screen to world coordinates
  const screenToWorld = useCallback((screenX, screenY) => {
    return {
      x: (screenX - offset.x) / zoom,
      y: (screenY - offset.y) / zoom,
    };
  }, [offset, zoom]);

  // Convert world to screen coordinates
  const worldToScreen = useCallback((worldX, worldY) => {
    return {
      x: worldX * zoom + offset.x,
      y: worldY * zoom + offset.y,
    };
  }, [offset, zoom]);

  // Handle wheel zoom
  const rafRef = useRef(null);
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      const stage = stageRef.current;
      if (!stage) return;

      // Access fresh state directly instead of via closure to avoid strict dependency loop
      const oldScale = useCanvasStore.getState().zoom;
      const cachedOffset = useCanvasStore.getState().offset;
      const pointer = stage.getPointerPosition();
      
      const mousePointTo = {
        x: (pointer.x - cachedOffset.x) / oldScale,
        y: (pointer.y - cachedOffset.y) / oldScale,
      };

      const newScale = e.evt.deltaY > 0 
        ? Math.max(CANVAS.minZoom, oldScale - CANVAS.zoomStep)
        : Math.min(CANVAS.maxZoom, oldScale + CANVAS.zoomStep);

      const newOffset = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setZoom(newScale);
      setOffset(newOffset);
    });
  }, [setZoom, setOffset]);

  // Handle mouse down
  const handleMouseDown = useCallback((e) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    const worldPos = screenToWorld(pointer.x, pointer.y);

    // Middle mouse button or space+click for panning
    if (e.evt.button === 1 || (e.evt.button === 0 && activeTool === TOOLS.PAN)) {
      setIsPanning(true);
      setPanStart({ x: pointer.x, y: pointer.y });
      return;
    }

    // Eraser mode
    if (activeTool === TOOLS.ERASER) {
      setIsErasing(true);
      const intersection = stage.getIntersection(pointer);
      if (intersection && intersection !== stage) {
        // Find the element node (could be nested inside a Group, so we search for a node with an ID)
        const id = intersection.id();
        if (id) deleteElement(id);
      }
      return;
    }

    // Drawing mode
    if ([TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.LINE, TOOLS.ARROW, TOOLS.STAR, TOOLS.POLYGON].includes(activeTool)) {
      startDrawing(worldPos, activeTool);
      setDrawingCurrent(worldPos);
      return;
    }

    // Text tool - create text immediately
    if (activeTool === TOOLS.TEXT) {
      const newElement = {
        type: 'text',
        x: worldPos.x,
        y: worldPos.y,
        text: 'Double-click to edit',
        fontSize: 16,
        fill: '#F8FAFC',
        fontFamily: 'Inter, sans-serif',
      };

      const id = addElement(newElement);

      // Switch to select tool after adding
      setActiveTool(TOOLS.SELECT);

      // Start editing immediately
      setTimeout(() => {
        startEditing(id);
        const textEl = elements.find(el => el.id === id) || newElement;
        const screenPos = worldToScreen(textEl.x, textEl.y);
        setTextEditor({
          id,
          x: screenPos.x,
          y: screenPos.y,
          text: textEl.text,
          fontSize: (textEl.fontSize || 16) * zoom,
          fontFamily: textEl.fontFamily || 'Inter, sans-serif',
          fill: textEl.fill || '#F8FAFC',
        });
      }, 50);
      return;
    }

    // Selection mode - check if clicked on empty space
    if (e.target === stage) {
      // Only clear selection if not holding Shift (multi-select)
      // Don't clear if we're about to start drawing
      if (!e.evt.shiftKey && !isDrawing) {
        clearSelection();
      }

      // Start selection rectangle (only in SELECT tool)
      if (activeTool === TOOLS.SELECT) {
        setSelectionRect({
          x: worldPos.x,
          y: worldPos.y,
          width: 0,
          height: 0,
        });
      }
    }
  }, [activeTool, screenToWorld, worldToScreen, startDrawing, addElement, clearSelection, elements, startEditing, zoom, setActiveTool, isDrawing]);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();

    // Panning
    if (isPanning && panStart) {
      const dx = pointer.x - panStart.x;
      const dy = pointer.y - panStart.y;
      pan(dx, dy);
      setPanStart({ x: pointer.x, y: pointer.y });
      return;
    }

    // Eraser mode
    if (activeTool === TOOLS.ERASER && isErasing) {
      const intersection = stage.getIntersection(pointer);
      if (intersection && intersection !== stage) {
        const id = intersection.id();
        if (id) deleteElement(id);
      }
      return;
    }

    const worldPos = screenToWorld(pointer.x, pointer.y);

    // Drawing - update current position for preview
    if (isDrawing && drawingStart) {
      setDrawingCurrent(worldPos);
      
      const width = worldPos.x - drawingStart.x;
      const height = worldPos.y - drawingStart.y;
      
      setSelectionRect({
        x: width > 0 ? drawingStart.x : worldPos.x,
        y: height > 0 ? drawingStart.y : worldPos.y,
        width: Math.abs(width),
        height: Math.abs(height),
      });
      return;
    }

    // Selection rectangle
    if (selectionRect) {
      const width = worldPos.x - selectionRect.x;
      const height = worldPos.y - selectionRect.y;
      
      setSelectionRect({
        ...selectionRect,
        width,
        height,
      });
    }
  }, [isPanning, panStart, isDrawing, drawingStart, selectionRect, screenToWorld, pan]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    // End panning
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    // End erasing
    if (isErasing) {
      setIsErasing(false);
      return;
    }

    // End drawing
    if (isDrawing && drawingStart && selectionRect) {
      const { x, y, width, height } = selectionRect;

      if (Math.abs(width) > 5 && Math.abs(height) > 5) {
        switch (drawingShape) {
          case TOOLS.RECTANGLE:
            addElement({
              type: 'rectangle',
              x,
              y,
              width: Math.abs(width),
              height: Math.abs(height),
              fill: DEFAULT_PROPERTIES.rectangle.fill,
              stroke: DEFAULT_PROPERTIES.rectangle.stroke,
              strokeWidth: DEFAULT_PROPERTIES.rectangle.strokeWidth,
            });
            setActiveTool(TOOLS.SELECT);
            break;
          case TOOLS.CIRCLE:
            addElement({
              type: 'circle',
              x: x + Math.abs(width) / 2,
              y: y + Math.abs(height) / 2,
              radius: Math.min(Math.abs(width), Math.abs(height)) / 2,
              fill: DEFAULT_PROPERTIES.circle.fill,
              stroke: DEFAULT_PROPERTIES.circle.stroke,
              strokeWidth: DEFAULT_PROPERTIES.circle.strokeWidth,
            });
            setActiveTool(TOOLS.SELECT);
            break;
          case TOOLS.LINE:
            addElement({
              type: 'line',
              x,
              y,
              points: [0, 0, width, height],
              stroke: DEFAULT_PROPERTIES.line.stroke,
              strokeWidth: DEFAULT_PROPERTIES.line.strokeWidth,
            });
            setActiveTool(TOOLS.SELECT);
            break;
          case TOOLS.ARROW:
            addElement({
              type: 'arrow',
              x,
              y,
              points: [0, 0, width, height],
              stroke: DEFAULT_PROPERTIES.arrow.stroke,
              strokeWidth: DEFAULT_PROPERTIES.arrow.strokeWidth,
              pointerLength: DEFAULT_PROPERTIES.arrow.pointerLength,
              pointerWidth: DEFAULT_PROPERTIES.arrow.pointerWidth,
              fill: DEFAULT_PROPERTIES.arrow.fill,
            });
            setActiveTool(TOOLS.SELECT);
            break;
          case TOOLS.STAR:
            addElement({
              type: 'star',
              x: x + Math.abs(width) / 2,
              y: y + Math.abs(height) / 2,
              numPoints: DEFAULT_PROPERTIES.star.numPoints,
              innerRadius: Math.min(Math.abs(width), Math.abs(height)) / 4,
              outerRadius: Math.min(Math.abs(width), Math.abs(height)) / 2,
              fill: DEFAULT_PROPERTIES.star.fill,
              stroke: DEFAULT_PROPERTIES.star.stroke,
              strokeWidth: DEFAULT_PROPERTIES.star.strokeWidth,
            });
            setActiveTool(TOOLS.SELECT);
            break;
          case TOOLS.POLYGON:
            addElement({
              type: 'polygon',
              x: x + Math.abs(width) / 2,
              y: y + Math.abs(height) / 2,
              sides: DEFAULT_PROPERTIES.polygon.sides,
              radius: Math.min(Math.abs(width), Math.abs(height)) / 2,
              fill: DEFAULT_PROPERTIES.polygon.fill,
              stroke: DEFAULT_PROPERTIES.polygon.stroke,
              strokeWidth: DEFAULT_PROPERTIES.polygon.strokeWidth,
            });
            setActiveTool(TOOLS.SELECT);
            break;
        }
      }

      endDrawing();
      setSelectionRect(null);
      setDrawingCurrent(null);
      return;
    }

    // End selection rectangle
    if (selectionRect) {
      const absWidth = Math.abs(selectionRect.width);
      const absHeight = Math.abs(selectionRect.height);
      
      if (absWidth > 5 && absHeight > 5) {
        const selX = selectionRect.width > 0 ? selectionRect.x : selectionRect.x + selectionRect.width;
        const selY = selectionRect.height > 0 ? selectionRect.y : selectionRect.y + selectionRect.height;
        
        // Find elements inside selection rectangle
        elements.forEach((el) => {
          let elX = el.x;
          let elY = el.y;
          let elW = el.width || el.radius * 2 || 100;
          let elH = el.height || el.radius * 2 || 100;
          
          if (el.type === 'circle' || el.type === 'star' || el.type === 'polygon') {
            elX = el.x - elW / 2;
            elY = el.y - elH / 2;
          }
          
          const intersects = (
            elX < selX + absWidth &&
            elX + elW > selX &&
            elY < selY + absHeight &&
            elY + elH > selY
          );
          
          if (intersects && el.visible !== false) {
            selectElement(el.id, true);
          }
        });
      }
      
      setSelectionRect(null);
    }
  }, [isPanning, isDrawing, drawingStart, selectionRect, drawingShape, addElement, endDrawing, elements, selectElement]);

  // Handle element click
  const handleElementClick = useCallback((e, id) => {
    e.cancelBubble = true;
    
    if (activeTool === TOOLS.SELECT) {
      selectElement(id, e.evt.shiftKey);
    } else if (activeTool === TOOLS.ERASER) {
      deleteElement(id);
    }
  }, [activeTool, selectElement]);

  // Handle element double click
  const handleElementDoubleClick = useCallback((e, element) => {
    e.cancelBubble = true;

    if (element.type === 'text') {
      startEditing(element.id);
      const screenPos = worldToScreen(element.x, element.y);
      setTextEditor({
        id: element.id,
        x: screenPos.x,
        y: screenPos.y,
        text: element.text,
        fontSize: element.fontSize || 16,
        fontFamily: element.fontFamily || 'Inter, sans-serif',
        fill: element.fill || '#F8FAFC',
        width: element.width,
      });
    }
  }, [startEditing, worldToScreen, zoom]);

  // Handle text editor close
  const handleTextEditorClose = useCallback((newText, save = true) => {
    if (textEditor && save && newText !== undefined) {
      updateElement(textEditor.id, { text: newText });
      addToHistory();
    }
    setTextEditor(null);
    endEditing();
  }, [textEditor, updateElement, addToHistory, endEditing]);

  // Handle element drag
  const handleElementDragMove = useCallback((e, id) => {
    const node = e.target;
    let newX = node.x();
    let newY = node.y();

    // Snap to grid
    if (snapToGrid) {
      newX = Math.round(newX / CANVAS.gridSize) * CANVAS.gridSize;
      newY = Math.round(newY / CANVAS.gridSize) * CANVAS.gridSize;
    }

    // Update position
    updateElement(id, { x: newX, y: newY });

    // Show smart guides (using web worker for heavy computation)
    if (showSmartGuides && workerReady) {
      const element = elements.find(el => el.id === id);
      if (element) {
        calculateSmartGuidesWorker(element, elements, CANVAS.snapThreshold)
          .then(({ guides }) => {
            setSmartGuides(guides);
          })
          .catch((err) => {
            console.warn('Smart guides calculation failed:', err);
            // Fallback to synchronous calculation if worker fails
            const guides = getSmartGuidesFromStore(id);
            setSmartGuides(guides);
          });
      }
    }
  }, [snapToGrid, updateElement, showSmartGuides, workerReady, calculateSmartGuidesWorker, elements, getSmartGuidesFromStore]);

  const handleElementDragEnd = useCallback(() => {
    setSmartGuides([]);
    addToHistory();
  }, [addToHistory]);

  // Handle element transform
  const handleElementTransform = useCallback((e, id) => {
    const node = e.target;
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    const updates = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };
    
    if (element.type === 'rectangle') {
      updates.width = Math.max(5, node.width() * scaleX);
      updates.height = Math.max(5, node.height() * scaleY);
    } else if (element.type === 'circle') {
      updates.radius = Math.max(5, element.radius * Math.max(scaleX, scaleY));
    } else if (element.type === 'text') {
      updates.fontSize = Math.max(8, (element.fontSize || 16) * scaleY);
    }
    
    updateElement(id, updates);
    
    // Reset scale
    node.scaleX(1);
    node.scaleY(1);
  }, [elements, updateElement]);

  const handleElementTransformEnd = useCallback(() => {
    addToHistory();
  }, [addToHistory]);

  // Handle drag and drop from AssetLibrary
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'canvas/asset') {
        const stage = stageRef.current;
        if (!stage) return;
        
        const stageBox = stage.container().getBoundingClientRect();
        const pointerPosition = {
          x: e.clientX - stageBox.left,
          y: e.clientY - stageBox.top
        };
        
        const worldPos = screenToWorld(pointerPosition.x, pointerPosition.y);
        
        const width = data.props.width || data.props.radius * 2 || 100;
        const height = data.props.height || data.props.radius * 2 || 100;
        
        let x = worldPos.x;
        let y = worldPos.y;
        
        if (!['circle', 'star', 'polygon'].includes(data.elementType)) {
          x -= width / 2;
          y -= height / 2;
        }

        const id = addElement({
          type: data.elementType,
          x,
          y,
          ...data.props
        });
        selectElement(id);
      }
    } catch (err) {
      // Not a valid JSON payload, ignore
    }
  }, [screenToWorld, addElement, selectElement]);

  // Get selection bounds
  const bounds = getBounds();

  return (
    <div 
      className="relative w-full h-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`canvas-stage ${
          activeTool === TOOLS.SELECT ? 'cursor-select' : 
          activeTool === TOOLS.ERASER ? 'cursor-eraser' : ''
        }`}
        style={{
          cursor: activeTool === TOOLS.PAN || isPanning ? 'grab' :
                  activeTool === TOOLS.SELECT ? 'move' :
                  activeTool === TOOLS.TEXT ? 'text' :
                  [TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.LINE, TOOLS.ARROW, TOOLS.STAR, TOOLS.POLYGON].includes(activeTool) ? 'crosshair' : 
                  activeTool === TOOLS.ERASER ? 'none' : 'default'
        }}
      >
        <Layer>
          {/* Background */}
          <Rect
            x={-100000}
            y={-100000}
            width={200000}
            height={200000}
          fill={themeCanvasBg || canvasBackground}
          />
          
          {/* Grid */}
          {showGrid && (
            <Grid
              offset={offset}
              zoom={zoom}
              width={width}
              height={height}
            />
          )}
        </Layer>

        <Layer
          x={offset.x}
          y={offset.y}
          scaleX={zoom}
          scaleY={zoom}
        >
          {/* Smart Guides */}
          <SmartGuides guides={smartGuides} zoom={zoom} />

          {/* Elements */}
          {elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isEraserActive={activeTool === TOOLS.ERASER}
              isSelected={selectedIds.includes(element.id)}
              onClick={handleElementClick}
              onDoubleClick={handleElementDoubleClick}
              onDragMove={handleElementDragMove}
              onDragEnd={handleElementDragEnd}
              onTransform={handleElementTransform}
              onTransformEnd={handleElementTransformEnd}
            />
          ))}

          {/* Drawing Preview - Shows actual shape */}
          {isDrawing && drawingStart && drawingCurrent && (
            <DrawingPreview
              tool={drawingShape}
              start={drawingStart}
              current={drawingCurrent}
              zoom={zoom}
            />
          )}

          {/* Selection Rectangle Preview */}
          {!isDrawing && selectionRect && (
            <Rect
              x={selectionRect.width > 0 ? selectionRect.x : selectionRect.x + selectionRect.width}
              y={selectionRect.height > 0 ? selectionRect.y : selectionRect.y + selectionRect.height}
              width={Math.abs(selectionRect.width)}
              height={Math.abs(selectionRect.height)}
              fill={COLORS.accentPrimary}
              opacity={0.1}
              stroke={COLORS.accentPrimary}
              strokeWidth={1 / zoom}
              dash={[5 / zoom, 5 / zoom]}
            />
          )}
        </Layer>
      </Stage>

      {/* Text Editor Overlay */}
      {textEditor && (
        <TextEditor
          {...textEditor}
          zoom={zoom}
          onClose={handleTextEditorClose}
        />
      )}
    </div>
  );
};

export default Canvas;

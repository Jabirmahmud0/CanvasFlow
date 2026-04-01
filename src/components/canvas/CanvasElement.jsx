import React, { useRef, useEffect, useState } from 'react';
import { Rect, Circle, Text, Line, Star, RegularPolygon, Group, Transformer } from 'react-konva';
import { COLORS } from '@/constants';

// Arrow shape
const Arrow = ({ points, pointerLength, pointerWidth, ...props }) => {
  return (
    <Line
      {...props}
      points={points}
      lineCap="round"
      lineJoin="round"
      sceneFunc={(context, shape) => {
        if (!points || points.length < 4) return;
        const [x1, y1, x2, y2] = points;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeShape(shape);
        
        // Draw arrowhead
        const pLen = pointerLength || 10;
        context.beginPath();
        context.moveTo(x2, y2);
        context.lineTo(
          x2 - pLen * Math.cos(angle - Math.PI / 6),
          y2 - pLen * Math.sin(angle - Math.PI / 6)
        );
        context.lineTo(
          x2 - pLen * Math.cos(angle + Math.PI / 6),
          y2 - pLen * Math.sin(angle + Math.PI / 6)
        );
        context.closePath();
        context.fillShape(shape);
      }}
    />
  );
};

const CanvasElement = ({
  element,
  isSelected,
  isEditing,
  isEraserActive,
  onClick,
  onDoubleClick,
  onDragMove,
  onDragEnd,
  onTransform,
  onTransformEnd,
}) => {
  const shapeRef = useRef(null);
  const transformerRef = useRef(null);

  // Hide element when being edited (text editor overlay is shown instead)
  const isBeingEdited = element.type === 'text' && isEditing;

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    } else if (!isSelected && transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleClick = (e) => {
    e.cancelBubble = true;
    onClick?.(e, element.id);
  };

  const handleDoubleClick = (e) => {
    e.cancelBubble = true;
    onDoubleClick?.(e, element);
  };

  const handleDragMove = (e) => {
    onDragMove?.(e, element.id);
  };

  const handleDragEnd = (e) => {
    onDragEnd?.(e, element.id);
  };

  const handleTransform = (e) => {
    onTransform?.(e, element.id);
  };

  const handleTransformEnd = (e) => {
    onTransformEnd?.(e, element.id);
  };

  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    rotation: element.rotation || 0,
    opacity: element.opacity ?? 1,
    visible: element.visible !== false,
    draggable: element.locked !== true && !isEditing && !isEraserActive,
    onClick: handleClick,
    onDblClick: handleDoubleClick,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onTransform: handleTransform,
    onTransformEnd: handleTransformEnd,
    // Add selection indicator via stroke only if the element doesn't have its own stroke
    // Or better, let Transformer handle the selection UI entirely.
    // We'll keep a soft glow for selection.
    // We'll remove the selection shadow entirely to avoid the "inside a box" feeling.
    // The Transformer already handles selection visuals.
    shadowColor: 'transparent',
    shadowBlur: 0,
    shadowOpacity: 0,
    strokeScaleEnabled: false, // Prevent stroke stretching
  };

  const renderShape = () => {
    switch (element.type) {
      case 'rectangle':
        return (
          <Rect
            ref={shapeRef}
            {...commonProps}
            width={element.width}
            height={element.height}
            fill={element.fill === 'transparent' ? undefined : element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth || 0}
            cornerRadius={element.cornerRadius || 0}
            dash={element.dash && element.dash.length > 0 ? element.dash : undefined}
            dashEnabled={element.dash && element.dash.length > 0}
          />
        );

      case 'circle':
        return (
          <Circle
            ref={shapeRef}
            {...commonProps}
            radius={element.radius || 50}
            fill={element.fill === 'transparent' ? undefined : element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth || 0}
            dash={element.dash && element.dash.length > 0 ? element.dash : undefined}
            dashEnabled={element.dash && element.dash.length > 0}
          />
        );

      case 'text':
        return (
          <Text
            ref={shapeRef}
            {...commonProps}
            text={element.text}
            fontSize={element.fontSize}
            fill={element.fill}
            fontFamily={element.fontFamily || 'Inter, sans-serif'}
            fontStyle={element.fontStyle || 'normal'}
            fontWeight={element.fontWeight || 'normal'}
            align={element.align || 'left'}
            width={element.width}
            height={element.height}
            lineHeight={element.lineHeight || 1.2}
            letterSpacing={element.letterSpacing}
            textDecoration={element.textDecoration}
            wrap={element.wrap || 'word'}
            ellipsis={element.ellipsis}
            padding={element.padding || 0}
          />
        );

      case 'line':
        return (
          <Line
            ref={shapeRef}
            {...commonProps}
            points={element.points}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            lineCap={element.lineCap || 'round'}
            lineJoin={element.lineJoin || 'round'}
            dash={element.dash && element.dash.length > 0 ? element.dash : undefined}
            dashEnabled={element.dash && element.dash.length > 0}
            tension={element.tension}
          />
        );

      case 'arrow':
        return (
          <Arrow
            {...commonProps}
            points={element.points}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            pointerLength={element.pointerLength || 10}
            pointerWidth={element.pointerWidth || 10}
            fill={element.fill || element.stroke}
          />
        );

      case 'star':
        return (
          <Star
            ref={shapeRef}
            {...commonProps}
            numPoints={element.numPoints || 5}
            innerRadius={element.innerRadius || 20}
            outerRadius={element.outerRadius || 40}
            fill={element.fill === 'transparent' ? undefined : element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth || 0}
            dash={element.dash && element.dash.length > 0 ? element.dash : undefined}
            dashEnabled={element.dash && element.dash.length > 0}
          />
        );

      case 'polygon':
        return (
          <RegularPolygon
            ref={shapeRef}
            {...commonProps}
            sides={element.sides || 3}
            radius={element.radius || 50}
            fill={element.fill === 'transparent' ? undefined : element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth || 0}
            dash={element.dash && element.dash.length > 0 ? element.dash : undefined}
            dashEnabled={element.dash && element.dash.length > 0}
          />
        );

      case 'pen':
      case 'brush':
        return (
          <Line
            ref={shapeRef}
            {...commonProps}
            points={element.points}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            lineCap="round"
            lineJoin="round"
            tension={element.tension || 0.5}
            // Override the commonProps selection shadow — glow on thin strokes looks bad
            shadowColor={element.type === 'brush' ? element.stroke : 'transparent'}
            shadowBlur={element.type === 'brush' ? 4 : 0}
            shadowOpacity={element.type === 'brush' ? 0.5 : 0}
            shadowOffsetX={0}
            shadowOffsetY={0}
            perfectDrawEnabled={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Hide shape when text is being edited */}
      {!isBeingEdited && renderShape()}
      {isSelected &&
        element.type !== 'line' &&
        element.type !== 'arrow' &&
        element.type !== 'pen' &&
        element.type !== 'brush' &&
        !isBeingEdited && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={8}
          anchorCornerRadius={2}
          anchorFill="#1E293B"
          anchorStroke="#6366F1"
          anchorStrokeWidth={1}
          borderStroke="#6366F1"
          borderStrokeWidth={1}
          borderDash={[4, 4]}
          rotateAnchorOffset={20}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
        />
      )}
    </>
  );
};

export default CanvasElement;

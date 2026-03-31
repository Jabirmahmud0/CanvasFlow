import React, { useRef, useEffect, useState } from 'react';
import { Rect, Circle, Text, Line, Star, RegularPolygon, Group, Transformer } from 'react-konva';
import { COLORS } from '@/constants';

// Arrow shape
const Arrow = ({ x, y, points, stroke, strokeWidth, pointerLength, pointerWidth, fill, opacity }) => {
  const arrowRef = useRef(null);
  
  useEffect(() => {
    if (arrowRef.current) {
      // Custom arrow shape using Konva's arrow
      arrowRef.current.sceneFunc((context, shape) => {
        const [x1, y1, x2, y2] = points;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.strokeShape(shape);
        
        // Draw arrowhead
        context.beginPath();
        context.moveTo(x2, y2);
        context.lineTo(
          x2 - pointerLength * Math.cos(angle - Math.PI / 6),
          y2 - pointerLength * Math.sin(angle - Math.PI / 6)
        );
        context.lineTo(
          x2 - pointerLength * Math.cos(angle + Math.PI / 6),
          y2 - pointerLength * Math.sin(angle + Math.PI / 6)
        );
        context.closePath();
        context.fillShape(shape);
      });
    }
  }, [points, pointerLength, pointerWidth]);

  return (
    <Group x={x} y={y} opacity={opacity}>
      <Line
        ref={arrowRef}
        points={points}
        stroke={stroke}
        strokeWidth={strokeWidth}
        lineCap="round"
        lineJoin="round"
        fill={fill || stroke}
      />
    </Group>
  );
};

const CanvasElement = ({
  element,
  isSelected,
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
  const [isEditing, setIsEditing] = useState(false);

  // Hide element when being edited (text editor overlay is shown instead)
  const isBeingEdited = element.type === 'text' && isSelected && isEditing;

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
    onDoubleClick?.(e);
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
    shadowColor: isSelected ? COLORS.accentPrimary : 'transparent',
    shadowBlur: isSelected ? 15 : 0,
    shadowOpacity: isSelected ? 0.4 : 0,
    shadowOffsetY: isSelected ? 5 : 0,
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
            fill={element.fill}
            stroke={isSelected ? COLORS.selectionBorder : element.stroke}
            strokeWidth={isSelected ? 2 : element.strokeWidth || 0}
            cornerRadius={element.cornerRadius || 0}
            dash={element.dash}
          />
        );

      case 'circle':
        return (
          <Circle
            ref={shapeRef}
            {...commonProps}
            radius={element.radius}
            fill={element.fill}
            stroke={isSelected ? COLORS.selectionBorder : element.stroke}
            strokeWidth={isSelected ? 2 : element.strokeWidth || 0}
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
            dash={element.dash}
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
            fill={element.fill}
            stroke={isSelected ? COLORS.selectionBorder : element.stroke}
            strokeWidth={isSelected ? 2 : element.strokeWidth || 0}
          />
        );

      case 'polygon':
        return (
          <RegularPolygon
            ref={shapeRef}
            {...commonProps}
            sides={element.sides || 6}
            radius={element.radius || 50}
            fill={element.fill}
            stroke={isSelected ? COLORS.selectionBorder : element.stroke}
            strokeWidth={isSelected ? 2 : element.strokeWidth || 0}
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
      {isSelected && element.type !== 'line' && element.type !== 'arrow' && !isBeingEdited && (
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

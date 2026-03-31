import React from 'react';
import { Rect, Line, Group } from 'react-konva';
import { COLORS } from '@/constants';

const SelectionBox = ({ bounds, zoom }) => {
  if (!bounds) return null;

  const { x, y, width, height } = bounds;
  const handleSize = 8 / zoom;
  const halfHandle = handleSize / 2;

  // Handle positions
  const handles = [
    { x: x - halfHandle, y: y - halfHandle }, // top-left
    { x: x + width / 2 - halfHandle, y: y - halfHandle }, // top-center
    { x: x + width - halfHandle, y: y - halfHandle }, // top-right
    { x: x + width - halfHandle, y: y + height / 2 - halfHandle }, // middle-right
    { x: x + width - halfHandle, y: y + height - halfHandle }, // bottom-right
    { x: x + width / 2 - halfHandle, y: y + height - halfHandle }, // bottom-center
    { x: x - halfHandle, y: y + height - halfHandle }, // bottom-left
    { x: x - halfHandle, y: y + height / 2 - halfHandle }, // middle-left
  ];

  return (
    <Group>
      {/* Selection border */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke={COLORS.selectionBorder}
        strokeWidth={1 / zoom}
        dash={[5 / zoom, 5 / zoom]}
        fill="transparent"
      />

      {/* Transform handles */}
      {handles.map((handle, index) => (
        <Rect
          key={index}
          x={handle.x}
          y={handle.y}
          width={handleSize}
          height={handleSize}
          fill={COLORS.canvasBg}
          stroke={COLORS.selectionBorder}
          strokeWidth={1 / zoom}
        />
      ))}

      {/* Center crosshair */}
      <Line
        points={[x + width / 2, y - 10 / zoom, x + width / 2, y + height + 10 / zoom]}
        stroke={COLORS.selectionBorder}
        strokeWidth={0.5 / zoom}
        dash={[3 / zoom, 3 / zoom]}
        opacity={0.5}
      />
      <Line
        points={[x - 10 / zoom, y + height / 2, x + width + 10 / zoom, y + height / 2]}
        stroke={COLORS.selectionBorder}
        strokeWidth={0.5 / zoom}
        dash={[3 / zoom, 3 / zoom]}
        opacity={0.5}
      />
    </Group>
  );
};

export default SelectionBox;

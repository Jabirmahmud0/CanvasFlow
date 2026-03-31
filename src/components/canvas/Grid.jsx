import React, { useMemo } from 'react';
import { Line, Group } from 'react-konva';
import { COLORS, CANVAS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

const Grid = ({ offset, zoom, width, height }) => {
  const { theme } = useTheme();
  
  const gridLines = useMemo(() => {
    const lines = [];
    const gridSize = CANVAS.gridSize * zoom;
    
    if (gridSize < 5) return lines; // Don't show grid if too zoomed out
    
    // Calculate visible grid area
    const startX = Math.floor(-offset.x / gridSize) * gridSize;
    const startY = Math.floor(-offset.y / gridSize) * gridSize;
    const endX = startX + width + gridSize * 2;
    const endY = startY + height + gridSize * 2;
    
    const gridColor = theme === 'light' ? '#E2E8F0' : (theme === 'high-contrast' ? '#333333' : COLORS.canvasGrid);
    
    // Vertical lines
    for (let x = startX; x < endX; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x / zoom, -100000, x / zoom, 100000]}
          stroke={gridColor}
          strokeWidth={1 / zoom}
          opacity={0.5}
        />
      );
    }
    
    // Horizontal lines
    for (let y = startY; y < endY; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[-100000, y / zoom, 100000, y / zoom]}
          stroke={gridColor}
          strokeWidth={1 / zoom}
          opacity={0.5}
        />
      );
    }
    
    return lines;
  }, [offset, zoom, width, height, theme]);

  return <Group>{gridLines}</Group>;
};

export default Grid;

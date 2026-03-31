import React, { useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * VirtualList Component
 * Renders only visible items in a scrollable list for better performance
 * Ideal for lists with 100+ items
 */
export const VirtualList = ({
  items,
  renderItem,
  itemHeight = 44, // Default height in pixels
  overscan = 5, // Number of items to render above/below viewport
  className = '',
  estimatedTotalHeight,
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(400);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (estimatedTotalHeight) return estimatedTotalHeight;
    return items.length * itemHeight;
  }, [items.length, itemHeight, estimatedTotalHeight]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const { scrollTop, clientHeight } = e.currentTarget;
    setScrollTop(scrollTop);
    setContainerHeight(clientHeight);
  }, []);

  // Initialize container height
  React.useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    if (items.length === 0) {
      return { startIndex: 0, endIndex: 0, visibleItems: [] };
    }

    // Calculate which items are visible
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visible = items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      style: {
        position: 'absolute',
        top: (start + index) * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      },
    }));

    return { startIndex: start, endIndex: end, visibleItems: visible };
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);

  if (items.length === 0) {
    return <div className={className}>{renderItem({ item: null, index: 0, style: {} })}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onScroll={handleScroll}
      style={{ contain: 'strict' }}
    >
      {/* Spacer to maintain scroll height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map(({ item, index, style }) => (
          <div key={item?.id || `item-${index}`} style={style}>
            {renderItem({ item, index, style })}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * useVirtualList Hook
 * Hook version for more control over virtualization
 */
export const useVirtualList = ({
  total,
  itemHeight = 44,
  containerRef,
  overscan = 5,
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(400);

  // Setup scroll listener
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setContainerHeight(container.clientHeight);

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  const totalHeight = total * itemHeight;

  const { startIndex, endIndex, visibleCount } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(total, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
    
    return {
      startIndex: start,
      endIndex: end,
      visibleCount: end - start,
    };
  }, [scrollTop, containerHeight, itemHeight, total, overscan]);

  return {
    startIndex,
    endIndex,
    visibleCount,
    totalHeight,
    scrollTop,
  };
};

export default VirtualList;

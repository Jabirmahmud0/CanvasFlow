/**
 * Geometry Web Worker
 * Handles computationally intensive geometry calculations off the main thread
 */

// Calculate smart guides for element alignment
const calculateSmartGuides = (element, allElements, threshold = 5) => {
  const guides = [];
  
  if (!element) return guides;
  
  const ew = element.width || element.radius * 2 || 100;
  const eh = element.height || element.radius * 2 || 100;
  const ex1 = element.x;
  const ex2 = element.x + ew;
  const ey1 = element.y;
  const ey2 = element.y + eh;
  const ecx = element.x + ew / 2; // element center x
  const ecy = element.y + eh / 2; // element center y
  
  allElements.forEach((other) => {
    if (other.id === element.id || other.visible === false) return;
    
    const ow = other.width || other.radius * 2 || 100;
    const oh = other.height || other.radius * 2 || 100;
    const ox1 = other.x;
    const ox2 = other.x + ow;
    const oy1 = other.y;
    const oy2 = other.y + oh;
    const ocx = other.x + ow / 2; // other center x
    const ocy = other.y + oh / 2; // other center y
    
    // Vertical guides (x-axis alignment)
    
    // Left to Left
    if (Math.abs(ex1 - ox1) < threshold) {
      guides.push({ type: 'vertical', x: ox1, distance: Math.abs(ex1 - ox1) });
    }
    
    // Left to Right
    if (Math.abs(ex1 - ox2) < threshold) {
      guides.push({ type: 'vertical', x: ox2, distance: Math.abs(ex1 - ox2) });
    }
    
    // Right to Left
    if (Math.abs(ex2 - ox1) < threshold) {
      guides.push({ type: 'vertical', x: ox1 - ew, distance: Math.abs(ex2 - ox1) });
    }
    
    // Right to Right
    if (Math.abs(ex2 - ox2) < threshold) {
      guides.push({ type: 'vertical', x: ox2 - ew, distance: Math.abs(ex2 - ox2) });
    }
    
    // Center to Center (horizontal)
    if (Math.abs(ecx - ocx) < threshold) {
      guides.push({ type: 'vertical', x: ocx - ew / 2, distance: Math.abs(ecx - ocx) });
    }
    
    // Horizontal guides (y-axis alignment)
    
    // Top to Top
    if (Math.abs(ey1 - oy1) < threshold) {
      guides.push({ type: 'horizontal', y: oy1, distance: Math.abs(ey1 - oy1) });
    }
    
    // Top to Bottom
    if (Math.abs(ey1 - oy2) < threshold) {
      guides.push({ type: 'horizontal', y: oy2, distance: Math.abs(ey1 - oy2) });
    }
    
    // Bottom to Top
    if (Math.abs(ey2 - oy1) < threshold) {
      guides.push({ type: 'horizontal', y: oy1 - eh, distance: Math.abs(ey2 - oy1) });
    }
    
    // Bottom to Bottom
    if (Math.abs(ey2 - oy2) < threshold) {
      guides.push({ type: 'horizontal', y: oy2 - eh, distance: Math.abs(ey2 - oy2) });
    }
    
    // Center to Center (vertical)
    if (Math.abs(ecy - ocy) < threshold) {
      guides.push({ type: 'horizontal', y: ocy - eh / 2, distance: Math.abs(ecy - ocy) });
    }
  });
  
  return guides;
};

// Calculate bounds for multiple elements
const calculateBounds = (elements) => {
  if (!elements || elements.length === 0) return null;
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  elements.forEach((el) => {
    const width = el.width || el.radius * 2 || (el.text ? (el.text.length * (el.fontSize || 16)) : 100);
    const height = el.height || el.radius * 2 || (el.fontSize || 16) * 1.5;
    
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + width);
    maxY = Math.max(maxY, el.y + height);
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
};

// Check if point is inside a shape
const isPointInShape = (point, element) => {
  const { x, y } = point;
  
  if (element.type === 'rectangle') {
    return (
      x >= element.x &&
      x <= element.x + element.width &&
      y >= element.y &&
      y <= element.y + element.height
    );
  }
  
  if (element.type === 'circle' || element.type === 'star' || element.type === 'polygon') {
    const radius = element.radius || element.outerRadius || 50;
    const centerX = element.x;
    const centerY = element.y;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    return distance <= radius;
  }
  
  if (element.type === 'text') {
    const width = element.text ? element.text.length * (element.fontSize || 16) : 100;
    const height = (element.fontSize || 16) * 1.5;
    return (
      x >= element.x &&
      x <= element.x + width &&
      y >= element.y &&
      y <= element.y + height
    );
  }
  
  if (element.type === 'line' || element.type === 'arrow') {
    // Simple bounding box check for lines
    const points = element.points;
    const minX = Math.min(points[0], points[2]) + element.x;
    const maxX = Math.max(points[0], points[2]) + element.x;
    const minY = Math.min(points[1], points[3]) + element.y;
    const maxY = Math.max(points[1], points[3]) + element.y;
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }
  
  return false;
};

// Find elements at point
const findElementsAtPoint = (point, elements) => {
  // Iterate in reverse to get topmost elements first
  const result = [];
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (el.visible !== false && isPointInShape(point, el)) {
      result.push(el.id);
    }
  }
  return result;
};

// Calculate complex path for star shape
const calculateStarPath = (cx, cy, numPoints, innerRadius, outerRadius) => {
  const points = [];
  const step = Math.PI / numPoints;
  
  for (let i = 0; i < 2 * numPoints; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push({ x, y });
  }
  
  return points;
};

// Calculate complex path for polygon
const calculatePolygonPath = (cx, cy, sides, radius) => {
  const points = [];
  const step = (2 * Math.PI) / sides;
  
  for (let i = 0; i < sides; i++) {
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push({ x, y });
  }
  
  return points;
};

// Message handler
self.onmessage = function(e) {
  const { type, payload } = e.data;
  
  try {
    switch (type) {
      case 'CALCULATE_SMART_GUIDES': {
        const { element, allElements, threshold } = payload;
        const guides = calculateSmartGuides(element, allElements, threshold);
        self.postMessage({ type: 'SMART_GUIDES_RESULT', payload: { guides, elementId: element.id } });
        break;
      }
      
      case 'CALCULATE_BOUNDS': {
        const { elements } = payload;
        const bounds = calculateBounds(elements);
        self.postMessage({ type: 'BOUNDS_RESULT', payload: { bounds } });
        break;
      }
      
      case 'FIND_ELEMENTS_AT_POINT': {
        const { point, elements } = payload;
        const elementIds = findElementsAtPoint(point, elements);
        self.postMessage({ type: 'ELEMENTS_AT_POINT_RESULT', payload: { elementIds, point } });
        break;
      }
      
      case 'CALCULATE_STAR_PATH': {
        const { cx, cy, numPoints, innerRadius, outerRadius } = payload;
        const points = calculateStarPath(cx, cy, numPoints, innerRadius, outerRadius);
        self.postMessage({ type: 'STAR_PATH_RESULT', payload: { points } });
        break;
      }
      
      case 'CALCULATE_POLYGON_PATH': {
        const { cx, cy, sides, radius } = payload;
        const points = calculatePolygonPath(cx, cy, sides, radius);
        self.postMessage({ type: 'POLYGON_PATH_RESULT', payload: { points } });
        break;
      }
      
      default:
        console.warn(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: { error: error.message, originalType: type } });
  }
};

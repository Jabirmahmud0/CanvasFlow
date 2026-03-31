import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Square, Circle, Triangle, Star, Hexagon, Type, Minus, ArrowRight, Image } from 'lucide-react';
import { COLORS } from '@/constants';

const ASSET_CATEGORIES = [
  { id: 'shapes', label: 'Basic Shapes' },
  { id: 'ui', label: 'UI Elements' },
];

const PRESET_ASSETS = {
  shapes: [
    { type: 'rectangle', label: 'Square', icon: Square, defaultProps: { width: 100, height: 100, fill: COLORS.indigo500, cornerRadius: 0 } },
    { type: 'rectangle', label: 'Rounded Rect', icon: Square, defaultProps: { width: 120, height: 80, fill: COLORS.teal500, cornerRadius: 16 } },
    { type: 'circle', label: 'Circle', icon: Circle, defaultProps: { radius: 50, fill: COLORS.rose500 } },
    { type: 'circle', label: 'Ellipse', icon: Circle, defaultProps: { radiusX: 60, radiusY: 40, fill: COLORS.amber500 } },
    { type: 'polygon', label: 'Triangle', icon: Triangle, defaultProps: { sides: 3, radius: 50, fill: COLORS.emerald500 } },
    { type: 'star', label: 'Star', icon: Star, defaultProps: { numPoints: 5, innerRadius: 25, outerRadius: 50, fill: COLORS.yellow500 } },
    { type: 'polygon', label: 'Hexagon', icon: Hexagon, defaultProps: { sides: 6, radius: 50, fill: COLORS.purple500 } },
    { type: 'text', label: 'Text Block', icon: Type, defaultProps: { text: 'Hello World', fontSize: 24, fill: COLORS.slate100 } },
    { type: 'line', label: 'Line', icon: Minus, defaultProps: { points: [0, 0, 100, 0], stroke: COLORS.slate400, strokeWidth: 2 } },
    { type: 'arrow', label: 'Arrow', icon: ArrowRight, defaultProps: { points: [0, 0, 100, 0], stroke: COLORS.slate400, strokeWidth: 2, pointerLength: 10, pointerWidth: 10 } },
  ],
  ui: [
    { 
      type: 'rectangle', 
      label: 'Button', 
      icon: Square, 
      defaultProps: { width: 120, height: 40, fill: COLORS.indigo500, cornerRadius: 6 }
    },
    { 
      type: 'rectangle', 
      label: 'Card', 
      icon: Square, 
      defaultProps: { width: 200, height: 250, fill: COLORS.slate800, cornerRadius: 12, stroke: COLORS.slate700, strokeWidth: 1 }
    },
    { 
      type: 'circle', 
      label: 'Avatar', 
      icon: Circle, 
      defaultProps: { radius: 32, fill: COLORS.slate700, stroke: COLORS.slate600, strokeWidth: 2 }
    },
  ]
};

const AssetLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('shapes');

  const handleDragStart = (e, asset) => {
    // Set the drag payload
    const payload = {
      type: 'canvas/asset',
      elementType: asset.type,
      props: asset.defaultProps
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredAssets = PRESET_ASSETS[activeCategory].filter(asset => 
    asset.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-b border-border shrink-0">
        {ASSET_CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                : 'bg-muted text-muted-foreground border border-transparent hover:bg-accent'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Asset Grid */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredAssets.map((asset, index) => {
              const Icon = asset.icon;
              return (
                <motion.div
                  key={index}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, asset)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-muted/50 border border-border/50 rounded-lg p-3 flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing hover:bg-accent/50 hover:border-border transition-colors"
                >
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-foreground">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs text-muted-foreground text-center select-none">{asset.label}</span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-8">
            <Image className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">No assets found</span>
          </div>
        )}
        
        <div className="mt-8 text-center text-xs text-muted-foreground/50">
          <p>Drag items onto the canvas</p>
        </div>
      </div>
    </div>
  );
};

export default AssetLibrary;

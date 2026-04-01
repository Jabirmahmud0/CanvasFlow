import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Square, Circle, Triangle, Star, Hexagon, Type,
  Minus, ArrowRight, Layout, MousePointer2, Image as ImageIcon,
  Plus, Sparkles, Filter
} from 'lucide-react';
import { COLORS } from '@/constants';

const ASSET_CATEGORIES = [
  { id: 'shapes', label: 'Shapes', icon: Square },
  { id: 'ui',     label: 'UI',     icon: Layout },
  { id: 'ai',     label: 'AI',     icon: Sparkles },
];

const PRESET_ASSETS = {
  shapes: [
    { type: 'rectangle', label: 'Square', icon: Square, defaultProps: { width: 100, height: 100, fill: 'transparent', stroke: '#6366F1', strokeWidth: 2, cornerRadius: 0 } },
    { type: 'rectangle', label: 'Rounded', icon: Square, defaultProps: { width: 120, height: 80, fill: 'transparent', stroke: '#14B8A6', strokeWidth: 2, cornerRadius: 16 } },
    { type: 'circle',    label: 'Circle', icon: Circle, defaultProps: { radius: 50, fill: 'transparent', stroke: '#EF4444', strokeWidth: 2 } },
    { type: 'polygon',   label: 'Triangle', icon: Triangle, defaultProps: { sides: 3, radius: 50, fill: 'transparent', stroke: '#10B981', strokeWidth: 2 } },
    { type: 'star',      label: 'Star', icon: Star, defaultProps: { numPoints: 5, innerRadius: 25, outerRadius: 50, fill: 'transparent', stroke: '#F59E0B', strokeWidth: 2 } },
    { type: 'polygon',   label: 'Hexagon', icon: Hexagon, defaultProps: { sides: 6, radius: 50, fill: 'transparent', stroke: '#8B5CF6', strokeWidth: 2 } },
    { type: 'text',      label: 'Heading', icon: Type, defaultProps: { text: 'Heading', fontSize: 32, fontWeight: 'bold', fill: '#FFFFFF' } },
    { type: 'line',      label: 'Line', icon: Minus, defaultProps: { points: [0, 0, 100, 0], stroke: '#94A3B8', strokeWidth: 2 } },
  ],
  ui: [
    { type: 'rectangle', label: 'Primary Button', icon: Square, defaultProps: { width: 140, height: 48, fill: '#6366F1', cornerRadius: 8, name: 'Button' } },
    { type: 'rectangle', label: 'Card Base', icon: Square, defaultProps: { width: 240, height: 320, fill: '#1E293B', cornerRadius: 16, stroke: '#334155', strokeWidth: 1, name: 'Card' } },
    { type: 'circle',    label: 'Avatar', icon: Circle, defaultProps: { radius: 32, fill: '#334155', stroke: '#475569', strokeWidth: 2, name: 'Avatar' } },
    { type: 'rectangle', label: 'Input Field', icon: Type, defaultProps: { width: 280, height: 44, fill: 'transparent', cornerRadius: 6, stroke: '#475569', strokeWidth: 1, name: 'Input' } },
  ],
  ai: [
    { type: 'text', label: 'Icon Label', icon: Sparkles, defaultProps: { text: '✨', fontSize: 40, fill: '#FFFFFF' } },
  ]
};

const AssetLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('shapes');

  const handleDragStart = (e, asset) => {
    const payload = {
      type: 'canvas/asset',
      elementType: asset.type,
      props: asset.defaultProps
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create a very subtle ghost image for dragging
    const ghost = document.createElement('div');
    ghost.style.width = '30px';
    ghost.style.height = '30px';
    ghost.style.background = 'rgba(99, 102, 241, 0.2)'; // Faint version of primary
    ghost.style.border = '1px dashed #6366F1';
    ghost.style.borderRadius = asset.type === 'circle' ? '50%' : '4px';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    
    e.dataTransfer.setDragImage(ghost, 15, 15);
    
    // Cleanup ghost element after a short delay
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  const filteredAssets = (PRESET_ASSETS[activeCategory] || []).filter(asset => 
    asset.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[hsl(var(--sidebar-background))]">
      {/* ── Search ── */}
      <div className="px-3 py-3 border-b border-border/60">
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-secondary/30 hover:bg-secondary/50 focus:bg-background border border-border/50 focus:border-primary/50 rounded-lg text-xs text-foreground placeholder-muted-foreground/40 outline-none transition-all"
          />
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="flex gap-1 px-2 py-1.5 overflow-x-auto no-scrollbar border-b border-border/40 bg-secondary/10 shrink-0">
        {ASSET_CATEGORIES.map(category => {
          const isActive = activeCategory === category.id;
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10.5px] font-medium whitespace-nowrap transition-all
                ${isActive
                  ? 'bg-background text-primary shadow-sm border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
            >
              <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* ── Asset Grid ── */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredAssets.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-2 gap-2"
            >
              {filteredAssets.map((asset, index) => {
                const Icon = asset.icon;
                return (
                  <motion.div
                    key={`${asset.label}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, asset)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="asset-card group"
                  >
                    <div className="asset-card-preview">
                      <Icon size={20} strokeWidth={1.5} className="text-muted-foreground/50 group-hover:text-primary transition-colors duration-300" />
                      
                      {/* Drag handle hint */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={10} className="text-primary" />
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground truncate w-full text-center px-1 transition-colors">
                      {asset.label}
                    </span>

                    {/* Glossy overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none rounded-xl transition-opacity" />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-3">
                <Filter size={20} className="text-muted-foreground/30" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">No matches found</p>
              <p className="text-[10px] text-muted-foreground/50 mt-1">Try a different search term</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-8 pb-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/30 font-medium tracking-wide border border-border/30 rounded-full px-3 py-1">
            <MousePointer2 size={10} />
            DRAG TO CANVAS
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetLibrary;

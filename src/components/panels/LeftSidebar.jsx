import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Library } from 'lucide-react';
import LayersPanel from './LayersPanel';
import AssetLibrary from './AssetLibrary';

const LeftSidebar = () => {
  const [activeTab, setActiveTab] = useState('layers'); // 'layers' or 'assets'

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 bg-sidebar/95 backdrop-blur-sm border-r border-border flex flex-col relative z-10"
      role="complementary"
      aria-label="Left sidebar"
    >
      {/* Sidebar Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'layers' 
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-accent/30' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
          }`}
          aria-selected={activeTab === 'layers'}
          role="tab"
        >
          <Layers size={16} />
          Layers
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === 'assets' 
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-accent/30' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
          }`}
          aria-selected={activeTab === 'assets'}
          role="tab"
        >
          <Library size={16} />
          Assets
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-muted/10">
        {activeTab === 'layers' && <LayersPanel isEmbedded={true} />}
        {activeTab === 'assets' && <AssetLibrary />}
      </div>
    </motion.div>
  );
};

export default LeftSidebar;

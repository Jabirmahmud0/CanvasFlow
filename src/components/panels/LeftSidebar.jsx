import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Package, ChevronLeft } from 'lucide-react';
import LayersPanel from './LayersPanel';
import AssetLibrary from './AssetLibrary';

const TABS = [
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'assets', label: 'Assets', icon: Package },
];

const LeftSidebar = ({ collapsed, onToggle }) => {
  const [activeTab, setActiveTab] = useState('layers');

  return (
    <AnimatePresence initial={false}>
      {!collapsed && (
        <motion.aside
          key="left-sidebar"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col border-r border-border bg-[hsl(var(--sidebar-background))] overflow-hidden flex-shrink-0"
          style={{ minWidth: 0 }}
        >
          {/* ── Tab Header ── */}
          <div className="flex items-center border-b border-border flex-shrink-0 relative h-10 px-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 h-full text-xs font-medium transition-colors rounded-md
                    ${isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                >
                  <Icon size={13} strokeWidth={isActive ? 2.2 : 1.8} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-tab-indicator"
                      className="absolute inset-0 bg-accent rounded-md"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                </button>
              );
            })}

            {/* Collapse button */}
            <button
              type="button"
              onClick={onToggle}
              className="ml-auto tool-btn !w-7 !h-7 !rounded-md opacity-40 hover:opacity-100"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          {/* ── Panel Content ── */}
          <div className="flex-1 overflow-hidden min-h-0">
            <AnimatePresence mode="wait" initial={false}>
              {activeTab === 'layers' ? (
                <motion.div
                  key="layers"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <LayersPanel />
                </motion.div>
              ) : (
                <motion.div
                  key="assets"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <AssetLibrary />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default LeftSidebar;

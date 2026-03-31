import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Wifi, DownloadCloud, Sparkles } from 'lucide-react';

/**
 * PWA Update Prompt Component — Redesigned for World-Class UI.
 * Shows a premium glassmorphic notification when a new version is available.
 */
export function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isOfflineVisible, setIsOfflineVisible] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (r?.active) {
        setInterval(async () => {
          if (!(!r.installing && navigator)) return;
          if ((swUrl && r.installing) || !swUrl) return;
          const response = await fetch(swUrl, {
            cache: 'no-store',
            headers: { 'cache-control': 'no-cache' },
          });
          if (response?.status === 200) await r.update();
        }, 60 * 60 * 1000); // 60 min
      }
    },
  });

  useEffect(() => {
    if (offlineReady) {
      setIsOfflineVisible(true);
      const timer = setTimeout(() => setIsOfflineVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) setShowUpdate(true);
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setNeedRefresh(false);
    setShowUpdate(false);
  };

  const isVisible = showUpdate || isOfflineVisible;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-6 right-6 z-[9999] w-[340px]"
        >
          <div className="relative overflow-hidden bg-[hsl(var(--surface-overlay))] backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-4">
            {/* Animated background glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner
                ${showUpdate ? 'bg-primary/15 text-primary' : 'bg-green-500/15 text-green-400'}`}
              >
                {showUpdate ? <DownloadCloud size={20} /> : <Wifi size={20} />}
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  {showUpdate ? 'Update Available' : 'Ready for Offline'}
                  {showUpdate && <Sparkles size={12} className="text-primary animate-pulse" />}
                </h3>
                <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                  {showUpdate
                    ? 'A newer version of CanvasFlow is ready with latest features and fixes.'
                    : 'The app is fully cached and ready to work without an internet connection.'}
                </p>
                
                <div className="flex gap-2 pt-2">
                  {showUpdate ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-semibold py-1.5 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw size={12} className="animate-spin-slow" />
                        Update Now
                      </button>
                      <button
                        onClick={() => setShowUpdate(false)}
                        className="px-3 bg-secondary/50 hover:bg-secondary text-foreground text-[11px] font-medium rounded-lg transition-colors border border-border/50"
                      >
                        Later
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsOfflineVisible(false)}
                      className="w-full bg-secondary text-foreground text-[11px] font-semibold py-1.5 rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      Awesome
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUpdate(false);
                  setIsOfflineVisible(false);
                }}
                className="text-muted-foreground/30 hover:text-foreground transition-colors p-1"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PWAUpdatePrompt;

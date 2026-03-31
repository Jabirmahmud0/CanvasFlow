import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * PWA Update Prompt Component
 * Shows a notification when a new service worker is available
 */
export function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Periodic check for updates (every 60 minutes)
      if (r?.active) {
        setInterval(async () => {
          if (!(!r.installing && navigator)) return;
          if ((swUrl && r.installing) || !swUrl) return;

          const response = await fetch(swUrl, {
            cache: 'no-store',
            headers: {
              cache: 'no-store',
              'cache-control': 'no-cache',
            },
          });

          if (response?.status === 404) {
            // Service worker not found, PWA might have been disabled
            window.location.href = '/';
          } else if (response?.status === 200) {
            // Service worker found, check for updates
            await r.update();
          }
        }, 60 * 60 * 1000); // 60 minutes
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed:', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      console.log('[PWA] App ready to work offline');
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setOfflineReady(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady, setOfflineReady]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setNeedRefresh(false);
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
    setShowUpdate(false);
  };

  // Show update prompt when new version is available
  useEffect(() => {
    if (needRefresh) {
      setShowUpdate(true);
    }
  }, [needRefresh]);

  if (!showUpdate && !offlineReady) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in">
      <div className="bg-card border border-border rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              {offlineReady ? 'App Ready for Offline Use' : 'Update Available'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {offlineReady
                ? 'CanvasFlow can now work without an internet connection.'
                : 'A new version of CanvasFlow is available. Update now for the latest features.'}
            </p>
            <div className="flex gap-2 mt-3">
              {needRefresh && (
                <>
                  <button
                    onClick={handleUpdate}
                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Update Now
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 bg-muted hover:bg-accent text-muted-foreground text-xs font-medium rounded-lg transition-colors"
                  >
                    Later
                  </button>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setOfflineReady(false);
              setShowUpdate(false);
            }}
            className="text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAUpdatePrompt;

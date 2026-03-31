/**
 * Analytics Integration Module
 * Supports multiple analytics providers with a unified API
 * 
 * Usage:
 * 1. Set VITE_ANALYTICS_PROVIDER and VITE_ANALYTICS_ID in .env
 * 2. Call initAnalytics() in main.jsx
 * 3. Use trackEvent(), trackPageView() throughout the app
 */

// Analytics providers configuration
const PROVIDERS = {
  google: {
    name: 'Google Analytics 4',
    script: 'https://www.googletagmanager.com/gtag/js?id={ID}',
    init: (config) => initGoogleAnalytics(config),
  },
  plausible: {
    name: 'Plausible Analytics',
    script: 'https://plausible.io/js/script.js',
    init: (config) => initPlausible(config),
  },
  fathom: {
    name: 'Fathom Analytics',
    script: 'https://cdn.usefathom.com/script.js',
    init: (config) => initFathom(config),
  },
  custom: {
    name: 'Custom Analytics',
    script: null,
    init: (config) => initCustom(config),
  },
};

let analyticsProvider = null;
let analyticsConfig = null;

/**
 * Initialize Google Analytics 4
 */
function initGoogleAnalytics(config) {
  const { measurementId } = config;

  // Create gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We'll handle page views manually
  });

  return {
    trackEvent: (name, params) => window.gtag('event', name, params),
    trackPageView: (path, title) => {
      window.gtag('config', measurementId, {
        page_path: path,
        page_title: title,
      });
    },
    identify: (userId, traits) => {
      window.gtag('set', { user_id: userId });
    },
  };
}

/**
 * Initialize Plausible Analytics
 */
function initPlausible(config) {
  const { domain } = config;

  // Create Plausible script
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = domain;
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);

  return {
    trackEvent: (name, params) => {
      window.plausible?.(name, { props: params });
    },
    trackPageView: (path, title) => {
      // Plausible auto-tracks page views
    },
    identify: () => {
      // Plausible doesn't support user identification (privacy-focused)
    },
  };
}

/**
 * Initialize Fathom Analytics
 */
function initFathom(config) {
  const { siteId } = config;

  // Create Fathom script
  const script = document.createElement('script');
  script.src = 'https://cdn.usefathom.com/script.js';
  script.dataset.site = siteId;
  script.dataset.auto = 'false'; // Manual page views
  document.head.appendChild(script);

  return {
    trackEvent: (name, params) => {
      window.fathom?.trackEvent(name, params);
    },
    trackPageView: (path, title) => {
      window.fathom?.trackPageview({ url: path, title });
    },
    identify: () => {
      // Fathom doesn't support user identification (privacy-focused)
    },
  };
}

/**
 * Initialize Custom Analytics
 * Implement your own analytics logic here
 */
function initCustom(config) {
  console.log('[Analytics] Custom provider initialized:', config);

  return {
    trackEvent: (name, params) => {
      console.log('[Analytics] Event:', name, params);
      // Implement custom tracking logic
    },
    trackPageView: (path, title) => {
      console.log('[Analytics] Page View:', path, title);
    },
    identify: (userId, traits) => {
      console.log('[Analytics] Identify:', userId, traits);
    },
  };
}

/**
 * Load external script
 */
function loadScript(src, options = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    if (options.defer) script.defer = true;
    if (options.crossorigin) script.crossOrigin = options.crossorigin;

    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

/**
 * Initialize analytics
 * Call this once in main.jsx
 */
export const initAnalytics = () => {
  const provider = import.meta.env.VITE_ANALYTICS_PROVIDER || 'custom';
  const providerConfig = PROVIDERS[provider];

  if (!providerConfig) {
    console.warn(`[Analytics] Unknown provider: ${provider}`);
    return null;
  }

  // Get provider-specific config
  let config = {};
  if (provider === 'google') {
    config = { measurementId: import.meta.env.VITE_ANALYTICS_ID };
  } else if (provider === 'plausible' || provider === 'fathom') {
    config = { domain: import.meta.env.VITE_ANALYTICS_DOMAIN, siteId: import.meta.env.VITE_ANALYTICS_ID };
  } else {
    config = { custom: import.meta.env.VITE_ANALYTICS_CONFIG };
  }

  // Initialize provider
  try {
    analyticsProvider = providerConfig.init(config);
    analyticsConfig = { provider, ...config };
    console.log(`[Analytics] ${providerConfig.name} initialized`);
    return analyticsProvider;
  } catch (error) {
    console.error(`[Analytics] Failed to initialize ${providerConfig.name}:`, error);
    return null;
  }
};

/**
 * Track custom event
 */
export const trackEvent = (eventName, params = {}) => {
  if (!analyticsProvider) return;
  analyticsProvider.trackEvent(eventName, params);
};

/**
 * Track page view
 */
export const trackPageView = (path, title) => {
  if (!analyticsProvider) return;
  analyticsProvider.trackPageView(path, title);
};

/**
 * Identify user (for authenticated users)
 */
export const identifyUser = (userId, traits = {}) => {
  if (!analyticsProvider) return;
  analyticsProvider.identify(userId, traits);
};

/**
 * Track tool usage in CanvasFlow
 */
export const trackToolUse = (toolName) => {
  trackEvent('tool_use', { tool: toolName });
};

/**
 * Track element creation
 */
export const trackElementCreate = (elementType) => {
  trackEvent('element_create', { type: elementType });
};

/**
 * Track element deletion
 */
export const trackElementDelete = (count) => {
  trackEvent('element_delete', { count });
};

/**
 * Track export action
 */
export const trackExport = (format) => {
  trackEvent('export', { format });
};

/**
 * Track session start
 */
export const trackSessionStart = (sessionId) => {
  trackEvent('session_start', { session_id: sessionId });
};

export default {
  init: initAnalytics,
  trackEvent,
  trackPageView,
  identifyUser,
  trackToolUse,
  trackElementCreate,
  trackElementDelete,
  trackExport,
  trackSessionStart,
};

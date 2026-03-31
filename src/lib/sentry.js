import * as Sentry from "@sentry/react";
import { createReduxEnhancer } from "@sentry/react";

/**
 * Sentry Error Monitoring Configuration
 * 
 * Setup Instructions:
 * 1. Create a Sentry account at https://sentry.io
 * 2. Create a new React project
 * 3. Copy the DSN from your project settings
 * 4. Add VITE_SENTRY_DSN to your .env file
 * 
 * Environment Variables:
 * - VITE_SENTRY_DSN: Your Sentry DSN (required)
 * - VITE_SENTRY_ENVIRONMENT: Environment name (optional, defaults to 'development')
 * - VITE_SENTRY_TRACES_SAMPLE_RATE: Tracing sample rate 0-1 (optional, defaults to 0.2)
 */

// Create custom Redux enhancer for state tracking (optional)
export const sentryReduxEnhancer = createReduxEnhancer({
  // Optionally pass options to the enhancer
});

/**
 * Initialize Sentry error monitoring
 * Call this in your main.jsx before rendering the app
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
  const tracesSampleRate = parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.2');

  // Skip initialization if no DSN provided (development)
  if (!dsn) {
    console.warn('[Sentry] DSN not provided. Error monitoring disabled.');
    return false;
  }

  Sentry.init({
    dsn,
    environment,
    
    // Performance Monitoring
    tracesSampleRate,
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of error sessions
    
    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Breadcrumb settings
    beforeBreadcrumb(breadcrumb) {
      // Filter out breadcrumbs with PII
      if (breadcrumb.category === 'ui.click') {
        // Remove potentially sensitive data from click breadcrumbs
        delete breadcrumb.data?.element;
      }
      return breadcrumb;
    },

    // Configure error sampling
    sampleRate: 1.0, // Capture all errors

    // Allowlists for integrations
    allowUrls: [
      /canvasflow/i,
      /localhost/i,
    ],

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      
      // Network errors
      'NetworkError',
      'Network request failed',
      
      // Random plugins/extensions
      'Non-Error promise rejection captured',
    ],
  });

  // Set user context (call this after user authentication)
  Sentry.setUser(null);

  return true;
};

/**
 * Set user context for error tracking
 * Call this after user authentication
 */
export const setSentryUser = (user) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

/**
 * Capture custom error
 */
export const captureError = (error, context) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture custom message
 */
export const captureMessage = (message, level = 'info') => {
  Sentry.captureMessage(message, level);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message, data) => {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
};

/**
 * Start a performance transaction
 */
export const startTransaction = (name, op = 'custom') => {
  return Sentry.startSpan({ name, op }, (span) => {
    return span;
  });
};

export default Sentry;

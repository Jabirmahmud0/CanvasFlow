import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initSentry } from '@/lib/sentry'
import { initAnalytics } from '@/lib/analytics'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import './index.css'
import App from './App.jsx'

// Initialize Sentry error monitoring
const isSentryEnabled = initSentry()
console.log('[App] Sentry error monitoring:', isSentryEnabled ? 'enabled' : 'disabled')

// Initialize analytics
const analytics = initAnalytics()
console.log('[App] Analytics:', analytics ? 'initialized' : 'disabled')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

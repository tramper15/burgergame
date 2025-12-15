/**
 * Error tracking and logging utility
 * In production, this logs errors with context for monitoring/debugging
 * Can be extended to integrate with error tracking services (Sentry, etc.)
 */

interface ErrorContext {
  [key: string]: unknown
}

class ErrorTracker {
  /**
   * Log an error with context in production
   * In development, this is a no-op (errors should throw instead)
   */
  logError(message: string, context: ErrorContext, error?: Error): void {
    // Create a structured error log entry
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message,
      context,
      stack: error?.stack || new Error().stack,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }

    // Log to console with full context
    console.error('[Production Error]', message, errorEntry)

    // TODO: Future integration with error tracking service
    // Example: Sentry.captureException(error || new Error(message), { extra: context })
    // Example: fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorEntry) })
  }

  /**
   * Log a warning with context
   */
  logWarning(message: string, context: ErrorContext): void {
    const warningEntry = {
      timestamp: new Date().toISOString(),
      message,
      context
    }

    console.warn('[Production Warning]', message, warningEntry)
  }
}

export const errorTracker = new ErrorTracker()

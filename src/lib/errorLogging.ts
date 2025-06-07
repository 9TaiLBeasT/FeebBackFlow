export interface ErrorLogEntry {
  message: string;
  stack?: string;
  timestamp: string;
  context?: Record<string, unknown>;
  severity: "error" | "warning" | "info";
  source: string;
  userId?: string;
}

class ErrorLoggingService {
  private static instance: ErrorLoggingService;
  private errorQueue: ErrorLogEntry[] = [];
  private readonly MAX_QUEUE_SIZE = 50;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds

  private constructor() {
    this.startPeriodicFlush();
  }

  public static getInstance(): ErrorLoggingService {
    if (!ErrorLoggingService.instance) {
      ErrorLoggingService.instance = new ErrorLoggingService();
    }
    return ErrorLoggingService.instance;
  }

  private startPeriodicFlush(): void {
    if (typeof window !== "undefined") {
      setInterval(() => {
        this.flushErrors();
      }, this.FLUSH_INTERVAL);
    }
  }

  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In production, send to your error tracking service
      // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(errors) });

      // For development, log to console
      console.group("Error Log Batch");
      errors.forEach((error) => {
        const { severity } = error;
        switch (severity) {
          case "error":
            console.error(error);
            break;
          case "warning":
            console.warn(error);
            break;
          default:
            console.info(error);
        }
      });
      console.groupEnd();
    } catch (error) {
      console.error("Failed to flush errors:", error);
    }
  }

  public logError(
    error: Error | string,
    context?: Record<string, unknown>,
  ): void {
    const errorEntry: ErrorLogEntry = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      context,
      severity: "error",
      source: "client",
      userId: this.getCurrentUserId(),
    };

    this.addToQueue(errorEntry);
  }

  public logWarning(message: string, context?: Record<string, unknown>): void {
    const warningEntry: ErrorLogEntry = {
      message,
      timestamp: new Date().toISOString(),
      context,
      severity: "warning",
      source: "client",
      userId: this.getCurrentUserId(),
    };

    this.addToQueue(warningEntry);
  }

  public logInfo(message: string, context?: Record<string, unknown>): void {
    const infoEntry: ErrorLogEntry = {
      message,
      timestamp: new Date().toISOString(),
      context,
      severity: "info",
      source: "client",
      userId: this.getCurrentUserId(),
    };

    this.addToQueue(infoEntry);
  }

  private addToQueue(entry: ErrorLogEntry): void {
    this.errorQueue.push(entry);

    if (this.errorQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flushErrors();
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Get user ID from your auth service
      // Example: return supabase.auth.user()?.id;
      if (typeof window !== "undefined") {
        // Only access localStorage on client side
        return undefined;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }
}

export const errorLogger = ErrorLoggingService.getInstance();

// Error types for better type checking
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

// Helper function to handle async errors
export async function handleAsyncError<T>(
  promise: Promise<T>,
  errorContext?: Record<string, unknown>,
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const typedError =
      error instanceof Error ? error : new Error(String(error));
    errorLogger.logError(typedError, errorContext);
    return [null, typedError];
  }
}

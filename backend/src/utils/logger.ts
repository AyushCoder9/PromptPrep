/**
 * Logger utility for consistent application logging.
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: unknown): void {
    console.log(`[${this.timestamp()}] [INFO] [${this.context}] ${message}`, data || "");
  }

  error(message: string, error?: unknown): void {
    console.error(`[${this.timestamp()}] [ERROR] [${this.context}] ${message}`, error || "");
  }

  warn(message: string, data?: unknown): void {
    console.warn(`[${this.timestamp()}] [WARN] [${this.context}] ${message}`, data || "");
  }

  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${this.timestamp()}] [DEBUG] [${this.context}] ${message}`, data || "");
    }
  }

  private timestamp(): string {
    return new Date().toISOString();
  }
}

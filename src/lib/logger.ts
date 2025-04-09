type LogLevel = "debug" | "info" | "warn" | "error";

interface LogOptions {
  level?: LogLevel;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  private formatMessage(message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const level = options?.level || "info";

    const safeOptions = { ...options };
    delete safeOptions.password;
    delete safeOptions.token;

    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${
      safeOptions ? JSON.stringify(safeOptions) : ""
    }`;
  }

  debug(message: string, options?: LogOptions): void {
    if (this.isDevelopment) {
      console.debug(
        this.formatMessage(message, { ...options, level: "debug" })
      );
    }
  }

  info(message: string, options?: LogOptions): void {
    console.info(this.formatMessage(message, { ...options, level: "info" }));
  }


  warn(message: string, options?: LogOptions): void {
    console.warn(this.formatMessage(message, { ...options, level: "warn" }));
  }

  error(message: string, options?: LogOptions): void {
    console.error(this.formatMessage(message, { ...options, level: "error" }));

    if (!this.isDevelopment && options?.level === "error") {
      // TODO: 集成错误监控系统
      // sendToErrorMonitoring(message, options);
    }
  }
}

export const logger = new Logger();

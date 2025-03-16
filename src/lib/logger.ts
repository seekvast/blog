type LogLevel = "debug" | "info" | "warn" | "error";

interface LogOptions {
  level?: LogLevel;
  [key: string]: any;
}

/**
 * 简单的日志模块
 * 在生产环境中，可以替换为更强大的日志库，如 winston 或 pino
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  /**
   * 格式化日志消息
   */
  private formatMessage(message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const level = options?.level || "info";

    // 移除敏感信息
    const safeOptions = { ...options };
    delete safeOptions.password;
    delete safeOptions.token;

    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${
      safeOptions ? JSON.stringify(safeOptions) : ""
    }`;
  }

  /**
   * 记录调试级别日志
   */
  debug(message: string, options?: LogOptions): void {
    if (this.isDevelopment) {
      console.debug(
        this.formatMessage(message, { ...options, level: "debug" })
      );
    }
  }

  /**
   * 记录信息级别日志
   */
  info(message: string, options?: LogOptions): void {
    console.info(this.formatMessage(message, { ...options, level: "info" }));
  }

  /**
   * 记录警告级别日志
   */
  warn(message: string, options?: LogOptions): void {
    console.warn(this.formatMessage(message, { ...options, level: "warn" }));
  }

  /**
   * 记录错误级别日志
   */
  error(message: string, options?: LogOptions): void {
    console.error(this.formatMessage(message, { ...options, level: "error" }));

    // 在生产环境中，可以将错误发送到监控系统
    if (!this.isDevelopment && options?.level === "error") {
      // TODO: 集成错误监控系统，如 Sentry
      // sendToErrorMonitoring(message, options);
    }
  }
}

export const logger = new Logger();

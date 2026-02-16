type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    userId?: string;
    orgId?: string;
    section?: string;
    [key: string]: any;
}

class Logger {
    private static instance: Logger;
    private currentContext: LogContext = {};

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public setContext(context: Partial<LogContext>) {
        this.currentContext = { ...this.currentContext, ...context };
    }

    public log(level: LogLevel, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const payload = {
            timestamp,
            level,
            message,
            context: this.currentContext,
            data
        };

        // In a real app, this would send to an external observability service 
        // like Sentry, Logfire, or a custom Supabase Edge Function.
        const consoleMethod = level === 'debug' ? 'log' : level;
        console[consoleMethod](`[${timestamp}] [${level.toUpperCase()}] ${message}`, payload);

        // Potential: Push to background job for server-side persistence if critical
        // if (level === 'error') { ... }
    }

    public info(message: string, data?: any) { this.log('info', message, data); }
    public warn(message: string, data?: any) { this.log('warn', message, data); }
    public error(message: string, data?: any) { this.log('error', message, data); }
    public debug(message: string, data?: any) { this.log('debug', message, data); }
}

export const logger = Logger.getInstance();

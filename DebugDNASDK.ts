export interface DebugDNAOptions {
    apiKey: string;
    endpoint?: string;
}

export interface Breadcrumb {
    timestamp: number;
    type: 'log' | 'navigation' | 'click' | 'request';
    message: string;
    data?: any;
}

export interface CrashReport {
    message: string;
    stack: string | undefined;
    breadcrumbs: Breadcrumb[];
    environment: {
        userAgent: string;
        url: string;
        timestamp: number;
    };
}

export class DebugDNASDK {
    private apiKey: string;
    private endpoint: string;
    private breadcrumbs: Breadcrumb[] = [];
    private maxBreadcrumbs = 50;

    constructor(options: DebugDNAOptions) {
        this.apiKey = options.apiKey;
        this.endpoint = options.endpoint || 'https://api.debugdna.com/v1/crash';
        this.init();
    }

    private init() {
        if (typeof window !== 'undefined') {
            // Intercept uncaught exceptions
            window.addEventListener('error', (event) => {
                this.handleCrash(event.error || new Error(event.message));
            });

            // Intercept unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                this.handleCrash(event.reason);
            });

            // Capture basic breadcrumbs
            this.interceptConsole();
            this.interceptClicks();
        }
    }

    private interceptConsole() {
        const originalLog = console.log;
        console.log = (...args) => {
            this.addBreadcrumb('log', args.join(' '));
            originalLog.apply(console, args);
        };
        // Can be extended to warn, error, etc.
    }

    private interceptClicks() {
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            this.addBreadcrumb('click', `Clicked on ${target.tagName} ${target.id ? '#' + target.id : ''}`);
        });
    }

    public addBreadcrumb(type: Breadcrumb['type'], message: string, data?: any) {
        this.breadcrumbs.push({
            timestamp: Date.now(),
            type,
            message,
            data
        });
        if (this.breadcrumbs.length > this.maxBreadcrumbs) {
            this.breadcrumbs.shift(); // Keep bounded
        }
    }

    private async handleCrash(error: any) {
        const report: CrashReport = {
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            breadcrumbs: [...this.breadcrumbs],
            environment: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: Date.now()
            }
        };

        await this.sendCrashReport(report);
    }

    private async sendCrashReport(report: CrashReport) {
        try {
            await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(report)
            });
            console.info('Crash report sent to DebugDNA.');
        } catch (e) {
            console.error('Failed to send crash report to DebugDNA:', e);
        }
    }
}

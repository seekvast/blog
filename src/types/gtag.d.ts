// Type definitions for Google Analytics gtag
interface Window {
  gtag: (
    command: 'config' | 'event' | 'set',
    targetId: string,
    config?: {
      page_path?: string;
      [key: string]: any;
    }
  ) => void;
}

declare const gtag: Window['gtag'];

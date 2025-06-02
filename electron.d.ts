export interface Printer {
  getPrinters: () => Promise<string[]>;
  print: (printerName: string, content: string) => Promise<void>;
}

declare global {
  interface Window {
    printer: Printer;
  }
}
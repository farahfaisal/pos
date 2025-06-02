import { contextBridge } from 'electron';
import { getPrinters, print } from './printer';

// Expose printer functionality to renderer process
contextBridge.exposeInMainWorld('printer', {
  getPrinters: async () => {
    return await getPrinters();
  },
  print: async (printerName: string, content: string) => {
    return await print(printerName, content);
  }
});
import { webContents } from 'electron';

export async function getPrinters(): Promise<string[]> {
  try {
    const printers = await webContents.getAllWebContents()[0].getPrintersAsync();
    return printers.map(printer => printer.name);
  } catch (error) {
    console.error('Error getting printers:', error);
    return [];
  }
}

export async function print(printerName: string, content: string): Promise<void> {
  try {
    const webContent = webContents.getAllWebContents()[0];
    
    // Create a hidden window to render the content
    const window = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Load the content
    await window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);

    // Print options
    const options = {
      silent: true,
      printBackground: true,
      deviceName: printerName,
      margins: {
        marginType: 'none'
      }
    };

    // Print the content
    await window.webContents.print(options);

    // Close the window
    window.close();
  } catch (error) {
    console.error('Error printing:', error);
    throw error;
  }
}
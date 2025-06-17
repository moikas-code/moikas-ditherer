const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onFileOpened: (callback: (filePath: string) => void) => {
    ipcRenderer.on('file-opened', (_event: any, filePath: any) => callback(filePath));
  },
  onSaveImage: (callback: () => void) => {
    ipcRenderer.on('save-image', () => callback());
  },
  showSaveDialog: (options: any) => ipcRenderer.invoke('save-dialog', options),
  saveFile: (filePath: string, buffer: ArrayBuffer) => ipcRenderer.invoke('save-file', filePath, buffer),
});
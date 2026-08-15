const { contextBridge, ipcRenderer } = require('electron');

// Expose safe desktop platform info to the renderer window
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  ping: () => ipcRenderer.invoke('ping'),
});

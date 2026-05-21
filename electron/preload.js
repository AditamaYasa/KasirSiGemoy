const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  print: (htmlContent) => ipcRenderer.invoke('print', htmlContent),
  getPlatform: () => process.platform,
  getAppVersion: () => require('../package.json').version,
});

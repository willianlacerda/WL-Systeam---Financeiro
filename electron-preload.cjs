const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  saveDataSync: (data) => ipcRenderer.sendSync('save-data-sync', data),
  saveLogo: (dataBase64) => ipcRenderer.invoke('save-logo', dataBase64),
  getExternalLogo: () => ipcRenderer.invoke('get-external-logo')
});

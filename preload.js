const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('usbguard', {
    allowDevice: (deviceId) => ipcRenderer.invoke('usbguard:allow', deviceId),
    blockDevice: (deviceId) => ipcRenderer.invoke('usbguard:block', deviceId),
    onDeviceUpdate: (callback) => ipcRenderer.on('usbDevices:update', callback)
});

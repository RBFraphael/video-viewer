const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipc", {
    on: (channel, ...args) => {
        ipcRenderer.on(channel, ...args);
    },
    send: (channel, ...args) => {
        ipcRenderer.send(channel, ...args);
    }
});
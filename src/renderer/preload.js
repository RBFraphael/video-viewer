const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('electronApi', {
    setAudioSource: (cb) => {
        ipcRenderer.on("set-audio-source", cb);
    },
    setVideoSource: (cb) => {
        ipcRenderer.on("set-video-source", cb);
    },
    setAudioSourceId: (deviceId) => {
        ipcRenderer.send("set-audio-device-id", deviceId);
    },
    setVideoSourceId: (deviceId) => {
        ipcRenderer.send("set-video-device-id", deviceId);
    },
    devicesLoaded: (devices) => {
        ipcRenderer.send("devices-loaded", devices);
    }
});
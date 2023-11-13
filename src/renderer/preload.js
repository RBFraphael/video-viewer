const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('electronApi', {
    onSetAudioSource: (cb) => {
        ipcRenderer.on("set-audio-source", cb);
    },
    onSetVideoSource: (cb) => {
        ipcRenderer.on("set-video-source", cb);
    },
    onSetResolutuion: (cb) => {
        ipcRenderer.on("set-resolution", cb);
    },
    setAudioSourceId: (deviceId) => {
        ipcRenderer.send("set-audio-device-id", deviceId);
    },
    setVideoSourceId: (deviceId) => {
        ipcRenderer.send("set-video-device-id", deviceId);
    },
    devicesLoaded: (devices) => {
        ipcRenderer.send("devices-loaded", devices);
    },
    exitFullscreen: () => {
        ipcRenderer.send("exit-fullscreen");
    },
    toggleFullscreen: () => {
        ipcRenderer.send("toggle-fullscreen");
    }
});
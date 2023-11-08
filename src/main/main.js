const { app, BrowserWindow, ipcMain, Menu, ipcRenderer } = require("electron");
const path = require("path");

var appWindow;
var videoDevices = [];
var audioDevices = [];
var currentVideoDevice = "";
var currentAudioDevice = "";

app.on("ready", () => {
    appWindow = new BrowserWindow({
        center: true,
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "../renderer/preload.js")
        }
    });

    appWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    // appWindow.webContents.openDevTools();
    buildMenu();

    ipcMain.on("devices-loaded", (event, devices = []) => {
        if(Array.isArray(devices)){
            videoDevices = [];
            audioDevices = [];

            devices.forEach((device, index) => {
                if(device.kind == "videoinput"){ videoDevices.push(device); }
                if(device.kind == "audioinput"){ audioDevices.push(device); }
            });

            buildMenu();
        }
    });

    ipcMain.on("set-audio-device-id", (event, deviceId) => {
        currentAudioDevice = deviceId;
        buildMenu();
    });
    
    ipcMain.on("set-video-device-id", (event, deviceId) => {
        currentVideoDevice = deviceId;
        buildMenu();
    });

    ipcMain.on("exit-fullscreen", (event) => {
        if(appWindow.isFullScreen()){
            appWindow.setFullScreen(false);
        }
    });
});

app.on("window-all-closed", () => {
    app.quit();
});

function buildMenu(){
    let videoOptions = videoDevices.length > 0 ? videoDevices.map((device) => {
        return {
            label: device.label || `Video Device #${index}`,
            click: () => setVideoSource(device.deviceId),
            checked: device.deviceId == currentVideoDevice,
            type: "checkbox"
        };
    }) : [{ label: "No video devices available", enabled: false }];

    let audioOptions = audioDevices.length > 0 ? audioDevices.map((device) => {
        return {
            label: device.label || `Audio Device #${index}`,
            click: () => setAudioSource(device.deviceId),
            checked: device.deviceId == currentAudioDevice,
            type: "checkbox"
        };
    }) : [{ label: "No audio devices available", enabled: false }];
        
    let menuTemplate = [
        {
            label: "Video",
            submenu: [
                {
                    label: "Sources",
                    submenu: videoOptions
                },
                {
                    label: "Toggle fullscreen",
                    accelerator: "F11",
                    click: () => appWindow.setFullScreen(!appWindow.isFullScreen())
                }
            ]
        },
        {
            label: "Audio",
            submenu: [
                {
                    label: "Sources",
                    submenu: audioOptions
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

function setVideoSource(deviceId){
    appWindow.webContents.send("set-video-source", deviceId);
}

function setAudioSource(deviceId){
    appWindow.webContents.send("set-audio-source", deviceId);
}
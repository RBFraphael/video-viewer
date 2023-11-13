const { app, BrowserWindow, ipcMain, Menu, ipcRenderer, systemPreferences } = require("electron");
const path = require("path");

if(process.platform == "darwin"){
    const microphone = systemPreferences.askForMediaAccess("microphone");
    const camera = systemPreferences.askForMediaAccess("camera");
}

var appWindow;
var videoDevices = [];
var audioDevices = [];
var currentVideoDevice = "";
var currentAudioDevice = "";
var resolutions = [
    { label: "640x480 (4:3)", width: 640, height: 480 },
    { label: "800x600 (4:3)", width: 800, height: 600 },
    { label: "960x720 (4:3)", width: 960, height: 720 },
    { label: "1024x576 (16:9)", width: 1024, height: 576 },
    { label: "1024x768 (4:3)", width: 1024, height: 768 },
    { label: "1152x648 (16:9)", width: 1152, height: 648 },
    { label: "1280x720 (16:9)", width: 1280, height: 720 },
    { label: "1280x960 (4:3)", width: 1280, height: 960 },
    { label: "1366x768 (16:9)", width: 1366, height: 768 },
    { label: "1400x1050 (4:3)", width: 1400, height: 1050 },
    { label: "1440x1080 (4:3)", width: 1440, height: 1080 },
    { label: "1600x900 (16:9)", width: 1600, height: 900 },
    { label: "1600x1200 (4:3)", width: 1600, height: 1200 },
    { label: "1856x1392 (4:3)", width: 1856, height: 1392 },
    { label: "1920x1080 (16:9)", width: 1920, height: 1080 }
];

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

    ipcMain.on("toggle-fullscreen", (event) => {
        appWindow.setFullScreen(!appWindow.isFullScreen());
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
                    label: "Resolution",
                    submenu: resolutions.map((res) => {
                        return {
                            label: res.label,
                            click: () => setResolution(res.width, res.height)
                        };
                    })
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

    if(process.platform == "darwin"){
        menuTemplate = [
            {
                label: "Video Viewer",
                submenu: [
                    {
                        label: "Quit",
                        accelerator: "Cmd+Q",
                        click: () => app.quit()
                    }
                ]
            },
            ...menuTemplate
        ]
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

function setVideoSource(deviceId){
    appWindow.webContents.send("set-video-source", deviceId);
}

function setAudioSource(deviceId){
    appWindow.webContents.send("set-audio-source", deviceId);
}

function setResolution(width, height){
    appWindow.webContents.send("set-resolution", width, height);
}
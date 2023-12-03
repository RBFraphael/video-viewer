const { Menu } = require("electron");
const { resolutions } = require("./constants");
const { storage } = require("./storage");

var recording = false;

const buildMenu = (appWindow, devices = []) => {
    let savedVideoSource = storage.getItem("saved-video-source");
    let savedResolutionIndex = storage.getItem("saved-resolution-index");
    let savedAudioSource = storage.getItem("saved-audio-source");

    var appMenuTemplate = [
        {
            label: "Video Viewer",
            submenu: [
                {
                    label: "Clear Defaults",
                    click: () => storage.clear()
                },
                {
                    label: "Quit",
                    accelerator: "CommandOrControl+Q",
                    click: () => appWindow.destroy()
                }
            ]
        },
        {
            label: "Video",
            submenu: [
                {
                    label: "Sources",
                    submenu: devices.filter((device) => device.kind == "videoinput").map((device, index) => {
                        return {
                            label: device.label,
                            type: "checkbox",
                            checked: savedVideoSource == device.deviceId,
                            click: () => {
                                appWindow.webContents.send("set-video-source", device.deviceId);
                                storage.setItem("saved-video-source", device.deviceId);
                                buildMenu(appWindow, devices);
                            }
                        };
                    })
                },
                {
                    label: "Resolution",
                    submenu: resolutions.map((res, index) => {
                        return {
                            label: res.label,
                            type: "checkbox",
                            checked: savedResolutionIndex == index,
                            click: () => {
                                appWindow.webContents.send("set-resolution", res.width, res.height);
                                storage.setItem("saved-resolution-index", index);
                                buildMenu(appWindow, devices);
                            }
                        };
                    })
                },
                {
                    label: "Toggle Fullscreen",
                    accelerator: "F11",
                    click: () => appWindow.setFullScreen(!appWindow.isFullScreen())
                },
                {
                    label: "Start recording",
                    click: () => {
                        recording = true;
                        appWindow.webContents.send("start-recording");
                        buildMenu(appWindow, devices);
                    },
                    visible: (savedVideoSource !== null && !recording)
                },
                {
                    label: "Stop recording",
                    click: () => {
                        recording = false;
                        appWindow.webContents.send("stop-recording");
                        buildMenu(appWindow, devices);
                    },
                    visible: (savedVideoSource !== null && recording)
                },
            ]
        },
        {
            label: "Audio",
            submenu: [
                {
                    label: "Sources",
                    submenu: devices.filter((device) => device.kind == "audioinput").map((device, index) => {
                        return {
                            label: device.label,
                            type: "checkbox",
                            checked: savedAudioSource == device.deviceId,
                            click: () => {
                                appWindow.webContents.send("set-audio-source", device.deviceId);
                                storage.setItem("saved-audio-source", device.deviceId);
                                buildMenu(appWindow, devices);
                            }
                        };
                    })
                }
            ]
        }
    ];

    if(process.platform == "darwin"){
        appMenuTemplate = [
            ,
            ...appMenuTemplate
        ];
    }

    Menu.setApplicationMenu(
        Menu.buildFromTemplate(appMenuTemplate)
    );
}

module.exports = {
    buildMenu
};
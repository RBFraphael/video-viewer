const { app, ipcMain, systemPreferences } = require("electron");
const { createWindow } = require("./window");
const { buildMenu } = require("./menu");
const { loadDefaults } = require("./defaults");

if(process.platform == "darwin"){
    const microphone = systemPreferences.askForMediaAccess("microphone");
    const camera = systemPreferences.askForMediaAccess("camera");
}

app.on("ready", () => {
    boot();
});

app.on("window-all-closed", () => {
    app.quit();
});

const boot = () => {
    createWindow((appWindow) => {
        setEvents(appWindow);
        loadDefaults(appWindow);
    });
};

const setEvents = (appWindow) => {
    ipcMain.on("devices-loaded", (e, devices = []) => {
        buildMenu(appWindow, devices);
    });

    ipcMain.on("toggle-fullscreen", (e) => {
        appWindow.setFullScreen(!appWindow.isFullScreen());
    });

    ipcMain.on("exit-fullscreen", (e) => {
        if(appWindow.isFullScreen()){
            appWindow.setFullScreen(false);
        }
    });
};
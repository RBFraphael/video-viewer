const { app, ipcMain, systemPreferences } = require("electron");
const { createWindow } = require("./window");
const { buildMenu } = require("./menu");
const { loadDefaults } = require("./defaults");
const { saveRecording } = require("./recording");
const { checkForUpdates } = require("./update");

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
        checkForUpdates(appWindow);
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

    ipcMain.on("save-recording", (e, base64 = "") => {
        saveRecording(appWindow, base64);
    });

    ipcMain.on("focus", (e) => {
        if(appWindow.isMinimized()){
            appWindow.restore();
        }
        appWindow.focus();
    });
};
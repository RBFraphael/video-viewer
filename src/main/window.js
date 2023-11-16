const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

var appWindow = null;

const createWindow = (callback) => {
    if(appWindow == null){
        appWindow = new BrowserWindow({
            center: true,
            width: 800,
            height: 600,
            webPreferences: {
                preload: path.join(__dirname, "../renderer/scripts/preload.js")
            }
        });

        appWindow.loadFile(path.join(__dirname, "../renderer/index.html")).then(() => {
            callback(appWindow);
        });

        if(!app.isPackaged){
            appWindow.webContents.openDevTools();
        }
    }

    Menu.setApplicationMenu(
        Menu.buildFromTemplate([])
    );

    return appWindow;
};

module.exports = {
    createWindow
};
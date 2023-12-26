const axios = require("axios");
const config = require("../../config.json");
const package = require("../../package.json");
const { dialog, shell } = require("electron");

const checkForUpdates = (appWindow, user = false) => {
    axios.get("https://api.github.com/repos/rbfraphael/video-viewer/releases/latest", {
        headers: {
            'Accept': "application/json",
            'Authorization': `Bearer ${config.githubToken}`
        }
    }).then((res) => {
        let latestRelease = res.data;
        
        let currentVersion = parseInt(package.version.replace(/\D/g, ""));
        let latestVersion = parseInt(latestRelease.name.replace(/\D/g, ""));

        if(latestVersion > currentVersion){
            dialog.showMessageBox(appWindow, {
                title: "Update available",
                message: `Video Viewer version ${latestRelease.name} was released. Do you want to download it now?`,
                buttons: [
                    "Yes",
                    "No"
                ],
                cancelId: 1
            }).then((res) => {
                if(res.response == 0){
                    shell.openExternal(latestRelease.html_url);
                }
            });
        } else if(user){
            dialog.showMessageBox(appWindow, {
                title: "Update status",
                message: "You have the latest available version."
            });
        }
    }).catch((err) => {
        console.error("Update check failed", err);
    });
};

module.exports = {
    checkForUpdates
};
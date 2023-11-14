const { resolutions } = require("./constants");
const { storage } = require("./storage");

const loadDefaults = (appWindow) => {
    let savedVideoSource = storage.getItem("saved-video-source");
    let savedResolutionIndex = storage.getItem("saved-resolution-index");
    let savedAudioSource = storage.getItem("saved-audio-source");
    let send = false;

    let defaults = {};

    if(savedVideoSource !== null){
        send = true;
        defaults.videoSource = savedVideoSource;
    }

    if(savedResolutionIndex !== null){
        let res = resolutions[savedResolutionIndex];

        defaults.resolution = {
            width: res.width,
            height: res.height,
        }
    }

    if(savedAudioSource !== null){
        send = true;
        defaults.audioSource = savedAudioSource;
    }

    if(send){
        appWindow.webContents.send("load-defaults", defaults);
    }
}

module.exports = {
    loadDefaults
};
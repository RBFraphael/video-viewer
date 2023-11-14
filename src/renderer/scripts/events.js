window.ipc.on("load-defaults", (e, defaults) => {
    if(defaults.videoSource){
        window.videoSource = defaults.videoSource;
    }
    
    if(defaults.resolution){
        window.videoWidth = defaults.resolution.width;
        window.videoHeight = defaults.resolution.height;
    }

    if(defaults.audioSource){
        window.audioSource = defaults.audioSource;
    }

    window.loadStream();
});

window.ipc.on("set-video-source", (e, videoSource) => {
    window.videoSource = videoSource;

    window.loadStream();
});

window.ipc.on("set-resolution", (e, width, height) => {
    window.videoWidth = width;
    window.videoHeight = height;

    window.loadStream();
});

window.ipc.on("set-audio-source", (e, audioSource) => {
    window.audioSource = audioSource;

    window.loadStream();
});

window.addEventListener("keydown", (e) => {
    if(e.key == "Escape"){
        window.ipc.send("exit-fullscreen");
    }
});

window.videoElement.addEventListener("click", (e) => {
    if(e.detail == 2){
        window.ipc.send("toggle-fullscreen");
    }
});
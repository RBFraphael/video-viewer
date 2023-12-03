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

window.ipc.on("start-recording", (e) => {
    window.recordingElement.classList.add("rec");
    window.startRecording();
});

window.ipc.on("stop-recording", (e) => {
    window.recordingElement.classList.remove("rec");
    window.stopRecording();
});

window.ipc.on("saving-recorded-file", (e, path) => {
    window.recordingStatusElement.textContent = "Saving file...";
    window.recordingStatusElement.classList.add("show");
});

window.ipc.on("recorded-file-saved", (e, path) => {
    window.recordingStatusElement.textContent = "File saved!";
    setTimeout(() => {
        window.recordingStatusElement.textContent = "";
        window.recordingStatusElement.classList.remove("show");
    }, 3500);
});
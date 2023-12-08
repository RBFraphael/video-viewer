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

    window.recordingStart = 0;
    if(window.recordingInterval){ clearInterval(window.recordingInterval); }
    window.recordingTimerElement.textContent = "00:00";

    window.recordingInterval = setInterval(() => {
        window.recordingStart++;

        let minutes = Math.floor(window.recordingStart / 60);
        let seconds = window.recordingStart - (minutes * 60);
        
        let timeString = `${("0"+minutes).slice(-2)}:${("0"+seconds).slice(-2)}`;
        
        window.recordingTimerElement.textContent = timeString;
    }, 1000);
});

window.ipc.on("stop-recording", (e) => {
    window.recordingElement.classList.remove("rec");
    window.stopRecording();

    if(window.recordingInterval){ clearInterval(window.recordingInterval); }
    window.recordingInterval = null;
    window.recordingStart = 0;
    window.recordingTimerElement.textContent = "";
});

window.ipc.on("saving-recorded-file", (e, path) => {
    window.recordingStatusElement.classList.add("show");
    window.recordingStatusElement.querySelector("p#status").innerHTML = `Saving video file <span class="loading"></span>`;
});

window.ipc.on("encoding-status", (e, data) => {
    window.recordingStatusElement.querySelector("p#encoding").textContent = `Encoding ${data.time}@${data.speed}...`;
});

window.ipc.on("recorded-file-saved", (e, path) => {
    window.recordingStatusElement.querySelector("p#status").innerHTML = `File saved <img src="./resources/check-icon.svg">`;
    window.recordingStatusElement.querySelector("p#encoding").textContent = "";

    setTimeout(() => {
        window.recordingStatusElement.querySelector("p").innerHTML = "";
        window.recordingStatusElement.classList.remove("show");
    }, 3500);
});
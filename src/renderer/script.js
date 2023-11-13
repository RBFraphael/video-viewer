let video = document.getElementById("video");
let volume = document.getElementById("volume");

let pipToggle = document.getElementById("toggle-pip");
let mutedToggle = document.getElementById("toggle-muted");

let videoDeviceId = null;
let audioDeviceId = null;

let width = 1920;
let height = 1080;

var mouseIsHidden = false;
var mouseTimeout;
var mouseHideSet = false;

navigator.mediaDevices.enumerateDevices().then((devices) => {
    let data = devices.map((device, index) => {
        if(device.kind == "audioinput" && audioDeviceId == null){ audioDeviceId = device.deviceId; }
        if(device.kind == "videoinput" && videoDeviceId == null){ videoDeviceId = device.deviceId; }

        return {
            deviceId: device.deviceId,
            label: device.label || `Video Device #${index}`,
            kind: device.kind
        };
    });

    window.electronApi.devicesLoaded(data);
    
    window.electronApi.onSetAudioSource((event, deviceId) => {
        audioDeviceId = deviceId;
        loadStream();
    });

    window.electronApi.onSetVideoSource((event, deviceId) => {
        videoDeviceId = deviceId;
        loadStream();
    });

    window.electronApi.onSetResolutuion((event, _width, _height) => {
        width = _width;
        height = _height;
        loadStream();
    });
});

volume.addEventListener("input", (e) => {
    let value = e.target.value;
    video.volume = value / 100;
});

pipToggle.addEventListener("click", (e) => {
    video.requestPictureInPicture();
});

mutedToggle.addEventListener("click", (e) => {
    video.muted = !video.muted;
    volume.disabled = video.muted;

    if(video.muted){
        document.getElementById("volume-icon").src = "muted-icon.svg";
    } else {
        document.getElementById("volume-icon").src = "volume-icon.svg";
    }
});

window.addEventListener("keydown", (e) => {
    if(e.key == "Escape"){
        window.electronApi.exitFullscreen();
    }
});

window.addEventListener("click", (e) => {
    if(e.detail == 2){
        window.electronApi.toggleFullscreen();
    }
});

function loadStream()
{
    if(!mouseHideSet){
        window.addEventListener("mousemove", (e) => {
            if(mouseTimeout){ clearTimeout(mouseTimeout); }

            mouseTimeout = setTimeout(() => {
                if(!mouseIsHidden){
                    document.body.style.cursor = "none";
                    mouseIsHidden = true;
                }
            }, 3000);

            if(mouseIsHidden){
                document.body.style.cursor = "auto";
                mouseIsHidden = false;
            }
        });

        mouseHideSet = true;
    }

    if(window.stream){
        window.stream.getTracks().forEach(track => {
          track.stop();
        });
    }

    let constraints = {
        audio: {
            deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
            autoGainControl: { exact: false },
            channelCount: { ideal: 2 },
            echoCancellation: { exact: false },
            noiseSuppression: { exact: false }
        },
        video: {
            deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: 60 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        stream.getTracks().forEach((track) => {
            let kind = track.kind;
            let deviceId = track.getSettings().deviceId;

            if(kind == "audio"){
                window.electronApi.setAudioSourceId(deviceId);
            }

            if(kind == "video"){
                window.electronApi.setVideoSourceId(deviceId);
            }
        });

        window.stream = stream;
        video.srcObject = stream;
    });

    document.querySelector("div#config").classList.add("visible");
    setTimeout(() => {
        document.querySelector("div#config").classList.remove("visible");
    }, 3000)
}
let video = document.getElementById("video");
let volume = document.getElementById("volume");

let pipToggle = document.getElementById("toggle-pip");
let mutedToggle = document.getElementById("toggle-muted");

let videoDeviceId = null;
let audioDeviceId = null;

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
    
    window.electronApi.setAudioSource((event, deviceId) => {
        audioDeviceId = deviceId;
        loadStream();
    });

    window.electronApi.setVideoSource((event, deviceId) => {
        videoDeviceId = deviceId;
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
});

function loadStream()
{
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
            width: { ideal: 1920 },
            height: { ideal: 1080 },
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
}
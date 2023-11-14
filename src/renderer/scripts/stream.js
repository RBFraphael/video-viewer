navigator.mediaDevices.enumerateDevices().then((devices) => {
    let sources = devices.map((d) => {
        return {
            label: d.label, kind: d.kind, deviceId: d.deviceId
        };
    });
    window.ipc.send("devices-loaded", sources);
});

window.loadStream = () => {
    if(window.stream){
        window.stream.getTracks().forEach(track => {
          track.stop();
        });
    }

    let constraints = {};
    
    if(window.videoSource){
        constraints.video = {
            deviceId: { exact: window.videoSource },
            width: { ideal: window.videoWidth ?? 1920 },
            height: { ideal: window.videoHeight ?? 1080 },
            frameRate: { ideal: 60 }
        };
    }

    if(window.audioSource){
        constraints.audio = {
            deviceId: { exact: window.audioSource },
            autoGainControl: { exact: false },
            channelCount: { ideal: 2 },
            echoCancellation: { exact: false },
            noiseSuppression: { exact: false }
        };
    }

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        window.stream = stream;
        window.videoElement.srcObject = stream;
    }).catch((err) => {
        console.error(err);
    });
};
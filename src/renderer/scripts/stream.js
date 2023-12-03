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

window.startRecording = () => {
    window.recordedBlobs = [];
    let mimeType = "video/x-matroska;codecs=avc1,opus";

    if(MediaRecorder.isTypeSupported(mimeType)){
        window.mediaRecorder = new MediaRecorder(
            window.stream, {mimeType}
        );

        window.mediaRecorder.addEventListener("dataavailable", (event) => {
            if(event.data && event.data.size > 0){
                window.recordedBlobs.push(event.data);
            }
        });

        window.mediaRecorder.addEventListener("stop", (event) => {
            var blob = new Blob(
                window.recordedBlobs, 
                { type: window.recordedBlobs[0].type }
            );
            
            var reader = new FileReader();
            reader.onload = () => {
                let b64Data = reader.result;
                window.ipc.send("save-recording", b64Data);
            };
            reader.readAsDataURL(blob);
        });

        window.mediaRecorder.start();
    } else {
        alert("Recording not supported");
    }
};

window.stopRecording = () => {
    window.mediaRecorder.stop();
};
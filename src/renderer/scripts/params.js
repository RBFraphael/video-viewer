window.videoSource = null;
window.videoWidth = null;
window.videoHeight = null;
window.audioSource = null;

window.infoElement = document.getElementById("info");
window.videoElement = document.getElementById("video");
window.pipToggleElement = document.getElementById("toggle-pip");
window.audioToggleElement = document.getElementById("toggle-muted");
window.audioToggleIconElement = document.getElementById("volume-icon");
window.volumeSliderElement = document.getElementById("volume");
window.recordingElement = document.getElementById("recording");
window.recordingTimerElement = document.querySelector("#recording span#rec-time");
window.recordingStatusElement = document.getElementById("recording-status");

window.stream = null;
window.mediaRecorder = null;
window.recordedBlobs = [];
window.recordingStart = 0;
window.recordingInterval = null;
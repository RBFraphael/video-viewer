window.videoSource = null;
window.videoWidth = null;
window.videoHeight = null;
window.audioSource = null;

window.videoElement = document.getElementById("video");
window.pipToggleElement = document.getElementById("toggle-pip");
window.audioToggleElement = document.getElementById("toggle-muted");
window.audioToggleIconElement = document.getElementById("volume-icon");
window.volumeSliderElement = document.getElementById("volume");
window.recordingElement = document.getElementById("recording");
window.recordingStatusElement = document.getElementById("recording-status");

window.stream = null;
window.mediaRecorder = null;
window.recordedBlobs = [];
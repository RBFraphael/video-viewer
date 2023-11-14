window.mouseHideSetup = false;

window.volumeSliderElement.addEventListener("input", (e) => {
    let value = e.target.value;
    window.videoElement.volume = value / 100;
});

window.audioToggleElement.addEventListener("click", (e) => {
    window.videoElement.muted = !video.muted;
    window.volumeSliderElement.disabled = video.muted;
    window.audioToggleIconElement.src = window.videoElement.muted ? "./resources/muted-icon.svg" : "./resources/volume-icon.svg";
});

window.pipToggleElement.addEventListener("click", (e) => {
    window.videoElement.requestPictureInPicture();
});

var mouseIsHidden = false;
var mouseTimeout;
var mouseHideSet = false;

const setupMouseHide = () => {
    if(window.stream && !window.mouseHideSetup){
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

        window.mouseHideSetup = true;
    } else {
        requestAnimationFrame(setupMouseHide);
    }
};

setupMouseHide();
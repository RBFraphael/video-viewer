const { app, dialog, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const { Worker } = require("node:worker_threads");

const saveRecording = (appWindow, base64 = "") => {
    let date = new Date();

    let dateString = date.getFullYear().toString();
    dateString += ("0"+(date.getMonth()+1)).slice(-2);
    dateString += ("0"+date.getDate()).slice(-2);
    dateString += ("0"+date.getHours()).slice(-2);
    dateString += ("0"+date.getMinutes()).slice(-2);
    dateString += ("0"+date.getSeconds()).slice(-2);

    dialog.showMessageBox(appWindow, {
        title: "Video format",
        message: "Which video format and codec (video/audio) the file should be saved as?",
        buttons: [
            "WebM (h264/Opus) - Faster",
            "Mp4 (h264/aac) - Slower",
            "Cancel"
        ],
        cancelId: 2
    }).then((res) => {
        let optionIndex = res.response;
        
        if(optionIndex == 0){
            let fileName = `record_${dateString}.webm`;

            dialog.showSaveDialog(appWindow, {
                buttonLabel: "Save",
                title: "Save video as...",
                filters: {
                    name: "Recorded video",
                    extensions: ["webm"]
                },
                defaultPath: fileName
            }).then((res) => {
                if(!res.canceled){
                    appWindow.webContents.send("saving-recorded-file", res.filePath);

                    let base64Parts = base64.split("base64,");
                    let base64Data = base64Parts[1];

                    fs.writeFileSync(res.filePath, base64Data, "base64");
                    shell.showItemInFolder(res.filePath);

                    appWindow.webContents.send("recorded-file-saved", res.filePath);
                }
            });
        }

        if(optionIndex == 1){
            let fileName = `record_${dateString}.mp4`;

            dialog.showSaveDialog(appWindow, {
                buttonLabel: "Save",
                title: "Save video as...",
                filters: {
                    name: "Recorded video",
                    extensions: ["mp4"]
                },
                defaultPath: fileName
            }).then((res) => {
                if(!res.canceled){
                    appWindow.webContents.send("saving-recorded-file", res.filePath);

                    let tempPath = path.join(app.getPath("temp"), (new Date()).getTime().toString());
                    if(!fs.existsSync(tempPath)){
                        fs.mkdirSync(tempPath, { recursive: true });
                    }

                    let base64Parts = base64.split("base64,");
                    let base64Data = base64Parts[1];
                    fs.writeFileSync(path.join(tempPath, "input.webm"), base64Data, "base64");

                    let workerFile = path.join(__dirname, "/libs/ffmpeg-worker-mp4.js");
                    let ffmpegWorker = new Worker(workerFile);
                    ffmpegWorker.on("message", (e) => {
                        switch(e.type){
                            case "ready":
                                ffmpegWorker.postMessage({
                                    type: "run",
                                    arguments: `-i data/input.webm -preset ultrafast -y data/output.mp4`.split(" "),
                                    mounts: [
                                        {
                                            type: "NODEFS",
                                            opts: {
                                                root: tempPath
                                            },
                                            mountpoint: "/data",
                                        }
                                    ],
                                    chdir: "/"
                                });
                                break;
                            case "stdout":
                                break;
                            case "stderr":
                                let data = e.data;
                                let progress = {};

                                data.toString().split(" ").forEach((segment) => {
                                    if(segment.indexOf("time=") > -1){ progress.time = segment.split("=")[1]; }
                                    if(segment.indexOf("speed=") > -1){ progress.speed = segment.split("=")[1]; }
                                });

                                if(Object.keys(progress).length > 0){
                                    appWindow.webContents.send("encoding-status", progress);
                                }

                                break;
                            case "done":
                                fs.copyFileSync(path.join(tempPath, "output.mp4"), res.filePath);
                                shell.showItemInFolder(res.filePath);
                                fs.rmSync(tempPath, {
                                    force: true, recursive: true
                                });

                                appWindow.webContents.send("recorded-file-saved", res.filePath);
                                break;
                        }
                    });
                }
            });
        }
    });   
}

module.exports = {
    saveRecording
};
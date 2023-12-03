const { app, dialog, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const webmToMp4 = require("webm-to-mp4");

const tempFileName = (length = 8) => {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var filename = "";

    for(let i = 0; i < length; i++){
        let index = Math.floor(Math.random() * chars.length);
        filename += chars.charAt(index);
    }

    return filename;
}

const saveRecording = (appWindow, base64 = "") => {
    let date = new Date();

    let dateString = date.getFullYear().toString();
    dateString += ("0"+(date.getMonth()+1)).slice(-2);
    dateString += ("0"+date.getDate()).slice(-2);
    dateString += ("0"+date.getHours()).slice(-2);
    dateString += ("0"+date.getMinutes()).slice(-2);
    dateString += ("0"+date.getSeconds()).slice(-2);

    let tmpFile = `${tempFileName()}.tmp`;
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
            
            let base64Parts = base64.split("base64,");
            let base64Data = base64Parts[1];
            
            let tmpPath = path.join(path.dirname(res.filePath), tmpFile);
            
            fs.writeFileSync(tmpPath, base64Data, "base64");

            fs.writeFileSync(
                res.filePath,
                Buffer.from(
                    webmToMp4(
                        fs.readFileSync(tmpPath)
                    )
                )
            );

            fs.unlinkSync(tmpPath);

            // fs.opendirSync(path.dirname(res.filePath));
            shell.showItemInFolder(res.filePath);

            appWindow.webContents.send("recorded-file-saved", res.filePath);
        }
    });
}

module.exports = {
    saveRecording
};
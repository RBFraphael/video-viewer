const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const dataDir = app.getPath("userData");
const file = path.join(dataDir, "user.json");
const data = {};

const loadFile = () => {
    if(fs.existsSync(file)){
        let fileContent = fs.readFileSync(file);
        let fileData = JSON.parse(fileContent);

        Object.keys(fileData).forEach((key) => {
            data[key] = fileData[key];
        });
    }
}

const writeFile = () => {
    fs.writeFileSync(file, JSON.stringify(data));
}

loadFile();

const storage = {
    setItem: (name, value) => {
        data[name] = value;
        writeFile();
    },
    getItem: (name, defaultValue = null) => {
        if(data.hasOwnProperty(name)){
            return data[name];
        }
        return defaultValue;
    },
    removeItem: (name) => {
        if(data.hasOwnProperty(name)){
            delete data[name];
            writeFile();
        }
    },
    clear: () => {
        Object.keys(data).forEach((key) => {
            delete data[key];
        });
        writeFile();
    }
};

module.exports = {
    storage
};
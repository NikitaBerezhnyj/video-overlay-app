const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;
let videoWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "renderer.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
}

function createVideoWindow(filePath) {
  videoWindow = new BrowserWindow({
    width: 640,
    height: 360,
    alwaysOnTop: true,
    frame: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  videoWindow.loadFile("videoPlayer.html");
  videoWindow.webContents.on("did-finish-load", () => {
    videoWindow.webContents.send("play-video", filePath);
  });

  videoWindow.on("closed", () => {
    videoWindow = null;
    mainWindow.webContents.send("video-stopped");
  });
}

app.whenReady().then(() => {
  createMainWindow();
});

ipcMain.handle("get-video-list", () => {
  const filePath = path.join(__dirname, "video.json");
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(filePath));
});

ipcMain.handle("add-video", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Videos", extensions: ["mp4", "mov", "webm"] }],
  });

  if (!canceled) {
    const videos = JSON.parse(
      fs.readFileSync(path.join(__dirname, "video.json"))
    );
    videos.push(filePaths[0]);
    fs.writeFileSync(
      path.join(__dirname, "video.json"),
      JSON.stringify(videos)
    );
    return videos;
  }
  return null;
});

ipcMain.handle("delete-video", (event, index) => {
  const filePath = path.join(__dirname, "video.json");
  const videos = JSON.parse(fs.readFileSync(filePath));
  videos.splice(index, 1);
  fs.writeFileSync(filePath, JSON.stringify(videos));
  return videos;
});

ipcMain.on("start-video", (event, filePath) => {
  if (!videoWindow) {
    createVideoWindow(filePath);
  } else {
    videoWindow.close();
  }
});

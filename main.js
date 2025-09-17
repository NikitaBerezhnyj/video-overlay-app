const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;
let videoWindow;
const videosFile = path.join(__dirname, "videos.json");

function ensureVideoFile() {
  if (!fs.existsSync(videosFile)) {
    fs.writeFileSync(videosFile, "[]", "utf-8");
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow.loadFile("index.html");
}

function createVideoWindow(videoPath) {
  videoWindow = new BrowserWindow({
    width: 640,
    height: 360,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  videoWindow.loadFile("video.html");

  videoWindow.webContents.on("did-finish-load", () => {
    videoWindow.webContents.send("play-video", videoPath);
  });

  videoWindow.on("closed", () => {
    videoWindow = null;
  });
}

app.whenReady().then(() => {
  ensureVideoFile();
  createMainWindow();

  ipcMain.handle("get-video-list", async () => {
    try {
      const data = fs.readFileSync(videosFile, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  });

  ipcMain.handle("add-video", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Videos", extensions: ["mp4", "mov", "avi", "mkv"] }]
    });
    if (canceled || filePaths.length === 0) return null;

    const list = JSON.parse(fs.readFileSync(videosFile, "utf-8"));
    const videoPath = filePaths[0];
    list.push(videoPath);
    fs.writeFileSync(videosFile, JSON.stringify(list, null, 2), "utf-8");
    return list;
  });

  ipcMain.handle("delete-video", async (_, index) => {
    const list = JSON.parse(fs.readFileSync(videosFile, "utf-8"));
    list.splice(index, 1);
    fs.writeFileSync(videosFile, JSON.stringify(list, null, 2), "utf-8");
    return list;
  });

  ipcMain.handle("start-video", async () => {
    if (videoWindow) {
      videoWindow.close();
      videoWindow = null;
      return "stopped";
    }

    const list = JSON.parse(fs.readFileSync(videosFile, "utf-8"));
    if (list.length === 0) return "no-videos";

    const randomVideo = list[Math.floor(Math.random() * list.length)];
    createVideoWindow(randomVideo);
    return "started";
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

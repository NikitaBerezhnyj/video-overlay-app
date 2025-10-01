const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;
let videoWindow;
let isPlaying = false;

const videosFile = path.join(__dirname, "videos.json");

function ensureVideoFile() {
  if (!fs.existsSync(videosFile)) {
    fs.writeFileSync(videosFile, "[]", "utf-8");
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  mainWindow.loadFile("index.html");
}

function getRandomVideo(excludePath = null) {
  const list = JSON.parse(fs.readFileSync(videosFile, "utf-8"));
  if (list.length === 0) return null;

  if (list.length === 1) return list[0];

  let availableVideos = excludePath ? list.filter(v => v !== excludePath) : list;

  if (availableVideos.length === 0) availableVideos = list;

  return availableVideos[Math.floor(Math.random() * availableVideos.length)];
}

function createVideoWindow(videoPath) {
  if (!videoWindow) {
    videoWindow = new BrowserWindow({
      width: 640,
      height: 360,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      resizable: true,
      movable: true,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js")
      }
    });

    videoWindow.loadFile("video.html");

    videoWindow.on("closed", () => {
      videoWindow = null;
      isPlaying = false;
    });

    videoWindow.webContents.once("did-finish-load", () => {
      if (videoPath) videoWindow.webContents.send("play-video", videoPath);
    });
  } else {
    if (videoWindow.webContents) {
      videoWindow.webContents.send("play-video", videoPath);
    }
  }
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
      filters: [{ name: "Videos", extensions: ["mp4", "mov", "avi", "mkv", "webm"] }]
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
    const list = JSON.parse(fs.readFileSync(videosFile, "utf-8"));
    if (list.length === 0) return "no-videos";

    if (!isPlaying) {
      const randomVideo = getRandomVideo();
      isPlaying = true;
      createVideoWindow(randomVideo);
      return "started";
    } else {
      isPlaying = false;
      if (videoWindow) videoWindow.close();
      return "stopped";
    }
  });

  ipcMain.handle("next-video", async (_, currentVideoPath) => {
    if (!isPlaying || !videoWindow) return;

    const list = JSON.parse(fs.readFileSync(videosFile, "utf-8"));
    if (list.length === 0) {
      isPlaying = false;
      return;
    }

    const nextVideo = getRandomVideo(currentVideoPath);

    createVideoWindow(nextVideo);
  });
});

Menu.setApplicationMenu(null);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

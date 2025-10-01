const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getVideoList: () => ipcRenderer.invoke("get-video-list"),
  addVideo: () => ipcRenderer.invoke("add-video"),
  deleteVideo: index => ipcRenderer.invoke("delete-video", index),
  startVideo: () => ipcRenderer.invoke("start-video"),
  nextVideo: currentPath => ipcRenderer.invoke("next-video", currentPath),
  onPlayVideo: callback => ipcRenderer.on("play-video", (_, path) => callback(path))
});

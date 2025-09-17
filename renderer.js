const { ipcRenderer } = require("electron");

const videoListEl = document.getElementById("videoList");
const addBtn = document.getElementById("addBtn");

async function loadVideos() {
  const videos = await ipcRenderer.invoke("get-video-list");
  videoListEl.innerHTML = "";
  videos.forEach((video, index) => {
    const li = document.createElement("li");
    li.textContent = video.split("/").pop();

    const startBtn = document.createElement("button");
    startBtn.textContent = "Старт";
    startBtn.onclick = () => {
      ipcRenderer.send("start-video", video);
      startBtn.textContent =
        startBtn.textContent === "Старт" ? "Стоп" : "Старт";
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Видалити";
    deleteBtn.onclick = async () => {
      await ipcRenderer.invoke("delete-video", index);
      loadVideos();
    };

    li.appendChild(startBtn);
    li.appendChild(deleteBtn);
    videoListEl.appendChild(li);
  });
}

addBtn.onclick = async () => {
  await ipcRenderer.invoke("add-video");
  loadVideos();
};

ipcRenderer.on("video-stopped", () => {
  loadVideos();
});

loadVideos();

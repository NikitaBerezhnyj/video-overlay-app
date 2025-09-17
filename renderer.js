const { ipcRenderer } = require("electron");

const videoListEl = document.getElementById("videoList");
const addBtn = document.getElementById("addBtn");
const startBtn = document.getElementById("startBtn");

async function loadVideos() {
  const videos = await ipcRenderer.invoke("get-video-list");
  videoListEl.innerHTML = "";
  videos.forEach((video, index) => {
    const li = document.createElement("li");
    li.textContent = video.split("/").pop();

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Видалити";
    deleteBtn.onclick = async () => {
      await ipcRenderer.invoke("delete-video", index);
      loadVideos();
    };

    li.appendChild(deleteBtn);
    videoListEl.appendChild(li);
  });
}

addBtn.onclick = async () => {
  await ipcRenderer.invoke("add-video");
  loadVideos();
};

startBtn.onclick = async () => {
  const videos = await ipcRenderer.invoke("get-video-list");
  if (videos.length === 0) return alert("Немає відео для відтворення");

  if (startBtn.textContent === "Старт") {
    const randomIndex = Math.floor(Math.random() * videos.length);
    ipcRenderer.send("start-video", videos[randomIndex]);
    startBtn.textContent = "Стоп";
  } else {
    ipcRenderer.send("stop-video");
    startBtn.textContent = "Старт";
  }
};

ipcRenderer.on("video-stopped", () => {
  startBtn.textContent = "Старт";
});

loadVideos();

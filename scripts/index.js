const listEl = document.getElementById("list");
const startBtn = document.getElementById("start");
const videoCountEl = document.getElementById("videoCount");
const videoCountStatusEl = document.getElementById("videoCountStatus");

function generateThumbnail(videoPath, callback) {
  const video = document.createElement("video");
  video.src = `file://${videoPath}`;
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.currentTime = 0.1;
  video.addEventListener("loadeddata", () => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth / 4;
    canvas.height = video.videoHeight / 4;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    callback(canvas.toDataURL("image/png"));
  });
}

function updateVideoCount(count) {
  let countText;

  if (count === 0) {
    countText = "0 відео";
  } else if (count === 1) {
    countText = "1 відео";
  } else {
    countText = `${count} відео`;
  }

  videoCountEl.textContent = countText;
  videoCountStatusEl.textContent = countText;
}

async function refreshList() {
  const list = await window.api.getVideoList();
  const noVideoEl = document.querySelector(".no-video-container");
  listEl.innerHTML = "";

  updateVideoCount(list.length);

  if (list.length === 0) {
    listEl.style.display = "none";
    noVideoEl.style.display = "flex";
  } else {
    listEl.style.display = "grid";
    noVideoEl.style.display = "none";

    list.forEach((video, i) => {
      const card = document.createElement("div");
      card.className = "video-card";

      const thumbContainer = document.createElement("div");
      thumbContainer.className = "thumb-container loading";

      const img = document.createElement("img");
      img.className = "thumb";
      img.alt = "Прев'ю відео";

      generateThumbnail(video, thumbnail => {
        img.src = thumbnail;
        thumbContainer.classList.remove("loading");
      });

      const overlay = document.createElement("div");
      overlay.className = "thumb-overlay";
      overlay.textContent = "Відео";

      thumbContainer.appendChild(img);
      thumbContainer.appendChild(overlay);

      const cardContent = document.createElement("div");
      cardContent.className = "card-content";

      const title = document.createElement("p");
      title.textContent = video.split(/[\\/]/).pop();
      title.title = video.split(/[\\/]/).pop();

      const cardActions = document.createElement("div");
      cardActions.className = "card-actions";

      const del = document.createElement("button");
      del.innerHTML = "<span>❌</span><span>Видалити</span>";
      del.onclick = async e => {
        e.stopPropagation();
        await window.api.deleteVideo(i);
        refreshList();
      };

      cardActions.appendChild(del);
      cardContent.appendChild(title);
      cardContent.appendChild(cardActions);

      card.appendChild(thumbContainer);
      card.appendChild(cardContent);
      listEl.appendChild(card);
    });
  }
}

document.getElementById("add").onclick = async () => {
  await window.api.addVideo();
  refreshList();
};

startBtn.onclick = async () => {
  const res = await window.api.startVideo();
  if (res === "started") {
    startBtn.innerHTML = "<span>⏹</span><span>Зупинити</span>";
    startBtn.classList.add("active");
  }
  if (res === "stopped") {
    startBtn.innerHTML = "<span>▶️</span><span>Запустити</span>";
    startBtn.classList.remove("active");
  }
};

refreshList();

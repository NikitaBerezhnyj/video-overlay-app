const player = document.getElementById("player");
let currentVideoPath = null;

window.api.onPlayVideo(videoPath => {
  currentVideoPath = videoPath;
  player.src = `file://${videoPath}`;
  player.play();
});

player.onended = async () => {
  await window.api.nextVideo(currentVideoPath);
};

let hintShown = true;
document.addEventListener(
  "mousemove",
  () => {
    if (hintShown) {
      const hint = document.getElementById("drag-hint");
      setTimeout(() => {
        hint.style.opacity = "0";
        hint.style.transition = "opacity 0.5s";
      }, 2000);
      hintShown = false;
    }
  },
  { once: true }
);

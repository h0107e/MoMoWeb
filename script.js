const stage = document.querySelector("#stage");
const scenes = [...document.querySelectorAll(".scene")];
const veil = document.querySelector(".transition-veil");
const cursor = document.querySelector("#lanternCursor");
const light = document.querySelector("#lightSource");
const canvas = document.querySelector("#fxCanvas");
const ctx = canvas.getContext("2d");
const drawButton = document.querySelector("#drawButton");
const choiceButtons = [...document.querySelectorAll("#choiceGrid button")];
const prompt = document.querySelector("#drawPrompt");
const blindBoxStage = document.querySelector("#blindBoxStage");
const boxModel = document.querySelector("#boxModel");
const hubToast = document.querySelector("#hubToast");

const figures = [
  { name: "醒狮少年", story: "鼓点一响，百厄皆退。愿你心有热望，步步生风。" },
  { name: "京剧戏迷", story: "一腔一式，皆有乾坤。愿你从容登场，自成风骨。" },
  { name: "景德镇", story: "入窑一色，出窑万彩。愿你经受淬炼，终见澄澈。" },
  { name: "皮影戏", story: "一灯一幕，演尽古今。愿你身后有光，眼中有戏。" },
  { name: "布老虎", story: "虎头纳福，守护长安。愿你勇敢温柔，所行皆坦途。" },
  { name: "苗绣蝴蝶", story: "一针一线，绣出故乡。愿你破茧振翅，心有所归。" },
  { name: "纸鸢高手", story: "借一缕风，扶摇云上。愿你自在舒展，志在青空。" },
  { name: "鱼灯", story: "鱼跃灯明，岁岁有余。愿你循光而游，好事将近。" },
  { name: "敦煌飞天", story: "飘带凌空，千年一瞬。愿你无拘无束，心游万仞。" }
];

let selected = null;
let currentScene = "home";
let drawing = false;
let pointer = { x: 800, y: 500 };
let targetPointer = { x: 800, y: 500 };
let soundOn = false;
let audioContext;

const sceneRatios = {
  home: 1586 / 992,
  hub: 1609 / 977,
  draw: 1536 / 1024,
  result: 1609 / 977
};

function goTo(name) {
  if (name === currentScene) return;
  veil.classList.remove("is-running");
  void veil.offsetWidth;
  veil.classList.add("is-running");
  setTimeout(() => {
    stage.style.setProperty("--ratio", sceneRatios[name]);
    scenes.forEach(scene => scene.classList.toggle("is-active", scene.dataset.scene === name));
    currentScene = name;
  }, 585);
  setTimeout(() => veil.classList.remove("is-running"), 1380);
}

document.querySelector("#enterJourney").addEventListener("click", () => goTo("hub"));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.go)));
document.querySelectorAll("[data-hub-action='draw']").forEach(button => button.addEventListener("click", () => goTo("draw")));
document.querySelectorAll("[data-hub-label]").forEach(button => button.addEventListener("click", () => {
  hubToast.textContent = `「${button.dataset.hubLabel}」内容正在筹备中`;
  hubToast.classList.add("is-visible");
  clearTimeout(hubToast.hideTimer);
  hubToast.hideTimer = setTimeout(() => hubToast.classList.remove("is-visible"), 1800);
}));

blindBoxStage.addEventListener("pointermove", event => {
  const rect = blindBoxStage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  boxModel.style.setProperty("--tilt-x", `${-8 - y * 22}deg`);
  boxModel.style.setProperty("--tilt-y", `${x * 34}deg`);
});
blindBoxStage.addEventListener("pointerleave", () => {
  boxModel.style.setProperty("--tilt-x", "-8deg");
  boxModel.style.setProperty("--tilt-y", "-18deg");
});

choiceButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    selected = index;
    choiceButtons.forEach((item, i) => item.classList.toggle("is-selected", i === index));
    prompt.textContent = `已与「${figures[index].name}」的灵灯相应`;
  });
});

document.querySelector("#quickDraw").addEventListener("click", () => {
  selected = Math.floor(Math.random() * figures.length);
  choiceButtons[selected].click();
  runDraw();
});

function runDraw() {
  if (drawing) return;
  drawing = true;
  drawButton.classList.add("is-drawing");
  drawButton.querySelector("span").textContent = "灵灯寻缘中";
  const result = selected ?? Math.floor(Math.random() * figures.length);
  setTimeout(() => {
    document.querySelector("#resultName").textContent = figures[result].name;
    document.querySelector("#resultStory").textContent = figures[result].story;
    goTo("result");
    drawButton.classList.remove("is-drawing");
    drawButton.querySelector("span").textContent = "抽取盲盒";
    drawing = false;
  }, 820);
}
drawButton.addEventListener("click", runDraw);

document.querySelector("#collectButton").addEventListener("click", event => {
  const label = event.currentTarget.querySelector("span");
  label.textContent = "已收入藏阁";
  event.currentTarget.querySelector("i").textContent = "✓";
  setTimeout(() => { label.textContent = "收入藏阁"; event.currentTarget.querySelector("i").textContent = "珍藏"; }, 1800);
});

stage.addEventListener("pointermove", event => {
  const rect = stage.getBoundingClientRect();
  targetPointer.x = ((event.clientX - rect.left) / rect.width) * 1600;
  targetPointer.y = ((event.clientY - rect.top) / rect.height) * 1000;
  const xPercent = (targetPointer.x / 1600) * 100;
  const yPercent = (targetPointer.y / 1000) * 100;
  scenes.forEach(scene => {
    scene.style.setProperty("--light-x", `${xPercent}%`);
    scene.style.setProperty("--light-y", `${yPercent}%`);
  });
});

const particles = Array.from({ length: 72 }, () => ({
  x: Math.random() * 1600,
  y: Math.random() * 1000,
  r: Math.random() * 1.6 + .35,
  vy: Math.random() * .23 + .08,
  vx: (Math.random() - .5) * .12,
  a: Math.random() * .65 + .18,
  phase: Math.random() * Math.PI * 2
}));

function drawFx(time) {
  ctx.clearRect(0, 0, 1600, 1000);
  pointer.x += (targetPointer.x - pointer.x) * .16;
  pointer.y += (targetPointer.y - pointer.y) * .16;
  cursor.style.left = `${(pointer.x / 1600) * 100}%`;
  cursor.style.top = `${(pointer.y / 1000) * 100}%`;
  light.style.left = `${(pointer.x / 1600) * 100}%`;
  light.style.top = `${(pointer.y / 1000) * 100}%`;

  particles.forEach(p => {
    p.y -= p.vy;
    p.x += p.vx + Math.sin(time * .0004 + p.phase) * .09;
    if (p.y < -8) { p.y = 1008; p.x = Math.random() * 1600; }
    const twinkle = p.a * (.62 + Math.sin(time * .002 + p.phase) * .38);
    const distance = Math.hypot(p.x - pointer.x, p.y - pointer.y);
    const glow = distance < 190 ? (1 - distance / 190) * .8 : 0;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 202, 112, ${Math.max(.05, twinkle + glow)})`;
    ctx.shadowColor = "#ffbd5f";
    ctx.shadowBlur = 6 + glow * 12;
    ctx.arc(p.x, p.y, p.r + glow, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  requestAnimationFrame(drawFx);
}
requestAnimationFrame(drawFx);

document.querySelector("#soundToggle").addEventListener("click", async event => {
  soundOn = !soundOn;
  event.currentTarget.classList.toggle("is-on", soundOn);
  event.currentTarget.querySelector("small").textContent = soundOn ? "水巷" : "静谧";
  if (!soundOn) {
    audioContext?.close();
    audioContext = null;
    return;
  }
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const gain = audioContext.createGain();
  gain.gain.value = .025;
  gain.connect(audioContext.destination);
  const osc = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  osc.type = "sine"; osc.frequency.value = 174;
  osc2.type = "sine"; osc2.frequency.value = 261;
  osc.connect(gain); osc2.connect(gain);
  osc.start(); osc2.start();
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (currentScene === "result") goTo("draw");
    else if (currentScene === "draw") goTo("hub");
    else if (currentScene === "hub") goTo("home");
  }
  if (event.key === "Enter" && currentScene === "home") goTo("hub");
});

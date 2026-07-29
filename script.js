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
const resultScene = document.querySelector(".scene-result");
const fishLanternModel = document.querySelector("#fishLanternModel");
let fishModelLoader = null;

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

let selected = 7;
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

choiceButtons[7].classList.add("is-selected");
prompt.textContent = `已与「${figures[7].name}」的灵灯相应`;

document.querySelector("#quickDraw").addEventListener("click", () => {
  selected = Math.floor(Math.random() * figures.length);
  choiceButtons[selected].click();
  runDraw();
});

function presentResult(result) {
  const isFishLantern = result === 7;
  resultScene.classList.toggle("has-3d-model", isFishLantern);
  document.querySelector("#resultName").textContent = figures[result].name;
  document.querySelector("#resultStory").textContent = figures[result].story;
}

async function loadFishModel() {
  if (!customElements.get("model-viewer")) {
    fishModelLoader ??= import("./assets/model-viewer.min.js");
    await fishModelLoader;
  }
  if (!fishLanternModel.hasAttribute("src")) {
    fishLanternModel.setAttribute("src", fishLanternModel.dataset.src);
  }
}

function runDraw() {
  if (drawing) return;
  drawing = true;
  drawButton.classList.add("is-drawing");
  drawButton.querySelector("span").textContent = "灵灯寻缘中";
  const result = selected ?? Math.floor(Math.random() * figures.length);
  setTimeout(() => {
    presentResult(result);
    goTo("result");
    if (result === 7) {
      setTimeout(() => {
        if (currentScene === "result") loadFishModel().catch(console.error);
      }, 1450);
    }
    drawButton.classList.remove("is-drawing");
    drawButton.querySelector("span").textContent = "抽取盲盒";
    drawing = false;
  }, 820);
}
drawButton.addEventListener("click", runDraw);

fishLanternModel.addEventListener("load", () => {
  fishLanternModel.classList.add("loaded");
});

if (new URLSearchParams(window.location.search).get("result") === "fish") {
  presentResult(7);
  stage.style.setProperty("--ratio", sceneRatios.result);
  scenes.forEach(scene => scene.classList.toggle("is-active", scene.dataset.scene === "result"));
  currentScene = "result";
  setTimeout(() => loadFishModel().catch(console.error), 120);
}

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

const petals = Array.from({ length: 24 }, (_, index) => ({
  x: Math.random() * 1600,
  y: Math.random() * 1080 - 80,
  size: Math.random() * 7 + 5,
  depth: Math.random() * .72 + .28,
  vx: (Math.random() - .5) * .22,
  vy: Math.random() * .42 + .22,
  angle: Math.random() * Math.PI * 2,
  spin: (Math.random() - .5) * .009,
  phase: Math.random() * Math.PI * 2,
  sway: Math.random() * 1.25 + .45,
  tint: index % 3
}));

function drawWater(time) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(640, 720);
  ctx.lineTo(960, 720);
  ctx.lineTo(1420, 1000);
  ctx.lineTo(180, 1000);
  ctx.closePath();
  ctx.clip();
  ctx.globalCompositeOperation = "lighter";

  for (let row = 0; row < 18; row += 1) {
    const y = 748 + row * 14.5;
    const depth = row / 17;
    const halfWidth = 105 + depth * 535;
    const wave = Math.sin(time * .00115 + row * .67);
    const center = 800 + wave * (5 + depth * 13);
    const alpha = .055 + depth * .085;
    const lineWidth = .75 + depth * 1.55;
    const segments = 6 + Math.floor(depth * 7);

    for (let segment = 0; segment < segments; segment += 1) {
      const progress = (segment + .18) / segments;
      const startX = center - halfWidth + progress * halfWidth * 2;
      const length = (22 + depth * 58) * (.72 + .28 * Math.sin(segment * 2.1 + time * .001));
      const wobble = Math.sin(time * .0017 + row * .8 + segment) * (1.2 + depth * 2.8);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 210, 125, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.moveTo(startX, y + wobble);
      ctx.bezierCurveTo(
        startX + length * .3, y - 2.4 - wobble,
        startX + length * .72, y + 2.2 + wobble,
        startX + length, y - wobble * .35
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}

function paintPetal(petal, time) {
  const sway = Math.sin(time * .0011 * petal.sway + petal.phase);
  petal.y += petal.vy * (.65 + petal.depth);
  petal.x += petal.vx + sway * .18;
  petal.angle += petal.spin;

  if (petal.y > 1040 || petal.x < -50 || petal.x > 1650) {
    petal.x = Math.random() * 1600;
    petal.y = -30 - Math.random() * 160;
  }

  const palette = [
    ["rgba(255,176,145,.68)", "rgba(224,86,76,.2)"],
    ["rgba(255,211,168,.66)", "rgba(240,133,91,.2)"],
    ["rgba(246,148,142,.58)", "rgba(193,62,69,.18)"]
  ][petal.tint];
  const size = petal.size * (.7 + petal.depth * .6);

  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate(petal.angle + sway * .38);
  ctx.scale(1, .72 + Math.abs(sway) * .32);
  const gradient = ctx.createLinearGradient(-size, -size, size, size);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(1, palette[1]);
  ctx.fillStyle = gradient;
  ctx.shadowColor = "rgba(255,157,102,.28)";
  ctx.shadowBlur = 5 * petal.depth;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.bezierCurveTo(size * .92, -size * .45, size * .82, size * .45, 0, size);
  ctx.bezierCurveTo(-size * .7, size * .38, -size * .88, -size * .4, 0, -size);
  ctx.fill();
  ctx.restore();
}

function drawFx(time) {
  ctx.clearRect(0, 0, 1600, 1000);
  pointer.x += (targetPointer.x - pointer.x) * .16;
  pointer.y += (targetPointer.y - pointer.y) * .16;
  cursor.style.left = `${(pointer.x / 1600) * 100}%`;
  cursor.style.top = `${(pointer.y / 1000) * 100}%`;
  light.style.left = `${(pointer.x / 1600) * 100}%`;
  light.style.top = `${(pointer.y / 1000) * 100}%`;

  if (currentScene === "home") {
    drawWater(time);
    petals.forEach(petal => paintPetal(petal, time));
    particles.forEach(p => {
      p.y -= p.vy;
      p.x += p.vx + Math.sin(time * .0004 + p.phase) * .09;
      if (p.y < -8) { p.y = 1008; p.x = Math.random() * 1600; }
      const twinkle = p.a * (.62 + Math.sin(time * .002 + p.phase) * .38);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 202, 112, ${Math.max(.05, twinkle)})`;
      ctx.shadowColor = "#ffbd5f";
      ctx.shadowBlur = 6;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
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

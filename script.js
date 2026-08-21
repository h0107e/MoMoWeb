const stage = document.querySelector("#stage");
const app = document.querySelector("#app");
const scenes = [...document.querySelectorAll(".scene")];
const veil = document.querySelector(".transition-veil");
const transitionVideo = document.querySelector("#transitionVideo");
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
const hubBoxViewer = document.querySelector("#hubBoxViewer");
const resultModelViewer = document.querySelector("#resultModelViewer");
const resultModelLoading = document.querySelector("#resultModelLoading");
const resultCollectCard = document.querySelector("#resultCollectCard");
const resultCollectCardImage = document.querySelector("#resultCollectCardImage");
const photoVideo = document.querySelector("#photoVideo");
const photoModelViewer = document.querySelector("#photoModelViewer");
const photoFrameOverlay = document.querySelector("#photoFrameOverlay");
const photoPreview = document.querySelector("#photoPreview");
const photoStatus = document.querySelector("#photoStatus");
const photoCameraEmpty = document.querySelector("#photoCameraEmpty");
const photoCountdown = document.querySelector("#photoCountdown");
const photoPaper = document.querySelector("#photoPaper");
const capturePhotoButton = document.querySelector("#capturePhoto");
const retakePhotoButton = document.querySelector("#retakePhoto");
const downloadPhotoButton = document.querySelector("#downloadPhoto");
let modelViewerLoader = null;
let photoStream = null;
let photoFrameCanvas = null;
let photoMode = "frame";
const photoSceneImage = new Image();
photoSceneImage.src = "./assets/cloth-tiger-photo-scene.png";
let resultRotationTimer = null;
let resultCardDockTimer = null;
let resultModelRevealTimer = null;

const figures = [
  {
    name: "醒狮少年",
    story: "鼓点一响，百厄皆退。愿你心有热望，步步生风。",
    model: "./assets/XingShi.glb",
    modelAlt: "醒狮少年非遗玩偶三维模型",
    cameraOrbit: "90deg 82deg 2.25m",
    card: "./assets/Card-XingShi.webp",
    cardAlt: "MOMO 醒狮 SSR 非遗收藏卡"
  },
  {
    name: "京剧戏迷",
    story: "一腔一式，皆有乾坤。愿你从容登场，自成风骨。",
    model: "./assets/JingJu.glb",
    modelAlt: "京剧戏迷非遗玩偶三维模型",
    cameraOrbit: "90deg 82deg 2.25m",
    card: "./assets/Card-JingJu.webp",
    cardAlt: "MOMO 京剧 SSR 非遗收藏卡"
  },
  {
    name: "景德镇",
    story: "入窑一色，出窑万彩。愿你经受淬炼，终见澄澈。",
    model: "./assets/JingDeZhen.glb",
    modelAlt: "景德镇非遗玩偶三维模型",
    cameraOrbit: "90deg 82deg 2.25m",
    card: "./assets/Card-JingDeZhen.webp",
    cardAlt: "MOMO 景德镇 SSR 非遗收藏卡"
  },
  {
    name: "皮影戏",
    story: "一灯一幕，演尽古今。愿你身后有光，眼中有戏。",
    model: "./assets/PiYingXi.glb",
    modelAlt: "皮影戏非遗玩偶三维模型",
    cameraOrbit: "90deg 82deg 2.25m",
    card: "./assets/Card-PiYingXi.webp",
    cardAlt: "MOMO 皮影戏 SSR 非遗收藏卡"
  },
  {
    name: "布老虎",
    story: "虎头纳福，守护长安。愿你勇敢温柔，所行皆坦途。",
    model: "./assets/BuLaoHu.glb",
    modelAlt: "布老虎非遗玩偶三维模型",
    cameraOrbit: "90deg 82deg 2.25m",
    card: "./assets/Card-BuLaoHu.webp",
    cardAlt: "MOMO 布老虎 SSR 非遗收藏卡"
  },
  {
    name: "青花瓷",
    story: "青白相映，瓷韵天成。愿你心如澄瓷，温润坚定。",
    model: "./assets/QingHuaCi.glb",
    modelAlt: "青花瓷非遗玩偶三维模型",
    cameraOrbit: "90deg 82deg 2.25m",
    card: "./assets/Card-QingHuaCi.webp",
    cardAlt: "MOMO 青花瓷 SSR 非遗收藏卡"
  },
  {
    name: "泥塑",
    story: "泥土有形，匠心有温。愿你守住本真，塑成心中所愿。",
    model: "./assets/NiSu.glb",
    modelAlt: "泥塑非遗玩偶三维模型",
    cameraOrbit: "90deg 82deg 2.25m",
    card: "./assets/Card-NiSu.jpg",
    cardAlt: "MOMO 泥塑 SSR 非遗收藏卡"
  },
  {
    name: "鱼灯",
    story: "鱼跃灯明，岁岁有余。愿你循光而游，好事将近。",
    model: "./assets/YUDengV2.glb",
    modelAlt: "鱼灯2.0非遗玩偶三维模型",
    cameraOrbit: "90deg 82deg 2.25m",
    card: "./assets/Card-YuDeng.webp",
    cardAlt: "MOMO 鱼灯 SSR 非遗收藏卡"
  },
  {
    name: "傩戏",
    story: "戴面起舞，逐疫纳福。愿你无惧前路，心怀正气与光明。",
    model: "./assets/NuoXi.glb",
    modelAlt: "傩戏非遗玩偶三维模型",
    cameraOrbit: "90deg 82deg 2.25m",
    card: "./assets/Card-NuoXi.png",
    cardAlt: "MOMO 傩戏 SSR 非遗收藏卡"
  }
];

const heritageDescriptions = [
  "锣鼓唤醒狮魂，以腾跃、采青与礼俗寄托驱邪纳福的愿望。",
  "一腔一式皆有程法，脸谱、唱腔与身段共同讲述东方舞台故事。",
  "泥与火在窑中相遇，千年制瓷技艺凝成温润清透的东方器物。",
  "一灯一幕，雕刻镂空的影偶在光中演绎民间故事与百态人生。",
  "以布为形、以纹纳福，憨拙虎形承载长辈对孩童平安成长的守护。",
  "青花料在素坯上勾勒纹样，经高温烧制凝成清雅含蓄的东方瓷韵。",
  "一抔泥土经捏塑、刻画与彩绘化作鲜活形象，承载民间生活与乡土记忆。",
  "鱼形灯彩循光游动，寄托年年有余、灯火相伴的生活愿景。",
  "面具、祭仪与舞步共同构成古老傩戏，以驱疫纳福寄托平安愿望。"
];
const heritageListButtons = [...document.querySelectorAll("#heritageList button")];
const heritageCardImage = document.querySelector("#heritageCardImage");
const heritageCardPlaceholder = document.querySelector("#heritageCardPlaceholder");
const heritageNumber = document.querySelector("#heritageNumber");
const heritageName = document.querySelector("#heritageName");
const heritageDescription = document.querySelector("#heritageDescription");
const heritageStatus = document.querySelector("#heritageStatus");
const heritageDrawButton = document.querySelector("#heritageDrawButton");
const cardViewer = document.querySelector("#cardViewer");
const cardViewerImage = document.querySelector("#cardViewerImage");
const cardViewerName = document.querySelector("#cardViewerName");
const cardGallery = document.querySelector("#cardGallery");
const orbitCards = [...document.querySelectorAll("#cardGallery .orbit-card")];
const cardOrbitName = document.querySelector("#cardOrbitName");
const cardOrbitShell = document.querySelector(".card-orbit-shell");
let heritageSelection = 0;
let cardOrbitIndex = 0;
let cardOrbitPosition = 0;
let orbitPointerId = null;
let orbitLastX = 0;
let suppressCardClickUntil = 0;
let orbitWheelLockedUntil = 0;
let gestureOrbitX = null;

let selected = null;
let currentScene = "home";
let drawing = false;
let transitioning = false;
let queuedDraw = false;
let pointer = { x: 800, y: 500 };
let targetPointer = { x: 800, y: 500 };
let resultFrontOrbit = "0deg 82deg 2.25m";

function goTo(name) {
  if ((name === currentScene && name !== "result") || transitioning) return;
  transitioning = true;
  let sceneChanged = false;
  let sceneTimer;
  let finishTimer;

  const changeScene = () => {
    if (sceneChanged) return;
    sceneChanged = true;
    if (name === "draw" && currentScene === "result") resetDrawState();
    if (currentScene === "photo" && name !== "photo") stopPhotoCamera();
    app.dataset.scene = name;
    scenes.forEach(scene => scene.classList.toggle("is-active", scene.dataset.scene === name));
    currentScene = name;
    if (name !== "cards") closeCardViewer();
    if (name === "hub") {
      const loadModel = () => loadHubBoxModel().catch(console.error);
      if ("requestIdleCallback" in window) {
        requestIdleCallback(loadModel, { timeout: 900 });
      } else {
        setTimeout(loadModel, 300);
      }
    }
    if (name === "photo") preparePhotoScene();
  };

  if (name !== "result") {
    changeScene();
    transitioning = false;
    if (queuedDraw && currentScene === "draw") {
      queuedDraw = false;
      runDraw();
    }
    return;
  }

  const finishTransition = () => {
    changeScene();
    clearTimeout(sceneTimer);
    clearTimeout(finishTimer);
    transitionVideo.removeEventListener("ended", finishTransition);
    transitionVideo.pause();
    veil.classList.remove("is-running", "is-fallback");
    veil.style.removeProperty("pointer-events");
    transitioning = false;
    if (currentScene === "result") {
      startResultRevealSequence();
    }
    if (queuedDraw && currentScene === "draw") {
      queuedDraw = false;
      runDraw();
    }
  };

  const useFallback = () => {
    veil.classList.add("is-fallback");
    clearTimeout(sceneTimer);
    clearTimeout(finishTimer);
    sceneTimer = setTimeout(changeScene, 585);
    finishTimer = setTimeout(finishTransition, 1380);
  };

  veil.style.removeProperty("pointer-events");
  veil.classList.remove("is-running", "is-fallback");
  void veil.offsetWidth;
  veil.classList.add("is-running");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    useFallback();
    return;
  }

  transitionVideo.pause();
  transitionVideo.currentTime = 0;
  sceneTimer = setTimeout(changeScene, 1450);
  finishTimer = setTimeout(finishTransition, 3600);
  transitionVideo.addEventListener("ended", finishTransition, { once: true });
  transitionVideo.play().catch(useFallback);
}

document.querySelector("#enterJourney").addEventListener("click", () => goTo("hub"));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => goTo(button.dataset.go)));
document.querySelectorAll("[data-hub-action='draw']").forEach(button => button.addEventListener("click", () => startDirectDraw()));
document.querySelectorAll(".member-lantern").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".member-lantern").forEach(member => {
    const active = member === button;
    member.classList.toggle("is-current", active);
    member.setAttribute("aria-pressed", String(active));
  });
}));
document.querySelectorAll("[data-hub-label]").forEach(button => button.addEventListener("click", () => {
  hubToast.textContent = `「${button.dataset.hubLabel}」内容正在筹备中`;
  hubToast.classList.add("is-visible");
  clearTimeout(hubToast.hideTimer);
  hubToast.hideTimer = setTimeout(() => hubToast.classList.remove("is-visible"), 1800);
}));

function updateHeritageDetail(index) {
  const figure = figures[index];
  heritageSelection = index;
  heritageListButtons.forEach((button, buttonIndex) => button.classList.toggle("is-active", buttonIndex === index));
  heritageNumber.textContent = `HERITAGE · ${String(index + 1).padStart(2, "0")}`;
  heritageName.textContent = figure.name;
  heritageDescription.textContent = heritageDescriptions[index];
  if (figure.card) {
    heritageCardImage.src = figure.card;
    heritageCardImage.alt = figure.cardAlt || `${figure.name}非遗收藏卡`;
    heritageCardImage.hidden = false;
    heritageCardPlaceholder.hidden = true;
  } else {
    heritageCardImage.hidden = true;
    heritageCardPlaceholder.hidden = false;
  }
  heritageStatus.textContent = figure.model
    ? "卡牌与三维模型已收录"
    : figure.card
      ? "收藏卡已收录 · 三维模型待补充"
      : "卡牌与三维模型正在共创中";
}

heritageListButtons.forEach(button => {
  button.addEventListener("click", () => updateHeritageDetail(Number(button.dataset.index)));
});

heritageDrawButton.addEventListener("click", () => {
  startDirectDraw(heritageSelection);
});

function closeCardViewer() {
  cardViewer.hidden = true;
  cardViewer.setAttribute("aria-hidden", "true");
  cardViewer.classList.remove("is-open");
}

function openCardViewer(button) {
  if (!button.dataset.card) return;
  cardViewerImage.src = button.dataset.card;
  cardViewerImage.alt = `${button.dataset.name}非遗收藏卡大图`;
  cardViewerName.textContent = `${button.dataset.name} · HERITAGE CARD`;
  cardViewer.hidden = false;
  cardViewer.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => cardViewer.classList.add("is-open"));
}

function layoutCardOrbit() {
  const count = orbitCards.length;
  cardOrbitIndex = ((Math.round(cardOrbitPosition) % count) + count) % count;
  orbitCards.forEach((card, index) => {
    let relativeIndex = (index - cardOrbitPosition + count) % count;
    if (relativeIndex > count / 2) relativeIndex -= count;
    const angle = relativeIndex * Math.PI * 2 / count;
    const depth = (Math.cos(angle) + 1) / 2;
    const x = Math.sin(angle) * 34;
    const y = -(1 - depth) * 17;
    const scale = .56 + depth * .76;
    const rotateY = -Math.sin(angle) * 28;

    card.style.left = `${50 + x}%`;
    card.style.top = `${55 + y}%`;
    card.style.zIndex = `${10 + Math.round(depth * 90)}`;
    card.style.opacity = `${.28 + depth * .72}`;
    card.style.filter = `brightness(${.62 + depth * .45}) blur(${(1 - depth) * .7}px)`;
    card.style.transform = `translate(-50%, -50%) perspective(900px) rotateY(${rotateY}deg) scale(${scale})`;
    const isCenter = index === cardOrbitIndex;
    card.classList.toggle("is-center", isCenter);
    card.setAttribute("aria-selected", isCenter ? "true" : "false");
    card.tabIndex = isCenter ? 0 : -1;
  });
  const activeCard = orbitCards[cardOrbitIndex];
  cardOrbitName.textContent = activeCard.dataset.name;
  cardOrbitShell.classList.toggle("is-future-center", !activeCard.dataset.card);
}

function rotateCardOrbit(step) {
  cardOrbitPosition = Math.round(cardOrbitPosition) + step;
  layoutCardOrbit();
}

function snapCardOrbit() {
  cardOrbitPosition = Math.round(cardOrbitPosition);
  layoutCardOrbit();
}

orbitCards.forEach((button, index) => {
  button.addEventListener("click", () => {
    if (performance.now() < suppressCardClickUntil) return;
    if (index !== cardOrbitIndex) {
      cardOrbitPosition = index;
      layoutCardOrbit();
      return;
    }
    openCardViewer(button);
  });
});
document.querySelector("#cardOrbitPrev").addEventListener("click", () => rotateCardOrbit(-1));
document.querySelector("#cardOrbitNext").addEventListener("click", () => rotateCardOrbit(1));

cardGallery.addEventListener("pointerdown", event => {
  if (event.button !== 0) return;
  orbitPointerId = event.pointerId;
  orbitLastX = event.clientX;
  cardOrbitShell.classList.add("is-dragging");
});
window.addEventListener("pointermove", event => {
  if (event.pointerId !== orbitPointerId) return;
  const delta = event.clientX - orbitLastX;
  orbitLastX = event.clientX;
  const dragPerCard = Math.max(190, cardOrbitShell.getBoundingClientRect().width * .14);
  cardOrbitPosition -= delta / dragPerCard;
  layoutCardOrbit();
  if (Math.abs(delta) > 1) suppressCardClickUntil = performance.now() + 260;
});
function finishOrbitDrag(event) {
  if (event.pointerId !== orbitPointerId) return;
  orbitPointerId = null;
  cardOrbitShell.classList.remove("is-dragging");
  snapCardOrbit();
}
window.addEventListener("pointerup", finishOrbitDrag);
window.addEventListener("pointercancel", finishOrbitDrag);
cardGallery.addEventListener("wheel", event => {
  event.preventDefault();
  const now = performance.now();
  if (now < orbitWheelLockedUntil) return;
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (Math.abs(delta) < 2) return;
  rotateCardOrbit(delta > 0 ? 1 : -1);
  orbitWheelLockedUntil = now + 220;
}, { passive: false });
cardGallery.addEventListener("keydown", event => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  rotateCardOrbit(event.key === "ArrowRight" ? 1 : -1);
  orbitCards[cardOrbitIndex].focus();
});

window.addEventListener("momo-gesture-palm", event => {
  const { active, clientX, clientY, now } = event.detail;
  if (!active || currentScene !== "cards" || cardViewer.classList.contains("is-open")) {
    if (gestureOrbitX != null) snapCardOrbit();
    gestureOrbitX = null;
    cardOrbitShell.classList.remove("is-palm-moving");
    return;
  }
  const rect = cardOrbitShell.getBoundingClientRect();
  if (gestureOrbitX == null) {
    gestureOrbitX = clientX;
    cardOrbitShell.classList.add("is-palm-moving");
    return;
  }
  const delta = clientX - gestureOrbitX;
  gestureOrbitX = clientX;
  const palmTravelPerCard = Math.max(250, rect.width * .19);
  cardOrbitPosition -= delta / palmTravelPerCard;
  layoutCardOrbit();
});

document.querySelector("#cardViewerClose").addEventListener("click", closeCardViewer);
cardViewer.addEventListener("click", event => {
  if (event.target === cardViewer) closeCardViewer();
});
layoutCardOrbit();

async function loadHubBoxModel() {
  if (!customElements.get("model-viewer")) {
    modelViewerLoader ??= import("./assets/model-viewer.min.js");
    await modelViewerLoader;
  }
  if (!hubBoxViewer.hasAttribute("src")) {
    hubBoxViewer.setAttribute("src", hubBoxViewer.dataset.src);
  }
}

hubBoxViewer.addEventListener("load", () => hubBoxViewer.classList.add("loaded"));

function holdResultModelFront() {
  clearTimeout(resultRotationTimer);
  resultModelViewer.removeAttribute("auto-rotate");
  resultModelViewer.removeAttribute("camera-orbit");
  resultModelViewer.setAttribute("camera-orbit", resultFrontOrbit);
  resultModelViewer.jumpCameraToGoal?.();
  if (currentScene !== "result" || transitioning || resultScene.classList.contains("is-model-concealed")) return;
  resultRotationTimer = setTimeout(() => {
    if (currentScene === "result" && resultModelViewer.hasAttribute("src")) {
      resultModelViewer.setAttribute("auto-rotate", "");
    }
  }, 3000);
}

resultModelViewer.addEventListener("load", () => {
  resultModelViewer.classList.add("loaded");
  resultModelLoading.classList.add("is-hidden");
  holdResultModelFront();
});
resultModelViewer.addEventListener("error", () => {
  resultModelLoading.textContent = "灵影暂未显现";
});

async function presentResultModel(figure) {
  clearTimeout(resultRotationTimer);
  resultModelViewer.removeAttribute("auto-rotate");
  resultModelViewer.classList.remove("loaded");
  resultModelLoading.classList.remove("is-hidden");

  if (!figure.model) {
    resultModelViewer.removeAttribute("src");
    resultModelViewer.setAttribute("aria-hidden", "true");
    resultModelLoading.classList.add("is-hidden");
    resultScene.classList.remove("has-result-model");
    return;
  }

  resultScene.classList.add("has-result-model");
  resultModelViewer.removeAttribute("aria-hidden");
  resultModelViewer.alt = figure.modelAlt || `${figure.name}三维模型`;
  resultModelLoading.textContent = `${figure.name}灵影呈现中`;
  resultFrontOrbit = figure.cameraOrbit || "0deg 82deg 2.25m";
  resultModelViewer.removeAttribute("camera-orbit");
  resultModelViewer.setAttribute("camera-orbit", resultFrontOrbit);

  if (!customElements.get("model-viewer")) {
    modelViewerLoader ??= import("./assets/model-viewer.min.js");
    await modelViewerLoader;
  }
  if (resultModelViewer.getAttribute("src") !== figure.model) {
    resultModelViewer.setAttribute("src", figure.model);
  } else if (resultModelViewer.loaded) {
    resultModelViewer.classList.add("loaded");
    resultModelLoading.classList.add("is-hidden");
    holdResultModelFront();
  }
}

function clearResultRevealTimers() {
  clearTimeout(resultCardDockTimer);
  clearTimeout(resultModelRevealTimer);
}

function prepareResultReveal(figure) {
  clearResultRevealTimers();
  resultScene.classList.remove("has-result-card", "is-card-intro", "is-card-docked", "is-model-concealed", "is-model-revealed");

  if (!figure.card) {
    resultCollectCard.hidden = true;
    resultCollectCardImage.removeAttribute("src");
    resultCollectCardImage.alt = "";
    resultScene.classList.add("is-model-revealed");
    return;
  }

  resultCollectCard.hidden = false;
  resultCollectCardImage.src = figure.card;
  resultCollectCardImage.alt = figure.cardAlt || `${figure.name}非遗收藏卡`;
  resultScene.classList.add("has-result-card", "is-model-concealed");
}

function revealResultModel() {
  resultScene.classList.remove("is-model-concealed");
  resultScene.classList.add("is-model-revealed");
  if (resultModelViewer.loaded) holdResultModelFront();
}

function startResultRevealSequence() {
  clearResultRevealTimers();

  if (!resultScene.classList.contains("has-result-card")) {
    revealResultModel();
    return;
  }

  resultScene.classList.add("is-card-intro");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    resultScene.classList.add("is-card-docked");
    revealResultModel();
    return;
  }

  resultCardDockTimer = setTimeout(() => {
    resultScene.classList.add("is-card-docked");
  }, 1150);
  resultModelRevealTimer = setTimeout(revealResultModel, 1550);
}

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

function presentResult(result) {
  prepareResultReveal(figures[result]);
  resultScene.classList.add("is-showcase");
  document.querySelector("#resultName").textContent = figures[result].name;
  document.querySelector("#resultStory").textContent = figures[result].story;
  presentResultModel(figures[result]).catch(error => {
    console.error(error);
    resultModelLoading.textContent = "灵影暂未显现";
  });
}

function resetDrawState() {
  clearTimeout(resultRotationTimer);
  clearResultRevealTimers();
  resultModelViewer.removeAttribute("auto-rotate");
  resultScene.classList.remove("is-showcase", "has-result-card", "is-card-intro", "is-card-docked", "is-model-concealed", "is-model-revealed");
  resultCollectCard.hidden = true;
  selected = null;
  drawing = false;
  queuedDraw = false;
  choiceButtons.forEach(item => item.classList.remove("is-selected"));
  prompt.textContent = "九盏灵灯，藏着九段非遗故事";
  drawButton.classList.remove("is-drawing");
  drawButton.querySelector("span").textContent = "抽取盲盒";
}

function runDraw() {
  if (drawing) return;
  if (transitioning) {
    queuedDraw = true;
    return;
  }
  drawing = true;
  drawButton.classList.add("is-drawing");
  drawButton.querySelector("span").textContent = "灵灯寻缘中";
  const result = selected ?? Math.floor(Math.random() * figures.length);
  setTimeout(() => {
    presentResult(result);
    goTo("result");
    drawButton.classList.remove("is-drawing");
    drawButton.querySelector("span").textContent = "抽取盲盒";
    drawing = false;
  }, 820);
}
drawButton.addEventListener("click", runDraw);

function startDirectDraw(forcedIndex = null) {
  if (drawing || transitioning) return;
  if (currentScene === "result") resetDrawState();
  drawing = true;
  selected = Number.isInteger(forcedIndex) ? forcedIndex : Math.floor(Math.random() * figures.length);
  presentResult(selected);
  goTo("result");
  window.setTimeout(() => { drawing = false; }, 900);
}

document.querySelector("#redrawDirect").addEventListener("click", () => startDirectDraw());

const directResult = new URLSearchParams(window.location.search).get("result");
const directResultIndex = { lion: 0, opera: 1, porcelain: 2, shadow: 3, qinghua: 5, nisu: 6, fish: 7, tiger: 4, nuoxi: 8 }[directResult];
if (Number.isInteger(directResultIndex)) {
  presentResult(directResultIndex);
  app.dataset.scene = "result";
  scenes.forEach(scene => scene.classList.toggle("is-active", scene.dataset.scene === "result"));
  currentScene = "result";
  requestAnimationFrame(startResultRevealSequence);
} else {
  const directScene = new URLSearchParams(window.location.search).get("scene");
  if (["home", "hub", "story", "about", "map", "heritage", "cards", "photo"].includes(directScene)) {
    app.dataset.scene = directScene;
    scenes.forEach(scene => scene.classList.toggle("is-active", scene.dataset.scene === directScene));
    currentScene = directScene;
    if (directScene === "hub") loadHubBoxModel().catch(console.error);
    if (directScene === "photo") preparePhotoScene();
  }
}

async function buildTransparentPhotoFrame() {
  if (photoFrameCanvas) return photoFrameCanvas;
  await photoFrameOverlay.decode().catch(() => {});
  const canvas = document.createElement("canvas");
  canvas.width = photoFrameOverlay.naturalWidth || 1177;
  canvas.height = photoFrameOverlay.naturalHeight || 789;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(photoFrameOverlay, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i], g = imageData.data[i + 1], b = imageData.data[i + 2];
    const white = Math.min(r, g, b);
    if (white > 224 && Math.max(r, g, b) - white < 26) imageData.data[i + 3] = Math.max(0, (244 - white) * 12);
  }
  context.putImageData(imageData, 0, 0);
  photoFrameOverlay.src = canvas.toDataURL("image/png");
  photoFrameCanvas = canvas;
  return canvas;
}

async function preparePhotoScene() {
  if (new URLSearchParams(location.search).get("figure") === "tiger") selected = 4;
  const figure = figures[selected ?? 0];
  document.querySelector("#photoFigureName").textContent = figure.name;
  if (!customElements.get("model-viewer")) { modelViewerLoader ??= import("./assets/model-viewer.min.js"); await modelViewerLoader; }
  photoModelViewer.src = figure.model;
  photoModelViewer.cameraOrbit = figure.cameraOrbit || "90deg 82deg 2.25m";
  buildTransparentPhotoFrame().catch(console.error);
  if (new URLSearchParams(location.search).get("mode") === "scene") setPhotoMode("scene");
}

function setPhotoMode(mode) {
  photoMode = mode;
  photoPaper.classList.toggle("is-scene-mode", mode === "scene");
  document.querySelector("#framePhotoMode").classList.toggle("is-active", mode === "frame");
  document.querySelector("#scenePhotoMode").classList.toggle("is-active", mode === "scene");
  if (mode === "scene" && selected !== 4) {
    selected = 4;
    document.querySelector("#photoFigureName").textContent = figures[4].name;
    photoModelViewer.src = figures[4].model;
    photoModelViewer.cameraOrbit = figures[4].cameraOrbit;
  }
  photoPreview.hidden = true;
  retakePhotoButton.hidden = true;
  downloadPhotoButton.hidden = true;
  capturePhotoButton.hidden = false;
  capturePhotoButton.disabled = !photoStream;
  photoStatus.textContent = mode === "scene" ? "布老虎古街场景已就位" : "相纸合影模式已就位";
}

async function startPhotoCamera() {
  try {
    stopPhotoCamera();
    photoStatus.textContent = "正在请求摄像头权限…";
    photoStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"user", width:{ideal:1280}, height:{ideal:720} }, audio:false });
    photoVideo.srcObject = photoStream;
    await photoVideo.play();
    photoCameraEmpty.hidden = true;
    capturePhotoButton.disabled = false;
    photoStatus.textContent = "相机已开启，请站到画面中间";
  } catch (error) {
    photoStatus.textContent = "未能开启相机，请允许浏览器使用摄像头后重试";
    console.error(error);
  }
}

function stopPhotoCamera() {
  photoStream?.getTracks().forEach(track => track.stop());
  photoStream = null;
  if (photoVideo) photoVideo.srcObject = null;
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function capturePhoto() {
  if (!photoStream) return;
  capturePhotoButton.disabled = true;
  for (const count of [3,2,1]) { photoCountdown.textContent = count; await wait(650); }
  photoCountdown.textContent = "";
  photoPaper.classList.remove("is-flashing"); void photoPaper.offsetWidth; photoPaper.classList.add("is-flashing");
  const canvas = document.createElement("canvas"); canvas.width = 1412; canvas.height = 947;
  const context = canvas.getContext("2d");
  if (photoMode === "scene") {
    await photoSceneImage.decode().catch(() => {});
    context.drawImage(photoSceneImage,0,0,canvas.width,canvas.height);
    context.save();
    context.beginPath();
    context.ellipse(canvas.width*.235,canvas.height*.53,canvas.width*.2,canvas.height*.38,0,0,Math.PI*2);
    context.clip();
    context.translate(canvas.width*.44,0);
    context.scale(-1,1);
    context.drawImage(photoVideo,0,canvas.height*.15,canvas.width*.41,canvas.height*.76);
    context.restore();
  } else {
    context.save(); context.translate(canvas.width,0); context.scale(-1,1); context.drawImage(photoVideo,0,0,canvas.width,canvas.height); context.restore();
  }
  try {
    const blob = photoModelViewer.toBlob ? await photoModelViewer.toBlob({ idealAspect:true }) : null;
    if (blob) { const image = new Image(); image.src = URL.createObjectURL(blob); await image.decode(); context.drawImage(image, canvas.width*.55, canvas.height*.08, canvas.width*.43, canvas.height*.86); URL.revokeObjectURL(image.src); }
  } catch (error) { console.warn("模型快照暂不可用", error); }
  if (photoMode === "frame") { const frame = await buildTransparentPhotoFrame(); context.drawImage(frame,0,0,canvas.width,canvas.height); }
  photoPreview.src = canvas.toDataURL("image/png",1);
  photoPreview.hidden = false; retakePhotoButton.hidden = false; downloadPhotoButton.hidden = false;
  capturePhotoButton.hidden = true; photoStatus.textContent = "合影已生成，可下载保存";
}

document.querySelector("#collectButton").addEventListener("click", () => goTo("photo"));
document.querySelector("#photoBack").addEventListener("click", () => goTo("result"));
document.querySelector("#startPhotoCamera").addEventListener("click", startPhotoCamera);
document.querySelector("#framePhotoMode").addEventListener("click", () => setPhotoMode("frame"));
document.querySelector("#scenePhotoMode").addEventListener("click", () => setPhotoMode("scene"));
capturePhotoButton.addEventListener("click", capturePhoto);
retakePhotoButton.addEventListener("click", () => { photoPreview.hidden=true; retakePhotoButton.hidden=true; downloadPhotoButton.hidden=true; capturePhotoButton.hidden=false; capturePhotoButton.disabled=!photoStream; photoStatus.textContent="已准备好，可以重新拍摄"; });
downloadPhotoButton.addEventListener("click", () => { const link=document.createElement("a"); link.href=photoPreview.src; link.download=`MOMO-非遗合影-${figures[selected ?? 0].name}.png`; link.click(); });

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

window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (currentScene === "result") goTo("hub");
    else if (currentScene === "draw") goTo("hub");
    else if (currentScene === "hub") goTo("home");
  }
  if (event.key === "Enter" && currentScene === "home") goTo("hub");
});

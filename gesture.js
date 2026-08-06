const MEDIAPIPE_VERSION = "0.10.32";
const VISION_MODULE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/vision_bundle.mjs`;
const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const DWELL_MS = 1200;
const CLICK_COOLDOWN_MS = 850;
const INDEX_TIP = 8;
const PALM_POINTS = [0, 5, 9, 13, 17];
const PROGRESS_LENGTH = 106.82;

const stage = document.querySelector("#stage");
const toggle = document.querySelector("#gestureToggle");
const toggleLabel = toggle.querySelector(".gesture-toggle-label");
const panel = document.querySelector("#gesturePanel");
const video = document.querySelector("#gestureVideo");
const statusText = document.querySelector("#gestureStatus");
const statusDot = document.querySelector("#gestureStatusDot");
const cursor = document.querySelector("#gestureCursor");
const progressCircle = document.querySelector("#gestureProgress");

let handLandmarker = null;
let mediaStream = null;
let active = false;
let initializing = false;
let lastVideoTime = -1;
let lastInferenceAt = 0;
let lastHandAt = 0;
let trackedTarget = null;
let dwellStartedAt = 0;
let cooldownUntil = 0;
let smoothX = null;
let smoothY = null;
let animationFrame = 0;

function setStatus(message, mode = "") {
  statusText.textContent = message;
  statusDot.classList.toggle("is-ready", mode === "ready");
  statusDot.classList.toggle("is-tracking", mode === "tracking");
}

function resetDwell() {
  trackedTarget?.classList.remove("gesture-hover");
  trackedTarget = null;
  dwellStartedAt = 0;
  progressCircle.style.strokeDashoffset = PROGRESS_LENGTH;
  cursor.classList.remove("is-targeting", "is-complete");
}

function hideGestureCursor() {
  cursor.classList.remove("is-visible");
  resetDwell();
  window.dispatchEvent(new CustomEvent("momo-gesture-pointer", {
    detail: { active: false, clientX: 0, clientY: 0, now: performance.now() }
  }));
  window.dispatchEvent(new CustomEvent("momo-gesture-palm", {
    detail: { active: false, clientX: 0, clientY: 0, now: performance.now() }
  }));
}

function findInteractiveTarget(clientX, clientY) {
  const element = document.elementFromPoint(clientX, clientY);
  const candidate = element?.closest("button:not([disabled]), a[href], [role='button']");
  if (!candidate || !stage.contains(candidate)) return null;
  const style = getComputedStyle(candidate);
  if (style.visibility === "hidden" || style.pointerEvents === "none" || Number(style.opacity) < .08) return null;
  return candidate;
}

function updateDwell(target, now) {
  if (now < cooldownUntil) {
    resetDwell();
    return;
  }

  if (target !== trackedTarget) {
    resetDwell();
    trackedTarget = target;
    dwellStartedAt = target ? now : 0;
    target?.classList.add("gesture-hover");
  }

  if (!target) return;

  cursor.classList.add("is-targeting");
  const progress = Math.min(1, (now - dwellStartedAt) / DWELL_MS);
  progressCircle.style.strokeDashoffset = PROGRESS_LENGTH * (1 - progress);

  if (progress >= 1) {
    cursor.classList.add("is-complete");
    target.classList.remove("gesture-hover");
    trackedTarget = null;
    dwellStartedAt = 0;
    cooldownUntil = now + CLICK_COOLDOWN_MS;
    progressCircle.style.strokeDashoffset = 0;
    setTimeout(() => cursor.classList.remove("is-complete"), 260);
    target.click();
  }
}

function mapIndexFinger(landmark, now) {
  const rect = stage.getBoundingClientRect();
  const rawX = rect.left + (1 - landmark.x) * rect.width;
  const rawY = rect.top + landmark.y * rect.height;

  smoothX = smoothX == null ? rawX : smoothX + (rawX - smoothX) * .38;
  smoothY = smoothY == null ? rawY : smoothY + (rawY - smoothY) * .38;

  const localX = smoothX - rect.left;
  const localY = smoothY - rect.top;
  cursor.style.left = `${localX}px`;
  cursor.style.top = `${localY}px`;
  cursor.classList.add("is-visible");
  lastHandAt = now;

  window.dispatchEvent(new CustomEvent("momo-gesture-pointer", {
    detail: { active: true, clientX: smoothX, clientY: smoothY, localX, localY, now }
  }));
  updateDwell(findInteractiveTarget(smoothX, smoothY), now);
}

function isOpenPalm(hand) {
  const wrist = hand[0];
  const distanceFromWrist = index => Math.hypot(
    hand[index].x - wrist.x,
    hand[index].y - wrist.y
  );
  const extendedFingers = [
    [8, 6],
    [12, 10],
    [16, 14],
    [20, 18]
  ].filter(([tip, joint]) => distanceFromWrist(tip) > distanceFromWrist(joint) * 1.16).length;
  return extendedFingers >= 3;
}

function mapPalm(hand, now) {
  const palm = PALM_POINTS.reduce((point, index) => ({
    x: point.x + hand[index].x / PALM_POINTS.length,
    y: point.y + hand[index].y / PALM_POINTS.length
  }), { x: 0, y: 0 });
  const rect = stage.getBoundingClientRect();
  const rawX = rect.left + (1 - palm.x) * rect.width;
  const rawY = rect.top + palm.y * rect.height;

  smoothX = smoothX == null ? rawX : smoothX + (rawX - smoothX) * .32;
  smoothY = smoothY == null ? rawY : smoothY + (rawY - smoothY) * .32;
  cursor.style.left = `${smoothX - rect.left}px`;
  cursor.style.top = `${smoothY - rect.top}px`;
  cursor.classList.add("is-visible");
  resetDwell();
  lastHandAt = now;

  window.dispatchEvent(new CustomEvent("momo-gesture-palm", {
    detail: { active: true, clientX: smoothX, clientY: smoothY, now }
  }));
}

function processFrame(now) {
  if (!active) return;

  if (
    handLandmarker &&
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
    video.currentTime !== lastVideoTime &&
    now - lastInferenceAt >= 34
  ) {
    lastVideoTime = video.currentTime;
    lastInferenceAt = now;
    const result = handLandmarker.detectForVideo(video, now);
    const hand = result.landmarks?.[0];
    if (hand?.[INDEX_TIP]) {
      const isCardsScene = document.querySelector("#app")?.dataset.scene === "cards";
      if (isCardsScene && isOpenPalm(hand)) {
        setStatus("已识别手掌 · 左右移动浏览", "tracking");
        mapPalm(hand, now);
      } else if (isCardsScene) {
        setStatus("请张开手掌进行浏览", "ready");
        window.dispatchEvent(new CustomEvent("momo-gesture-palm", {
          detail: { active: false, clientX: 0, clientY: 0, now }
        }));
        smoothX = null;
        smoothY = null;
        resetDwell();
      } else {
        setStatus("已识别食指 · 停留以确认", "tracking");
        mapIndexFinger(hand[INDEX_TIP], now);
      }
    } else if (now - lastHandAt > 220) {
      setStatus("请将一只手放入画面", "ready");
      smoothX = null;
      smoothY = null;
      hideGestureCursor();
    }
  }

  animationFrame = requestAnimationFrame(processFrame);
}

async function createHandLandmarker() {
  if (handLandmarker) return handLandmarker;
  setStatus("正在加载手势模型…");
  const { FilesetResolver, HandLandmarker } = await import(VISION_MODULE);
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
  const options = {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: .55,
    minHandPresenceConfidence: .55,
    minTrackingConfidence: .55
  };
  try {
    handLandmarker = await HandLandmarker.createFromOptions(vision, options);
  } catch {
    options.baseOptions.delegate = "CPU";
    handLandmarker = await HandLandmarker.createFromOptions(vision, options);
  }
  return handLandmarker;
}

async function startGestureControl() {
  if (initializing || active) return;
  initializing = true;
  panel.classList.add("is-visible");
  panel.setAttribute("aria-hidden", "false");
  toggleLabel.textContent = "加载手势";
  setStatus("正在准备摄像头…");

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("当前浏览器不支持摄像头访问");
    }
    await createHandLandmarker();
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });
    video.srcObject = mediaStream;
    await video.play();
    active = true;
    toggle.setAttribute("aria-pressed", "true");
    toggleLabel.textContent = "关闭手势";
    setStatus("请将一只手放入画面", "ready");
    lastVideoTime = -1;
    lastHandAt = performance.now();
    animationFrame = requestAnimationFrame(processFrame);
  } catch (error) {
    console.error("Gesture control failed:", error);
    setStatus(error?.name === "NotAllowedError" ? "未获得摄像头权限" : "手势功能加载失败");
    toggleLabel.textContent = "重新开启";
    toggle.setAttribute("aria-pressed", "false");
  } finally {
    initializing = false;
  }
}

function stopGestureControl() {
  active = false;
  cancelAnimationFrame(animationFrame);
  mediaStream?.getTracks().forEach(track => track.stop());
  mediaStream = null;
  video.srcObject = null;
  smoothX = null;
  smoothY = null;
  hideGestureCursor();
  panel.classList.remove("is-visible");
  panel.setAttribute("aria-hidden", "true");
  toggle.setAttribute("aria-pressed", "false");
  toggleLabel.textContent = "开启手势";
  setStatus("等待开启");
}

toggle.addEventListener("click", () => {
  if (active) stopGestureControl();
  else startGestureControl();
});

window.addEventListener("pagehide", stopGestureControl);

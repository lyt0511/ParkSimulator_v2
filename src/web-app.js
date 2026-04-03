import { createPlayPageModel } from "./.demo-gen/play-page.js";
import { SCENE_RENDER_TOKENS } from "./.demo-gen/features/parking-contract/contract-constants.js";

const ROAD_RECTS = {
  "main-road-rect": { x: 80, y: 50, w: 560, h: 320 },
};

const LANE_LINES = {
  "lane-edge-left": { x1: 100, y1: 100, x2: 620, y2: 100, dashed: false },
  "lane-edge-right": { x1: 100, y1: 300, x2: 620, y2: 300, dashed: false },
  "lane-center-dash": { x1: 360, y1: 80, x2: 360, y2: 340, dashed: true },
};

const PARKING_SLOTS = {
  "slot-a-outline": { x: 130, y: 210, w: 120, h: 80 },
  "slot-b-outline": { x: 280, y: 210, w: 120, h: 80 },
  "slot-c-outline": { x: 430, y: 210, w: 120, h: 80 },
};

const GREENBELT_RECTS = {
  "greenbelt-top-strip": { x: 80, y: 18, w: 560, h: 24 },
};

const STATIC_CARS = {
  "ref-car-left": { x: 150, y: 228, w: 80, h: 34 },
  "ref-car-right": { x: 450, y: 228, w: 80, h: 34 },
};

function clamp(value, min, max) {
  if (value > max) return max;
  if (value < min) return min;
  return value;
}

function getLayer(state, layerId) {
  return state.renderedScene?.layers.find((layer) => layer.layerId === layerId) ?? null;
}

function drawRects(ctx, elements, dictionary, mode) {
  for (const id of elements) {
    const rect = dictionary[id];
    if (!rect) continue;
    if (mode === "fill") {
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    } else {
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
  }
}

function drawLaneLines(ctx, elements) {
  for (const id of elements) {
    const line = LANE_LINES[id];
    if (!line) continue;
    ctx.setLineDash(line.dashed ? [8, 6] : []);
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawEgoCar(ctx, ego) {
  ctx.save();
  ctx.translate(ego.x, ego.y);
  ctx.rotate(ego.angle);

  ctx.fillStyle = SCENE_RENDER_TOKENS.egoBody;
  ctx.fillRect(-18, -10, 36, 20);

  ctx.fillStyle = SCENE_RENDER_TOKENS.egoHead;
  ctx.fillRect(4, -8, 12, 16);

  ctx.fillStyle = SCENE_RENDER_TOKENS.egoWheel;
  ctx.fillRect(-16, -12, 7, 4);
  ctx.fillRect(9, -12, 7, 4);
  ctx.fillRect(-16, 8, 7, 4);
  ctx.fillRect(9, 8, 7, 4);

  ctx.restore();
}

function drawScene(ctx, state) {
  ctx.clearRect(0, 0, 720, 420);
  ctx.fillStyle = SCENE_RENDER_TOKENS.background;
  ctx.fillRect(0, 0, 720, 420);

  if (!state.renderReady || !state.renderedScene) {
    ctx.fillStyle = "#2d3748";
    ctx.font = "16px sans-serif";
    ctx.fillText("请选择场景并加载", 280, 210);
    return;
  }

  const roadLayer = getLayer(state, "road");
  const laneLayer = getLayer(state, "laneMarkings");
  const slotLayer = getLayer(state, "parkingSlots");
  const decoLayer = getLayer(state, "decorations");
  const staticLayer = getLayer(state, "staticCars");
  const egoLayer = getLayer(state, "egoCar");

  if (roadLayer?.visible) {
    ctx.fillStyle = SCENE_RENDER_TOKENS.road;
    drawRects(ctx, roadLayer.elements, ROAD_RECTS, "fill");
  }

  if (laneLayer?.visible) {
    ctx.strokeStyle = SCENE_RENDER_TOKENS.laneMarkings;
    ctx.lineWidth = 2;
    drawLaneLines(ctx, laneLayer.elements);
  }

  if (slotLayer?.visible) {
    ctx.strokeStyle = SCENE_RENDER_TOKENS.parkingSlots;
    drawRects(ctx, slotLayer.elements, PARKING_SLOTS, "stroke");
  }

  if (decoLayer?.visible) {
    ctx.fillStyle = SCENE_RENDER_TOKENS.greenbelt;
    drawRects(ctx, decoLayer.elements, GREENBELT_RECTS, "fill");
  }

  if (staticLayer?.visible) {
    ctx.fillStyle = SCENE_RENDER_TOKENS.staticCars;
    drawRects(ctx, staticLayer.elements, STATIC_CARS, "fill");
  }

  if (egoLayer?.visible) {
    drawEgoCar(ctx, state.ego);
  }
}

function formatHud(state) {
  const visibleLayers =
    state.renderedScene?.layers.filter((layer) => layer.visible).map((layer) => layer.layerId).join(" -> ") ||
    "(none)";

  return [
    `phase        : ${state.phase}`,
    `scenario     : ${state.selectedScenario ?? "(none)"}`,
    `renderReady  : ${state.renderReady}`,
    `lastControl  : ${
      state.lastControl ? `${state.lastControl.direction}, throttle=${state.lastControl.throttle}` : "(none)"
    }`,
    `ego(x,y,a)   : ${state.ego.x.toFixed(1)}, ${state.ego.y.toFixed(1)}, ${state.ego.angle.toFixed(2)}`,
    `settleSpeed  : ${state.settleSpeed ?? "(none)"}`,
    `maxSpeed     : ${state.maxAllowedSpeed ?? "(none)"}`,
    `reason       : ${state.resultReason ?? "(none)"}`,
    `layers       : ${visibleLayers}`,
  ].join("\n");
}

function createPlayApp() {
  const page = createPlayPageModel();

  const els = {
    canvas: document.getElementById("sceneCanvas"),
    scenario: document.getElementById("scenario"),
    loadScene: document.getElementById("loadScene"),
    throttleRange: document.getElementById("throttleRange"),
    throttleValue: document.getElementById("throttleValue"),
    finishBtn: document.getElementById("finishBtn"),
    retryBtn: document.getElementById("retryBtn"),
    backBtn: document.getElementById("backBtn"),
    resetCar: document.getElementById("resetCar"),
    hud: document.getElementById("hud"),
    resultText: document.getElementById("resultText"),
  };

  const ctx = els.canvas.getContext("2d");

  function syncThrottle(value) {
    const normalized = clamp(Number(value), -1, 1);
    els.throttleRange.value = String(normalized);
    els.throttleValue.value = String(normalized);
    return normalized;
  }

  function render() {
    const state = page.getViewState();
    drawScene(ctx, state);
    els.hud.textContent = formatHud(state);
    els.resultText.textContent = state.resultText ?? "(未结束)";
  }

  function loadScenario() {
    page.selectScenario(els.scenario.value);
    render();
  }

  function applyKeyboardControl(direction) {
    page.handleKeyboardControl({
      direction,
      throttle: syncThrottle(els.throttleValue.value),
    });
    render();
  }

  function applyButtonControl(direction) {
    page.handleButtonControl({
      direction,
      throttle: syncThrottle(els.throttleValue.value),
    });
    render();
  }

  els.loadScene.addEventListener("click", loadScenario);

  els.resetCar.addEventListener("click", () => {
    page.selectScenario(els.scenario.value);
    render();
  });

  els.retryBtn.addEventListener("click", () => {
    page.clickRetry();
    render();
  });

  els.backBtn.addEventListener("click", () => {
    page.clickBackToScenarioSelect();
    render();
  });

  document.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      applyButtonControl(button.getAttribute("data-direction"));
    });
  });

  els.throttleRange.addEventListener("input", (event) => {
    syncThrottle(event.target.value);
  });

  els.throttleValue.addEventListener("input", (event) => {
    syncThrottle(event.target.value);
  });

  els.finishBtn.addEventListener("click", () => {
    page.clickFinish();
    render();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") applyKeyboardControl("left");
    if (event.key === "ArrowRight") applyKeyboardControl("right");
    if (event.key === "ArrowUp") {
      syncThrottle(clamp(Number(els.throttleValue.value) + 0.1, -1, 1));
      applyKeyboardControl("straight");
    }
    if (event.key === "ArrowDown") {
      syncThrottle(clamp(Number(els.throttleValue.value) - 0.1, -1, 1));
      applyKeyboardControl("straight");
    }
    if (event.code === "Space") {
      event.preventDefault();
      page.clickFinish();
      render();
    }
  });

  render();
}

createPlayApp();

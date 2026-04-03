const SCENARIOS = ["normal-reverse-parking"];
const SCENE_LAYER_ORDER = [
  "background",
  "road",
  "laneMarkings",
  "parkingSlots",
  "decorations",
  "staticCars",
  "egoCar",
  "HUDOverlay",
];

const TOKENS = {
  background: "#edf1f5",
  road: "#1b1b1b",
  laneMarkings: "#ffffff",
  parkingSlots: "#d9d9d9",
  greenbelt: "#2f8f46",
  staticCars: "#8ea0ad",
  egoBody: "#c53030",
  egoHead: "#742a2a",
  egoWheel: "#1a202c",
};

const PLACEHOLDER_RESULT = {
  success: "SUCCESS_PLACEHOLDER",
  failure: "FAILURE_PLACEHOLDER",
};

function clamp(value, min, max) {
  if (value > max) return max;
  if (value < min) return min;
  return value;
}

function isScenarioId(value) {
  return SCENARIOS.includes(value);
}

function isDirectionInput(value) {
  return value === "left" || value === "right" || value === "straight";
}

function normalizeControlInput(input) {
  if (!isDirectionInput(input.direction)) {
    return null;
  }
  return {
    direction: input.direction,
    throttle: clamp(Number(input.throttle), -1, 1),
  };
}

function loadSceneRenderSpec(scenarioId) {
  if (!isScenarioId(scenarioId)) {
    return null;
  }
  return {
    scenarioId,
    geometry: {
      road: [{ x: 80, y: 50, w: 560, h: 320 }],
      laneMarkings: [
        { x1: 100, y1: 100, x2: 620, y2: 100 },
        { x1: 100, y1: 300, x2: 620, y2: 300 },
        { x1: 360, y1: 80, x2: 360, y2: 340, dashed: true },
      ],
      parkingSlots: [
        { x: 130, y: 210, w: 120, h: 80 },
        { x: 280, y: 210, w: 120, h: 80 },
        { x: 430, y: 210, w: 120, h: 80 },
      ],
      greenbelt: [{ x: 80, y: 18, w: 560, h: 24 }],
      staticCars: [
        { x: 150, y: 228, w: 80, h: 34 },
        { x: 450, y: 228, w: 80, h: 34 },
      ],
    },
  };
}

function renderScene(spec) {
  const layers = SCENE_LAYER_ORDER.map((layerId) => {
    switch (layerId) {
      case "background":
        return { layerId, visible: true };
      case "road":
        return { layerId, visible: spec.geometry.road.length > 0 };
      case "laneMarkings":
        return { layerId, visible: spec.geometry.laneMarkings.length > 0 };
      case "parkingSlots":
        return { layerId, visible: spec.geometry.parkingSlots.length > 0 };
      case "decorations":
        return { layerId, visible: spec.geometry.greenbelt.length > 0 };
      case "staticCars":
        return { layerId, visible: spec.geometry.staticCars.length > 0 };
      default:
        return { layerId, visible: false };
    }
  });
  return { scenarioId: spec.scenarioId, layers, geometry: spec.geometry };
}

class SessionController {
  constructor() {
    this.phase = "IDLE";
    this.selectedScenario = null;
    this.renderedScene = null;
    this.renderReady = false;
    this.lastControl = null;
    this.resultText = null;
    this.ego = { x: 360, y: 340, angle: -Math.PI / 2 };
  }

  selectScenario(scenario) {
    if (!isScenarioId(scenario)) return;
    this.selectedScenario = scenario;
    this.phase = "READY";
    this.resultText = null;
    this.lastControl = null;
    this.renderedScene = null;
    this.renderReady = false;
    this.resetEgo();
  }

  setRenderedScene(scene) {
    if (this.selectedScenario !== scene.scenarioId) return;
    this.renderedScene = scene;
    this.renderReady = true;
  }

  resetEgo() {
    this.ego = { x: 360, y: 340, angle: -Math.PI / 2 };
  }

  applyControl(input) {
    if (this.phase !== "READY" && this.phase !== "RUNNING") return;
    const normalized = normalizeControlInput(input);
    if (!normalized) return;

    if (this.phase === "READY") this.phase = "RUNNING";
    this.lastControl = normalized;

    const steer = normalized.direction === "left" ? -0.08 : normalized.direction === "right" ? 0.08 : 0;
    this.ego.angle += steer;
    const speed = normalized.throttle * 6;
    this.ego.x += Math.cos(this.ego.angle) * speed;
    this.ego.y += Math.sin(this.ego.angle) * speed;
    this.ego.x = clamp(this.ego.x, 100, 620);
    this.ego.y = clamp(this.ego.y, 70, 360);
  }

  finishSession(options) {
    if (this.phase !== "READY" && this.phase !== "RUNNING") return;
    this.phase = "SETTLING";
    this.resultText = options?.successHint ? PLACEHOLDER_RESULT.success : PLACEHOLDER_RESULT.failure;
    this.phase = "DONE";
  }

  getViewState() {
    return {
      phase: this.phase,
      selectedScenario: this.selectedScenario,
      renderedScene: this.renderedScene,
      renderReady: this.renderReady,
      lastControl: this.lastControl,
      resultText: this.resultText,
      ego: { ...this.ego },
    };
  }
}

function drawCar(ctx, ego) {
  ctx.save();
  ctx.translate(ego.x, ego.y);
  ctx.rotate(ego.angle);
  ctx.fillStyle = TOKENS.egoBody;
  ctx.fillRect(-18, -10, 36, 20);
  ctx.fillStyle = TOKENS.egoHead;
  ctx.fillRect(4, -8, 12, 16);
  ctx.fillStyle = TOKENS.egoWheel;
  ctx.fillRect(-16, -12, 7, 4);
  ctx.fillRect(9, -12, 7, 4);
  ctx.fillRect(-16, 8, 7, 4);
  ctx.fillRect(9, 8, 7, 4);
  ctx.restore();
}

function drawScene(ctx, state) {
  ctx.clearRect(0, 0, 720, 420);

  ctx.fillStyle = TOKENS.background;
  ctx.fillRect(0, 0, 720, 420);

  if (!state.renderReady || !state.renderedScene) {
    ctx.fillStyle = "#2d3748";
    ctx.font = "16px sans-serif";
    ctx.fillText("请选择场景并加载", 280, 210);
    return;
  }

  const g = state.renderedScene.geometry;

  ctx.fillStyle = TOKENS.road;
  for (const item of g.road) ctx.fillRect(item.x, item.y, item.w, item.h);

  ctx.strokeStyle = TOKENS.laneMarkings;
  ctx.lineWidth = 2;
  for (const item of g.laneMarkings) {
    ctx.setLineDash(item.dashed ? [8, 6] : []);
    ctx.beginPath();
    ctx.moveTo(item.x1, item.y1);
    ctx.lineTo(item.x2, item.y2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.strokeStyle = TOKENS.parkingSlots;
  for (const item of g.parkingSlots) ctx.strokeRect(item.x, item.y, item.w, item.h);

  ctx.fillStyle = TOKENS.greenbelt;
  for (const item of g.greenbelt) ctx.fillRect(item.x, item.y, item.w, item.h);

  ctx.fillStyle = TOKENS.staticCars;
  for (const item of g.staticCars) ctx.fillRect(item.x, item.y, item.w, item.h);

  drawCar(ctx, state.ego);
}

function formatHud(state) {
  const visibleLayers =
    state.renderedScene?.layers.filter((l) => l.visible).map((l) => l.layerId).join(" -> ") || "(none)";
  return [
    `phase        : ${state.phase}`,
    `scenario     : ${state.selectedScenario ?? "(none)"}`,
    `renderReady  : ${state.renderReady}`,
    `lastControl  : ${
      state.lastControl ? `${state.lastControl.direction}, throttle=${state.lastControl.throttle}` : "(none)"
    }`,
    `ego(x,y,a)   : ${state.ego.x.toFixed(1)}, ${state.ego.y.toFixed(1)}, ${state.ego.angle.toFixed(2)}`,
    `layers       : ${visibleLayers}`,
  ].join("\n");
}

function createPlayApp() {
  const controller = new SessionController();

  const els = {
    canvas: document.getElementById("sceneCanvas"),
    scenario: document.getElementById("scenario"),
    loadScene: document.getElementById("loadScene"),
    throttleRange: document.getElementById("throttleRange"),
    throttleValue: document.getElementById("throttleValue"),
    successHint: document.getElementById("successHint"),
    finishBtn: document.getElementById("finishBtn"),
    resetCar: document.getElementById("resetCar"),
    hud: document.getElementById("hud"),
    resultText: document.getElementById("resultText"),
  };

  const ctx = els.canvas.getContext("2d");

  function syncThrottle(value) {
    const v = clamp(Number(value), -1, 1);
    els.throttleRange.value = String(v);
    els.throttleValue.value = String(v);
    return v;
  }

  function render() {
    const state = controller.getViewState();
    drawScene(ctx, state);
    els.hud.textContent = formatHud(state);
    els.resultText.textContent = state.resultText ?? "(未结束)";
  }

  function loadScenario() {
    const scenario = els.scenario.value;
    controller.selectScenario(scenario);
    const spec = loadSceneRenderSpec(scenario);
    if (spec) {
      controller.setRenderedScene(renderScene(spec));
    }
    render();
  }

  function applyControl(direction) {
    controller.applyControl({
      direction,
      throttle: syncThrottle(els.throttleValue.value),
    });
    render();
  }

  els.loadScene.addEventListener("click", loadScenario);
  els.resetCar.addEventListener("click", () => {
    controller.resetEgo();
    render();
  });

  document.querySelectorAll("[data-direction]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyControl(btn.getAttribute("data-direction"));
    });
  });

  els.throttleRange.addEventListener("input", (e) => {
    syncThrottle(e.target.value);
  });
  els.throttleValue.addEventListener("input", (e) => {
    syncThrottle(e.target.value);
  });

  els.finishBtn.addEventListener("click", () => {
    controller.finishSession({ successHint: els.successHint.checked });
    render();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") applyControl("left");
    if (e.key === "ArrowRight") applyControl("right");
    if (e.key === "ArrowUp") {
      syncThrottle(clamp(Number(els.throttleValue.value) + 0.1, -1, 1));
      applyControl("straight");
    }
    if (e.key === "ArrowDown") {
      syncThrottle(clamp(Number(els.throttleValue.value) - 0.1, -1, 1));
      applyControl("straight");
    }
    if (e.code === "Space") {
      e.preventDefault();
      controller.finishSession({ successHint: els.successHint.checked });
      render();
    }
  });

  render();
}

createPlayApp();

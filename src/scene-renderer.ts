import {
  DEFAULT_EGO_POSE,
  SCENE_LAYER_ORDER,
  SCENE_RENDER_TOKENS,
  type EgoPose,
  type SceneLayerId,
  type SceneRenderSpec,
  type ScenarioId,
} from "./features/parking-contract/contract-constants.ts";

export interface SceneLayerRenderOutput {
  layerId: SceneLayerId;
  color: string | null;
  elements: string[];
  visible: boolean;
}

export interface RenderedScene {
  scenarioId: ScenarioId;
  layers: SceneLayerRenderOutput[];
}

export interface RenderSceneOptions {
  egoPose?: EgoPose;
  showEgoCar?: boolean;
}

function toFixed(value: number): string {
  return value.toFixed(2);
}

function buildEgoElements(egoPose: EgoPose): string[] {
  const pose = `${toFixed(egoPose.x)},${toFixed(egoPose.y)},${toFixed(egoPose.angle)}`;
  return [
    `ego-body@${pose}`,
    `ego-head@${pose}`,
    `ego-wheel-front-left@${pose}`,
    `ego-wheel-front-right@${pose}`,
    `ego-wheel-rear-left@${pose}`,
    `ego-wheel-rear-right@${pose}`,
  ];
}

function buildLayer(
  spec: SceneRenderSpec,
  layerId: SceneLayerId,
  options: RenderSceneOptions,
): SceneLayerRenderOutput {
  switch (layerId) {
    case "background":
      return {
        layerId,
        color: SCENE_RENDER_TOKENS.background,
        elements: ["canvas-background"],
        visible: true,
      };
    case "road":
      return {
        layerId,
        color: SCENE_RENDER_TOKENS.road,
        elements: [...spec.geometry.road],
        visible: spec.geometry.road.length > 0,
      };
    case "laneMarkings":
      return {
        layerId,
        color: SCENE_RENDER_TOKENS.laneMarkings,
        elements: [...spec.geometry.laneMarkings],
        visible: spec.geometry.laneMarkings.length > 0,
      };
    case "parkingSlots":
      return {
        layerId,
        color: SCENE_RENDER_TOKENS.parkingSlots,
        elements: [...spec.geometry.parkingSlots],
        visible: spec.geometry.parkingSlots.length > 0,
      };
    case "decorations":
      return {
        layerId,
        color: SCENE_RENDER_TOKENS.greenbelt,
        elements: [...spec.geometry.greenbelt],
        visible: spec.geometry.greenbelt.length > 0,
      };
    case "staticCars":
      return {
        layerId,
        color: SCENE_RENDER_TOKENS.staticCars,
        elements: [...spec.geometry.staticCars],
        visible: spec.geometry.staticCars.length > 0,
      };
    case "egoCar": {
      const egoPose = options.egoPose ?? DEFAULT_EGO_POSE;
      const egoElements = buildEgoElements(egoPose);
      return {
        layerId,
        color: SCENE_RENDER_TOKENS.egoBody,
        elements: options.showEgoCar ? egoElements : [],
        visible: options.showEgoCar === true,
      };
    }
    case "HUDOverlay":
      return {
        layerId,
        color: null,
        elements: [],
        visible: false,
      };
  }
}

export function renderScene(spec: SceneRenderSpec, options: RenderSceneOptions = {}): RenderedScene {
  return {
    scenarioId: spec.scenarioId,
    layers: SCENE_LAYER_ORDER.map((layerId) => buildLayer(spec, layerId, options)),
  };
}

export function visibleLayerIds(renderedScene: RenderedScene): SceneLayerId[] {
  return renderedScene.layers
    .filter((layer) => layer.visible)
    .map((layer) => layer.layerId);
}

import {
  isScenarioId,
  type SceneRenderSpec,
  type ScenarioId,
} from "./features/parking-contract/contract-constants.ts";

const SCENE_SPECS: Record<ScenarioId, SceneRenderSpec> = {
  "normal-reverse-parking": {
    scenarioId: "normal-reverse-parking",
    geometry: {
      road: ["main-road-rect"],
      laneMarkings: ["lane-center-dash", "lane-edge-left", "lane-edge-right"],
      parkingSlots: ["slot-a-outline", "slot-b-outline", "slot-c-outline"],
      greenbelt: ["greenbelt-top-strip"],
      staticCars: ["ref-car-left", "ref-car-right"],
    },
  },
};

function cloneSceneRenderSpec(spec: SceneRenderSpec): SceneRenderSpec {
  return {
    scenarioId: spec.scenarioId,
    geometry: {
      road: [...spec.geometry.road],
      laneMarkings: [...spec.geometry.laneMarkings],
      parkingSlots: [...spec.geometry.parkingSlots],
      greenbelt: [...spec.geometry.greenbelt],
      staticCars: [...spec.geometry.staticCars],
    },
  };
}

export function loadSceneRenderSpec(scenarioId: string): SceneRenderSpec | null {
  if (!isScenarioId(scenarioId)) {
    return null;
  }

  return cloneSceneRenderSpec(SCENE_SPECS[scenarioId]);
}

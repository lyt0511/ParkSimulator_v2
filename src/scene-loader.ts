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
  "normal-parallel-parking": {
    scenarioId: "normal-parallel-parking",
    geometry: {
      road: ["parallel-main-road", "parallel-side-lane"],
      laneMarkings: ["parallel-lane-edge-top", "parallel-lane-edge-bottom", "parallel-lane-mid-dash"],
      parkingSlots: ["parallel-slot-a", "parallel-slot-b", "parallel-slot-c"],
      greenbelt: ["parallel-greenbelt-left"],
      staticCars: ["parallel-ref-car-top", "parallel-ref-car-bottom"],
    },
  },
  "narrow-reverse-parking": {
    scenarioId: "narrow-reverse-parking",
    geometry: {
      road: ["narrow-reverse-road"],
      laneMarkings: ["narrow-lane-left", "narrow-lane-right", "narrow-lane-center-dash"],
      parkingSlots: ["narrow-reverse-slot-a", "narrow-reverse-slot-b"],
      greenbelt: ["narrow-greenbelt-top", "narrow-greenbelt-bottom"],
      staticCars: ["narrow-reverse-ref-left", "narrow-reverse-ref-right"],
    },
  },
  "narrow-parallel-parking": {
    scenarioId: "narrow-parallel-parking",
    geometry: {
      road: ["narrow-parallel-road", "narrow-parallel-bay"],
      laneMarkings: [
        "narrow-parallel-edge-top",
        "narrow-parallel-edge-bottom",
        "narrow-parallel-mid-dash",
      ],
      parkingSlots: ["narrow-parallel-slot-a", "narrow-parallel-slot-b"],
      greenbelt: ["narrow-parallel-greenbelt-right"],
      staticCars: ["narrow-parallel-ref-top", "narrow-parallel-ref-bottom"],
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

import { createPlayPageModel } from "./play-page.ts";

const page = createPlayPageModel();

console.log("[demo] initial", page.getViewState());

page.selectScenario("normal-reverse-parking");
console.log("[demo] after select", page.getViewState());

page.handleKeyboardControl({ direction: "left", throttle: 0.5 });
console.log("[demo] after control", page.getViewState());

page.clickFinish({ successHint: true });
console.log("[demo] after finish", page.getViewState());

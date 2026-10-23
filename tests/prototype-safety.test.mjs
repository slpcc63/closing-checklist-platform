import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile(new URL("../app/closing-app.tsx", import.meta.url), "utf8");
const readmeSource = await readFile(new URL("../README.md", import.meta.url), "utf8");

test("the employee workflow is visibly labeled as a non-persistent prototype", () => {
  assert.match(appSource, /Interactive prototype/);
  assert.match(appSource, /Sample data resets when this page reloads/);
  assert.match(appSource, /Nothing here changes a Square account or timecard/);
  assert.match(readmeSource, /It resets on refresh and does not write to Square/);
});

test("clock-out success is described as a simulation", () => {
  assert.match(appSource, /Ready to simulate clock-out/);
  assert.match(appSource, /Simulate a Square clock-out\?/);
  assert.match(appSource, /Simulate clock-out/);
  assert.match(appSource, /Simulation complete/);
  assert.match(appSource, /No Square data changed/);
  assert.doesNotMatch(appSource, /Square confirmed your timecard closed/);
});

test("manager-only prototype controls do not imply live exports or activity", () => {
  assert.match(appSource, /Export unavailable in prototype<\/button>/);
  assert.match(appSource, /Sample audit trail/);
  assert.match(appSource, /Sample activity<\/button>/);
  assert.match(appSource, /Sample exception<\/button>/);
  assert.match(appSource, /Sample Square timecard matched/);
});

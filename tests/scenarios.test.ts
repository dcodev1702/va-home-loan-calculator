import { afterEach, describe, expect, it } from "vitest";
import { createScenario, deleteScenario, renameScenario } from "../src/lib/scenarios";

const createdIds: number[] = [];
afterEach(() => { createdIds.splice(0).forEach((id) => deleteScenario(id)); });

describe("saved scenarios", () => {
  it("renames a saved scenario", () => {
    const scenario = createScenario("Before", { test: true });
    createdIds.push(scenario.id);
    expect(renameScenario(scenario.id, "After")?.name).toBe("After");
  });

  it("deletes a saved scenario", () => {
    const scenario = createScenario("Disposable", { test: true });
    expect(deleteScenario(scenario.id)).toBe(true);
    expect(deleteScenario(scenario.id)).toBe(false);
  });
});

import { Platform } from "react-native";

import { webOnlyDependencies } from "./web-only-dependencies";

describe("webOnlyDependencies", () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
  });

  it("should omit dependencies on native platforms", () => {
    for (const os of ["ios", "android"] as const) {
      Platform.OS = os;
      expect(webOnlyDependencies([1, "two"])).toBeUndefined();
    }
  });

  it("should pass dependencies through on web", () => {
    Platform.OS = "web";
    const dependencies = [1, "two"];
    expect(webOnlyDependencies(dependencies)).toBe(dependencies);
  });
});

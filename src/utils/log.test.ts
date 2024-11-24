import { log, round } from "./log";

describe("log utilities", () => {
  describe("log", () => {
    const mockConsoleLog = jest.fn();
    const originalConsoleLog = console.log;

    beforeEach(() => {
      console.log = mockConsoleLog;
    });

    afterEach(() => {
      mockConsoleLog.mockClear();
      console.log = originalConsoleLog;
    });

    it("should call console.log with provided arguments", () => {
      const args = ["test", 123, { key: "value" }];
      log(...args);

      expect(mockConsoleLog).toHaveBeenCalledWith(...args);
    });

    it("should handle single argument", () => {
      log("test");
      expect(mockConsoleLog).toHaveBeenCalledWith("test");
    });

    it("should handle multiple arguments", () => {
      log("test", 123, true);
      expect(mockConsoleLog).toHaveBeenCalledWith("test", 123, true);
    });
  });

  describe("round", () => {
    it("should round positive numbers correctly", () => {
      expect(round(1.4)).toBe(1);
      expect(round(1.5)).toBe(2);
      expect(round(1.6)).toBe(2);
    });

    it("should round negative numbers correctly", () => {
      expect(round(-1.4)).toBe(-1);
      expect(round(-1.5)).toBe(-1);
      expect(round(-1.6)).toBe(-2);
    });

    it("should handle zero values", () => {
      expect(round(0)).toBe(0);
      expect(round(-0)).toBe(-0);
      expect(1 / round(-0)).toBe(Number.NEGATIVE_INFINITY);
    });

    it("should handle integers", () => {
      expect(round(5)).toBe(5);
      expect(round(-5)).toBe(-5);
    });

    it("should handle decimal places", () => {
      expect(round(Math.PI)).toBe(3);
      expect(round(-Math.PI)).toBe(-3);
    });
  });
});

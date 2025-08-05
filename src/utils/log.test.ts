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

    it("should handle no arguments", () => {
      log();
      expect(mockConsoleLog).toHaveBeenCalledWith();
    });

    it("should handle null and undefined", () => {
      log(null, undefined);
      expect(mockConsoleLog).toHaveBeenCalledWith(null, undefined);
    });

    it("should handle complex objects", () => {
      const complexObj = {
        nested: { array: [1, 2, 3] },
        func: () => "test",
        date: new Date("2023-01-01"),
      };
      log(complexObj);
      expect(mockConsoleLog).toHaveBeenCalledWith(complexObj);
    });

    it("should handle arrays", () => {
      const arr = [1, "two", { three: 3 }];
      log(arr);
      expect(mockConsoleLog).toHaveBeenCalledWith(arr);
    });

    it("should handle mixed types", () => {
      log("string", 42, true, null, undefined, { key: "value" }, [1, 2, 3]);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        "string",
        42,
        true,
        null,
        undefined,
        { key: "value" },
        [1, 2, 3]
      );
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

    it("should handle edge cases", () => {
      expect(round(0.5)).toBe(1);
      expect(round(-0.5)).toBe(-0);
      expect(round(1.999999)).toBe(2);
      expect(round(-1.999999)).toBe(-2);
    });

    it("should handle very large numbers", () => {
      expect(round(1e10 + 0.4)).toBe(1e10);
      expect(round(1e10 + 0.6)).toBe(1e10 + 1);
    });

    it("should handle very small numbers", () => {
      expect(round(0.00001)).toBe(0);
      expect(round(-0.00001)).toBe(-0);
    });

    it("should handle Infinity", () => {
      expect(round(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
      expect(round(Number.NEGATIVE_INFINITY)).toBe(Number.NEGATIVE_INFINITY);
    });

    it("should handle NaN", () => {
      expect(round(Number.NaN)).toBe(Number.NaN);
    });

    it("should handle floating point precision issues", () => {
      expect(round(0.1 + 0.2)).toBe(0); // 0.1 + 0.2 = 0.30000000000000004
      expect(round(1.1 + 1.2)).toBe(2); // Should round to 2
    });
  });
});

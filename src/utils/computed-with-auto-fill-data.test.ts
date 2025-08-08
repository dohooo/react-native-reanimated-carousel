import {
  computedFillDataWithAutoFillData,
  computedOffsetXValueWithAutoFillData,
  computedRealIndexWithAutoFillData,
  convertToSharedIndex,
} from "./computed-with-auto-fill-data";

import { DATA_LENGTH } from "../constants";

const { SINGLE_ITEM, DOUBLE_ITEM } = DATA_LENGTH;

describe("computed-with-auto-fill-data utilities", () => {
  describe("computedFillDataWithAutoFillData", () => {
    it("should handle single item", () => {
      const data = [1];
      const result = computedFillDataWithAutoFillData({
        data,
        loop: true,
        autoFillData: true,
        dataLength: SINGLE_ITEM,
      });

      expect(result).toEqual([1, 1, 1]);
    });

    it("should handle double items", () => {
      const data = [1, 2];
      const result = computedFillDataWithAutoFillData({
        data,
        loop: true,
        autoFillData: true,
        dataLength: DOUBLE_ITEM,
      });

      expect(result).toEqual([1, 2, 1, 2]);
    });

    it("should return original data when autoFillData is false", () => {
      const data = [1, 2, 3];
      const result = computedFillDataWithAutoFillData({
        data,
        loop: true,
        autoFillData: false,
        dataLength: 3,
      });

      expect(result).toEqual(data);
    });

    it("should return original data when loop is false", () => {
      const data = [1, 2, 3];
      const result = computedFillDataWithAutoFillData({
        data,
        loop: false,
        autoFillData: true,
        dataLength: 3,
      });

      expect(result).toEqual(data);
    });

    it("should handle empty data array", () => {
      const data: any[] = [];
      const result = computedFillDataWithAutoFillData({
        data,
        loop: true,
        autoFillData: true,
        dataLength: 0,
      });

      expect(result).toEqual([]);
    });

    it("should handle data length greater than 2", () => {
      const data = [1, 2, 3, 4, 5];
      const result = computedFillDataWithAutoFillData({
        data,
        loop: true,
        autoFillData: true,
        dataLength: 5,
      });

      expect(result).toEqual(data);
    });

    it("should handle both loop and autoFillData false", () => {
      const data = [1];
      const result = computedFillDataWithAutoFillData({
        data,
        loop: false,
        autoFillData: false,
        dataLength: SINGLE_ITEM,
      });

      expect(result).toEqual(data);
    });
  });

  describe("computedOffsetXValueWithAutoFillData", () => {
    const size = 300;

    it("should handle single item", () => {
      const result = computedOffsetXValueWithAutoFillData({
        value: size * 2,
        size,
        rawDataLength: SINGLE_ITEM,
        loop: true,
        autoFillData: true,
      });

      expect(result).toBe(0); // value % size
    });

    it("should handle double items", () => {
      const result = computedOffsetXValueWithAutoFillData({
        value: size * 3,
        size,
        rawDataLength: DOUBLE_ITEM,
        loop: true,
        autoFillData: true,
      });

      expect(result).toBe(size * 1); // value % (size * 2)
    });

    it("should return original value when autoFillData is false", () => {
      const value = size * 2;
      const result = computedOffsetXValueWithAutoFillData({
        value,
        size,
        rawDataLength: 3,
        loop: true,
        autoFillData: false,
      });

      expect(result).toBe(value);
    });

    it("should return original value when loop is false", () => {
      const value = size * 2;
      const result = computedOffsetXValueWithAutoFillData({
        value,
        size,
        rawDataLength: 3,
        loop: false,
        autoFillData: true,
      });

      expect(result).toBe(value);
    });

    it("should handle zero value", () => {
      const result = computedOffsetXValueWithAutoFillData({
        value: 0,
        size,
        rawDataLength: SINGLE_ITEM,
        loop: true,
        autoFillData: true,
      });

      expect(result).toBe(0);
    });

    it("should handle negative values", () => {
      const result = computedOffsetXValueWithAutoFillData({
        value: -size,
        size,
        rawDataLength: SINGLE_ITEM,
        loop: true,
        autoFillData: true,
      });

      // JavaScript's modulo can return -0 for negative numbers
      expect(result).toBe(-0); // -size % size = -0
    });

    it("should handle fractional values", () => {
      const result = computedOffsetXValueWithAutoFillData({
        value: size * 1.5,
        size,
        rawDataLength: DOUBLE_ITEM,
        loop: true,
        autoFillData: true,
      });

      expect(result).toBe(size * 1.5); // This should work with modulo
    });

    it("should handle both conditions false", () => {
      const value = size * 3;
      const result = computedOffsetXValueWithAutoFillData({
        value,
        size,
        rawDataLength: 3,
        loop: false,
        autoFillData: false,
      });

      expect(result).toBe(value);
    });
  });

  describe("computedRealIndexWithAutoFillData", () => {
    it("should handle single item", () => {
      const result = computedRealIndexWithAutoFillData({
        index: 2,
        dataLength: SINGLE_ITEM,
        loop: true,
        autoFillData: true,
      });

      expect(result).toBe(0); // index % 1
    });

    it("should handle double items", () => {
      const result = computedRealIndexWithAutoFillData({
        index: 3,
        dataLength: DOUBLE_ITEM,
        loop: true,
        autoFillData: true,
      });

      expect(result).toBe(1); // index % 2
    });

    it("should return original index when autoFillData is false", () => {
      const index = 2;
      const result = computedRealIndexWithAutoFillData({
        index,
        dataLength: 3,
        loop: true,
        autoFillData: false,
      });

      expect(result).toBe(index);
    });

    it("should return original index when loop is false", () => {
      const index = 2;
      const result = computedRealIndexWithAutoFillData({
        index,
        dataLength: 3,
        loop: false,
        autoFillData: true,
      });

      expect(result).toBe(index);
    });
  });

  describe("convertToSharedIndex", () => {
    it("should handle single item", () => {
      const result = convertToSharedIndex({
        index: 2,
        rawDataLength: SINGLE_ITEM,
        loop: true,
        autoFillData: true,
      });

      expect(result).toBe(0);
    });

    it("should handle double items", () => {
      const result = convertToSharedIndex({
        index: 3,
        rawDataLength: DOUBLE_ITEM,
        loop: true,
        autoFillData: true,
      });

      expect(result).toBe(1); // index % 2
    });

    it("should return original index when autoFillData is false", () => {
      const index = 2;
      const result = convertToSharedIndex({
        index,
        rawDataLength: 3,
        loop: true,
        autoFillData: false,
      });

      expect(result).toBe(index);
    });

    it("should return original index when loop is false", () => {
      const index = 2;
      const result = convertToSharedIndex({
        index,
        rawDataLength: 3,
        loop: false,
        autoFillData: true,
      });

      expect(result).toBe(index);
    });
  });
});

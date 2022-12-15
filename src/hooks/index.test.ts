import { describe, expect, it } from "vitest";

import { computeNewIndexWhenDataChanges } from "./computeNewIndexWhenDataChanges";

describe("should work as expected", () => {
  const size = 375;
  const positive = -1;
  const negative = 1;

  const params = (params: {
    direction: "positive" | "negative"
    currentIndex: number
    previousLength: number
    currentLength: number
  }) => {
    const { currentIndex, direction: _direction, previousLength, currentLength } = params;
    const direction = _direction === "negative" ? negative : positive;
    return {
      direction,
      handlerOffset: size * currentIndex * direction,
      size,
      previousLength,
      currentLength,
    };
  };

  it("The direction is negative, And changing length of data set from 4 to 3, the new index will to be 2.", async () => {
    const currentIndex = 1;
    const handlerOffset = computeNewIndexWhenDataChanges(params({
      currentIndex,
      direction: "negative",
      previousLength: 4,
      currentLength: 3,
    }));

    expect(handlerOffset / size).toBe(2 * positive);
  });

  it("The direction is negative, Changing length of data set from 4 to 3, the index remains original.", async () => {
    const handlerOffset = computeNewIndexWhenDataChanges(params({
      currentIndex: 2,
      direction: "negative",
      previousLength: 4,
      currentLength: 3,
    }));

    expect(handlerOffset / size).toBe(1 * negative);
  });

  it("The direction is positive, Changing length of data set from 4 to 5, the index remains original.", async () => {
    const handlerOffset = computeNewIndexWhenDataChanges(params({
      currentIndex: 3,
      direction: "positive",
      previousLength: 4,
      currentLength: 5,
    }));

    expect(handlerOffset / size).toBe(3 * positive);
  });

  it("The direction is negative, Changing length of data set from 4 to 5, the index remains original.", async () => {
    const handlerOffset = computeNewIndexWhenDataChanges(params({
      currentIndex: 3,
      direction: "negative",
      previousLength: 4,
      currentLength: 5,
    }));

    expect(handlerOffset / size).toBe(4 * negative);
  });

  it("Changing length of data set from 0 to 3, the index remains original.", async () => {
    const handlerOffset = computeNewIndexWhenDataChanges(params({
      currentIndex: 0,
      direction: "positive",
      previousLength: 0,
      currentLength: 3,
    }));

    expect(handlerOffset / size).toBe(0 * positive);
  });
});

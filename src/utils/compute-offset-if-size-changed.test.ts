import { computeOffsetIfSizeChanged } from "./compute-offset-if-size-changed";

describe("computeOffsetIfSizeChanged", () => {
  it("[CASE 1] should return the correct values when size does not change", () => {
    const prevIndex = 1;
    const prevSize = 500;
    const size = 500;
    const handlerOffset = prevIndex * size;
    const result = computeOffsetIfSizeChanged({
      prevSize,
      size,
      handlerOffset,
    });

    const finallyIndex = result / size;
    expect(finallyIndex).toEqual(prevIndex);
  });

  it("[CASE 2] should return the correct values when size changes from 500 to 400", () => {
    const prevIndex = 1;
    const prevSize = 500;
    const size = 400;
    const handlerOffset = prevIndex * prevSize;
    const result = computeOffsetIfSizeChanged({
      prevSize,
      size,
      handlerOffset,
    });

    const finallyIndex = result / size;
    expect(finallyIndex).toEqual(prevIndex);
  });

  it("[CASE 3] should return the correct values when size changes from 500 to 499", () => {
    const prevIndex = 1;
    const prevSize = 500;
    const size = 499;
    const handlerOffset = prevIndex * prevSize;
    const result = computeOffsetIfSizeChanged({
      prevSize,
      size,
      handlerOffset,
    });

    const finallyIndex = result / size;
    expect(finallyIndex).toEqual(prevIndex);
  });

  it("[CASE 4] should return the correct values when size changes from 500 to 501", () => {
    const prevIndex = 1;
    const prevSize = 500;
    const size = 501;
    const handlerOffset = prevIndex * prevSize;
    const result = computeOffsetIfSizeChanged({
      prevSize,
      size,
      handlerOffset,
    });

    const finallyIndex = result / size;
    expect(finallyIndex).toEqual(prevIndex);
  });

  it("[CASE 5] should return the correct values when size changes from 224 to 524", () => {
    const prevIndex = 1;
    const prevSize = 224;
    const size = 524;
    const handlerOffset = prevIndex * prevSize;
    const result = computeOffsetIfSizeChanged({
      prevSize,
      size,
      handlerOffset,
    });

    const finallyIndex = result / size;
    expect(finallyIndex).toEqual(prevIndex);
  });
});

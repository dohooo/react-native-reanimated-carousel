import { computeOffsetIfDataChanged } from "./compute-offset-if-data-changed";

describe("computeOffsetIfDataChanged", () => {
  const size = 634;
  it("should return the correct values, if index is 0", () => {
    const index = 0;
    const result = computeOffsetIfDataChanged({
      direction: -1,
      previousLength: 4,
      currentLength: 6,
      size,
      handlerOffset: index * size,
    });

    expect(result).toMatchInlineSnapshot("0");
  });

  it("should return the correct values, if index is 1", () => {
    const index = 1;
    const result = computeOffsetIfDataChanged({
      direction: -1,
      previousLength: 4,
      currentLength: 6,
      size,
      handlerOffset: index * size,
    });

    expect(result).toMatchInlineSnapshot("634");
  });
});

import React from "react";

import { act, render, screen, waitFor } from "@testing-library/react-native";
import { withReanimatedTimer, advanceAnimationByTime } from "react-native-reanimated/src/reanimated2/jestUtils";

// @ts-expect-error, eslint-disable-next-line import/no-webpack-loader-syntax, @typescript-eslint/ban-ts-comment
// eslint-disable-next-line import/no-webpack-loader-syntax
import * as Carousels from "./pages/!(snap-carousel-*)/index.js";

jest.mock("@faker-js/faker", () => ({
  faker: {
    name: {
      findName: jest.fn(() => "__"),
    },
    image: {
      nature: jest.fn(() => "http://loremflickr.com/405/100/nature?random=0.5328608422981651"),
      animals: jest.fn(() => "http://loremflickr.com/405/100/nature?random=0.5328608422981651"),
    },
    animal: {
      dog: jest.fn(() => "__"),
    },
  },
}));

describe("Test all cases.", () => {
  const originalMathRandom = Math.random;

  beforeEach(() => {
    Math.random = jest.fn(() => 0.5);
  });

  afterEach(() => {
    Math.random = originalMathRandom;
  });

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    jest.useFakeTimers("modern");
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it.each(Object.keys(Carousels))("renders %s correctly", async (exampleKey) => {
    let renderResult: ReturnType<typeof render>;
    withReanimatedTimer(() => {
      const Carousel = Carousels[exampleKey];
      renderResult = render(<Carousel />);
    });
    expect(renderResult!).toBeDefined();
    const { toJSON } = renderResult!;
    withReanimatedTimer(() => {
      act(() => advanceAnimationByTime(250));
    });
    await waitFor(() => screen.findAllByTestId("__CAROUSEL_ITEM_0_READY__"));
    expect(toJSON()).toMatchSnapshot();
  }, 0);
});

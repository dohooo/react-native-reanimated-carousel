import * as React from "react";
import Carousel from "../../../src";

const carouselElement = (
  <Carousel width={300} height={200} data={[1, 2, 3]} renderItem={() => <></>} />
);

type IsExact<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? (<T>() => T extends B ? 1 : 2) extends <T>() => T extends A ? 1 : 2
    ? true
    : false
  : false;

type Assert<T extends true> = T;
type CarouselReturn = ReturnType<typeof Carousel<number>>;
const assertCarouselReturnType: Assert<IsExact<CarouselReturn, React.ReactNode>> = true;

void carouselElement;
void assertCarouselReturnType;

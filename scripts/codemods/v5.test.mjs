import assert from "node:assert/strict";
import test from "node:test";

import { transformSource } from "./v5.mjs";

test("migrates default imports, direct prop renames, orientation, item size, and loop", () => {
  const source = `
import RNCarousel, { Pagination, TCarouselProps } from "react-native-reanimated-carousel";

export function Example(props: TCarouselProps<string>) {
  return (
    <RNCarousel
      data={["a"]}
      renderItem={() => null}
      autoPlay
      autoPlayInterval={1200}
      autoPlayReverse={props.reverse}
      customAnimation={() => ({})}
      vertical
      itemHeight={240}
      windowSize={3}
      enabled={false}
      pagingEnabled={false}
    />
  );
}
`;
  const result = transformSource(source, "fixture.tsx");

  assert.match(
    result.code,
    /import\s*\{\s*Carousel as RNCarousel,\s*Pagination,\s*CarouselProps as TCarouselProps\s*\}/
  );
  assert.match(result.code, /autoplay\b/);
  assert.match(result.code, /autoplayInterval=\{1200\}/);
  assert.match(result.code, /autoplayDirection=\{props\.reverse \? "backward" : "forward"\}/);
  assert.match(result.code, /itemAnimation=/);
  assert.match(result.code, /orientation="vertical"/);
  assert.match(result.code, /itemSize=\{240\}/);
  assert.match(result.code, /renderWindowSize=\{3\}/);
  assert.match(result.code, /scrollEnabled=\{false\}/);
  assert.match(result.code, /snapMode="nearest"/);
  assert.match(result.code, /loop=\{true\}/);
});

test("keeps explicit loop and leaves unrelated JSX untouched", () => {
  const source = `
import { Carousel } from "react-native-reanimated-carousel";
const Other = () => <Widget autoPlay vertical />;
const Example = () => <Carousel data={[]} renderItem={() => null} loop={false} />;
`;
  const result = transformSource(source, "fixture.tsx");

  assert.equal(result.changed, false);
  assert.equal(result.code, source);
  assert.equal((result.code.match(/\bloop=/g) ?? []).length, 1);
  assert.match(result.code, /<Widget autoPlay vertical/);
});

test("does not reprint files that do not use Carousel", () => {
  const source = 'const value={compact:true};\nexport default value;\n';
  const result = transformSource(source, "fixture.ts");

  assert.equal(result.changed, false);
  assert.equal(result.code, source);
});

test("reports props that require semantic manual migration", () => {
  const source = `
import Carousel from "react-native-reanimated-carousel";
const Example = () => (
  <Carousel data={[]} renderItem={() => null} mode="parallax" width={300} onScrollEnd={() => {}} />
);
`;
  const result = transformSource(source, "fixture.tsx");

  assert.deepEqual(result.warnings, ["mode", "onScrollEnd", "width"]);
});

test("is idempotent", () => {
  const source = `
import Carousel from "react-native-reanimated-carousel";
const Example = () => <Carousel data={[]} renderItem={() => null} autoPlay />;
`;
  const first = transformSource(source, "fixture.tsx");
  const second = transformSource(first.code, "fixture.tsx");

  assert.equal(second.code, first.code);
});

test("does not leave trailing whitespace around preserved comments", () => {
  const source = `
import Carousel from "react-native-reanimated-carousel";
const value = interpolate(progress,
  // Keep this explanation next to the interpolation input.
  [0, 1],
  [0, 100]
);
const Example = () => <Carousel data={[]} renderItem={() => null} autoPlay />;
`;
  const result = transformSource(source, "fixture.tsx");

  assert.doesNotMatch(result.code, /[ \t]+$/m);
});

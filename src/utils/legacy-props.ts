/**
 * v4 props that v5 no longer reads, mapped to what replaces them.
 * Used only for development warnings; nothing here changes runtime behavior.
 */
export const LEGACY_CAROUSEL_PROPS: Readonly<Record<string, string>> = {
  width: "use `style.width`",
  height: "use `style.height`",
  vertical: 'use `orientation="vertical"`',
  itemWidth: "use `itemSize`",
  itemHeight: "use `itemSize`",
  enabled: "use `scrollEnabled`",
  pagingEnabled: "use `snapMode`",
  snapEnabled: "use `snapMode`",
  enableSnap: "use `snapMode`",
  windowSize: "use `renderWindowSize`",
  autoPlay: "use `autoplay`",
  autoPlayInterval: "use `autoplayInterval`",
  autoPlayReverse: 'use `autoplayDirection="backward"`',
  customAnimation: "use `itemAnimation`",
  scrollAnimationDuration: "use `animation`",
  withAnimation: "use `animation`",
  mode: "use `layout`",
  modeConfig: "use `layout`",
  defaultScrollOffsetValue: "use `scrollOffsetValue`",
  onScrollEnd: "removed; use `onSnapToItem`",
  fixedDirection: "removed; use `ref.next()` or `ref.prev()`",
  customConfig: "removed",
  autoFillData: "removed; short loops are filled internally",
  minScrollDistancePerSwipe: "use `onConfigurePanGesture`",
  maxScrollDistancePerSwipe: "use `onConfigurePanGesture`",
  panGestureHandlerProps: "use `onConfigurePanGesture`",
};

export const LEGACY_PAGINATION_PROPS: Readonly<Record<string, string>> = {
  data: "use `count`",
  horizontal: "use `orientation`",
  size: "use `dotStyle.width` and `dotStyle.height`",
  carouselName: "removed",
  paginationItemAccessibility: "use `getItemAccessibilityLabel`",
  renderItem: "removed",
  customReanimatedStyle: "removed; build a custom indicator from `progress`",
};

const MIGRATION_HINT =
  "Run `npx --yes rnrc-codemod v5 .` or see https://rn-carousel.dev/migration-v5.";

export function findLegacyProps(
  props: object,
  legacyProps: Readonly<Record<string, string>>
): string[] {
  const values = props as Record<string, unknown>;
  return Object.keys(legacyProps).filter((name) => values[name] !== undefined);
}

export function describeLegacyProps(
  names: readonly string[],
  legacyProps: Readonly<Record<string, string>>
): string {
  const list = names.map((name) => `\`${name}\` (${legacyProps[name]})`).join(", ");
  return `v4 props that v5 ignores: ${list}. ${MIGRATION_HINT}`;
}

export function formatLegacyPropsWarning(
  component: "Carousel" | "Pagination",
  names: readonly string[],
  legacyProps: Readonly<Record<string, string>>
): string {
  return `[react-native-reanimated-carousel] ${component} received ${describeLegacyProps(names, legacyProps)}`;
}

export const LEGACY_RENDER_ITEM_WARNING = `[react-native-reanimated-carousel] renderItem read \`animationValue\`, which v5 renamed to \`relativeProgress\`. ${MIGRATION_HINT}`;

let warnedLegacyRenderItem = false;

/**
 * In development, reading the v4 `animationValue` field from the render-item
 * info logs a migration hint. The field stays `undefined` and non-enumerable.
 */
export function withLegacyRenderItemWarning<Info extends object>(info: Info): Info {
  if (!__DEV__) return info;

  Object.defineProperty(info, "animationValue", {
    configurable: true,
    enumerable: false,
    get() {
      if (!warnedLegacyRenderItem) {
        warnedLegacyRenderItem = true;
        console.warn(LEGACY_RENDER_ITEM_WARNING);
      }
      return undefined;
    },
  });
  return info;
}

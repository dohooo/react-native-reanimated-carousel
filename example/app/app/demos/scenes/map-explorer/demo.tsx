import type { SceneFont } from "@/features/scenes/fonts";
import { SceneScreen, useScene } from "@/features/scenes/kit";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  type SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  Carousel,
  type CarouselItemAnimation,
  type CarouselRef,
  type CarouselRenderItem,
} from "react-native-reanimated-carousel";
import Svg, { G, Path } from "react-native-svg";

interface Place {
  name: string;
  kind: string;
  rating: number;
  distance: string;
  tags: string[];
  color: string;
  icon: keyof typeof ICONS;
  /** Where the place is on the map, in map points. */
  at: [number, number];
}

const PLACES: Place[] = [
  {
    name: "Daylight Coffee",
    kind: "Coffee shop · $",
    rating: 4.8,
    distance: "0.3 mi · 6 min walk",
    tags: ["Pour-over", "Quiet"],
    color: "#F59E0B",
    icon: "coffee",
    at: [380, 560],
  },
  {
    name: "Corner Books",
    kind: "Bookstore",
    rating: 4.6,
    distance: "0.5 mi · 11 min walk",
    tags: ["Indie", "Has coffee"],
    color: "#8B5CF6",
    icon: "book",
    at: [545, 505],
  },
  {
    name: "Seabreeze Bakery",
    kind: "Bakery · $",
    rating: 4.9,
    distance: "0.7 mi · 5 min by bike",
    tags: ["Croissants", "Breakfast"],
    color: "#EF4444",
    icon: "bread",
    at: [685, 630],
  },
  {
    name: "South Hill Park",
    kind: "Park",
    rating: 4.7,
    distance: "1 mi · 7 min by bike",
    tags: ["Walks", "Sunsets"],
    color: "#10B981",
    icon: "tree",
    at: [600, 760],
  },
  {
    name: "Alley Ramen",
    kind: "Ramen · $$",
    rating: 4.5,
    distance: "0.7 mi · 14 min walk",
    tags: ["Open late", "Tonkotsu"],
    color: "#F97316",
    icon: "bowl",
    at: [435, 800],
  },
  {
    name: "Pier Market",
    kind: "Market",
    rating: 4.4,
    distance: "0.6 mi · 12 min walk",
    tags: ["Weekends", "Seafood"],
    color: "#0EA5E9",
    icon: "store",
    at: [285, 715],
  },
];

const ME = [470, 555];
const CHIPS = ["All", "Coffee", "Food", "Parks", "Open now"];
const TABS = [
  ["Explore", "compass"],
  ["Saved", "bookmark"],
  ["Updates", "bell"],
  ["You", "user"],
] as const;

// 24 × 24 stroke icons.
const ICONS = {
  coffee:
    "M5 9h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8.5 3.5c0 1.5 1 1.5 1 3M12.5 3.5c0 1.5 1 1.5 1 3",
  book: "M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13",
  bread:
    "M5 19v-6.5A3 3 0 0 1 4 7.5C5 5 8.5 4 12 4s7 1 8 3.5a3 3 0 0 1-1 5V19zM9.5 9l1 2.5M13.5 9l1 2.5",
  tree: "M12 3l6 8.5h-3l4 6H5l4-6H6zM12 17.5V21",
  bowl: "M3 11.5h18a9 8 0 0 1-18 0zM9 20h6M7 3l4 6.5M17 3l-3.5 6.5",
  store:
    "M4.5 9.5L6 4h12l1.5 5.5M5 10v10h14V10M4.5 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M10 20v-5h4v5",
  search: "M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0zM20 20l-4-4",
  layers: "M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 17l9 5 9-5",
  locate: "M3 11l18-8-8 18-2-8z",
  compass: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM15.5 8.5l-2 5-5 2 2-5z",
  bookmark: "M6 3.5h12v17l-6-4-6 4z",
  bell: "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
  user: "M20 21a8 8 0 0 0-16 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
};
const STAR = "M6 .6l1.6 3.4 3.7.4-2.7 2.5.7 3.7L6 8.8 2.7 10.6l.7-3.7L.7 4.4l3.7-.4z";

type IconProps = { name: keyof typeof ICONS; size: number; color: string; weight?: number };
function Icon({ name, size, color, weight = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path d={ICONS[name]} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ---------- the map: a generated city, 1000 × 1300 map points ----------

const MAP_W = 1000;
const MAP_H = 1300;

const ROADS = [
  { name: "Ridge Rd", from: [0, 170], to: [1000, 130], label: 0.3 },
  { name: "Union Ave", from: [0, 390], to: [1000, 460], label: 0.15 },
  { name: "Harbor Blvd", from: [0, 610], to: [1000, 560], label: 0.8 },
  { name: "Bay St", from: [0, 1050], to: [1000, 970], label: 0.6 },
  { name: "Mission St", from: [164, 0], to: [366, 1300], label: 0.33 },
  { name: "Hill Ave", from: [579, 0], to: [810, 1300], label: 0.12 },
];
const AREAS = [
  { name: "OLD TOWN", at: [120, 470] },
  { name: "MIDTOWN", at: [420, 250] },
  { name: "NORTH SHORE", at: [690, 300] },
  { name: "SOUTH HILL", at: [470, 905] },
  { name: "THE BAY", at: [60, 960], water: true },
];

function cityBlocks() {
  let seed = 77;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  let d = "";
  for (let x = 20; x < MAP_W; x += 90) {
    for (let y = 20; y < MAP_H; y += 80) {
      if (rand() > 0.55) continue;
      const [left, top] = [x + rand() * 10, y + rand() * 10];
      const [w, h] = [42 + rand() * 22, 32 + rand() * 18];
      d += `M${(left + 4).toFixed(1)} ${top.toFixed(1)}h${w.toFixed(1)}a4 4 0 0 1 4 4v${h.toFixed(1)}`;
      d += `a4 4 0 0 1-4 4h${(-w).toFixed(1)}a4 4 0 0 1-4-4v${(-h).toFixed(1)}a4 4 0 0 1 4-4z`;
    }
  }
  return d;
}

function sideStreets() {
  let d = "";
  for (let x = -60; x <= MAP_W; x += 90) d += `M${x} 0L${x + 58} ${MAP_H}`;
  for (let y = 0; y <= MAP_H + 40; y += 80) d += `M0 ${y}L${MAP_W} ${y - 30}`;
  return d;
}

const MAP = {
  blocks: cityBlocks(),
  streets: sideStreets(),
  roads: ROADS.map((r) => `M${r.from.join(" ")}L${r.to.join(" ")}`).join(""),
  parks:
    "M530 740Q590 700 680 730Q720 800 660 860Q580 885 540 820zM450 380h70q10 0 10 10v40q0 10-10 10h-70q-10 0-10-10v-40q0-10 10-10zM70 240q60-30 130 0q20 50-20 80q-80 20-110-20z",
  sea: "M0 800C120 770 200 820 300 860S520 980 600 1060L700 1300H0z",
  river: "M1040 330C880 410 840 490 720 530S540 590 450 700 330 800 280 880",
};

const MapLayers = () => (
  <G fill="none">
    <Path d={MAP.blocks} fill="#E2E5DD" />
    <Path d={MAP.parks} fill="#CDE8C4" />
    <Path d={MAP.sea} fill="#A9D3F0" />
    <Path d={MAP.river} stroke="#A9D3F0" strokeWidth={26} />
    <Path d={MAP.streets} stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={6} />
    <Path d={MAP.roads} stroke="#D3D8DC" strokeWidth={18} />
    <Path d={MAP.roads} stroke="#FFFFFF" strokeWidth={13} />
  </G>
);

const MapArt = React.memo(function MapArt() {
  const half = MAP_H / 2;
  return (
    <>
      {/* Two halves keep each SVG bitmap inside Android's GPU texture limit. */}
      {[0, half].map((top) => (
        <Svg
          key={top}
          width={MAP_W}
          height={half}
          viewBox={`0 ${top} ${MAP_W} ${half}`}
          style={{ position: "absolute", top }}
        >
          <MapLayers />
        </Svg>
      ))}
      {ROADS.map(({ name, from, to, label }) => {
        const rotate = `${Math.atan2(to[1] - from[1], to[0] - from[0])}rad`;
        const x = from[0] + (to[0] - from[0]) * label;
        const y = from[1] + (to[1] - from[1]) * label;
        return (
          <Text
            key={name}
            style={[styles.road, { left: x - 60, top: y - 7, transform: [{ rotate }] }]}
          >
            {name}
          </Text>
        );
      })}
      {AREAS.map(({ name, at, water }) => (
        <Text key={name} style={[styles.area, { left: at[0], top: at[1] }, water && styles.water]}>
          {name}
        </Text>
      ))}
    </>
  );
});

const wrap = (i: number, n: number) => {
  "worklet";
  return ((i % n) + n) % n;
};

/** How far progress is from item i on a loop of n items (0 … n / 2). */
const loopDistance = (progress: number, i: number, n: number) => {
  "worklet";
  const d = wrap(progress - i, n);
  return Math.min(d, n - d);
};

type PinProps = {
  place: Place;
  index: number;
  progress: SharedValue<number>;
  onPress: (index: number) => void;
};
function Pin({ place, index, progress, onPress }: PinProps) {
  // The pin grows as progress nears it; its name tag shows while it is the selected place.
  const pinStyle = useAnimatedStyle(() => {
    const d = loopDistance(progress.value, index, PLACES.length);
    return { transform: [{ scale: 1 + 0.4 * Math.max(0, 1 - d) }], zIndex: d < 0.5 ? 2 : 1 };
  });
  const tagStyle = useAnimatedStyle(() => {
    const d = loopDistance(progress.value, index, PLACES.length);
    return { opacity: interpolate(d, [0.3, 0.5], [1, 0], Extrapolation.CLAMP) };
  });
  return (
    <Animated.View
      style={[styles.pin, { left: place.at[0] - 18, top: place.at[1] - 40 }, pinStyle]}
    >
      <Animated.View style={[styles.pinTag, tagStyle]}>
        <View style={styles.pinBubble}>
          <Text style={styles.pinTagText}>{place.name}</Text>
        </View>
      </Animated.View>
      <Pressable accessibilityLabel={place.name} hitSlop={6} onPress={() => onPress(index)}>
        <View style={[styles.pinHead, { backgroundColor: place.color }]}>
          <View style={styles.pinGlyph}>
            <Icon name={place.icon} size={14} color="#fff" />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

type CityMapProps = {
  progress: SharedValue<number>;
  focus: number[];
  onPinPress: (index: number) => void;
};
function CityMap({ progress, focus, onPinPress }: CityMapProps) {
  // Pan to the point between the current and the next place, so the map glides with the cards.
  const panStyle = useAnimatedStyle(() => {
    const i = Math.floor(progress.value);
    const t = progress.value - i;
    const a = PLACES[wrap(i, PLACES.length)].at;
    const b = PLACES[wrap(i + 1, PLACES.length)].at;
    return {
      transform: [
        { translateX: focus[0] - (a[0] + (b[0] - a[0]) * t) },
        { translateY: focus[1] - (a[1] + (b[1] - a[1]) * t) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.map, panStyle]}>
      <MapArt />
      <View style={[styles.me, { left: ME[0] - 8, top: ME[1] - 8 }]} />
      {PLACES.map((place, i) => (
        <Pin key={place.name} place={place} index={i} progress={progress} onPress={onPinPress} />
      ))}
    </Animated.View>
  );
}

// ---------- screen chrome ----------

function SearchHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.search}>
        <Icon name="search" size={20} color="#4B5563" />
        <Text style={styles.searchText} numberOfLines={1}>
          Search coffee, books, food nearby…
        </Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JM</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {CHIPS.map((chip, i) => (
          <View key={chip} style={[styles.chip, i === 0 && styles.chipOn]}>
            <Text style={[styles.chipText, i === 0 && styles.chipTextOn]}>{chip}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function MapButtons() {
  return (
    <View style={styles.mapButtons}>
      <View style={styles.mapButton}>
        <Icon name="layers" size={20} color="#374151" weight={1.8} />
      </View>
      <View style={styles.rule} />
      <View style={styles.mapButton}>
        <Icon name="locate" size={19} color="#2563EB" weight={1.8} />
      </View>
    </View>
  );
}

function TabBar({ bottom }: { bottom: number }) {
  return (
    <View style={[styles.tabBar, { paddingBottom: bottom }]}>
      {TABS.map(([label, icon], i) => (
        <View key={label} style={styles.tab}>
          <Icon name={icon} size={24} color={i ? "#9CA3AF" : "#111827"} weight={i ? 1.8 : 2} />
          <Text style={[styles.tabText, !i && styles.tabTextOn]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------- place cards ----------

function Stars({ rating }: { rating: number }) {
  return (
    <Svg width={64} height={12} viewBox="0 0 64 12">
      {[0, 1, 2, 3, 4].map((k) => (
        <Path
          key={k}
          d={STAR}
          transform={`translate(${k * 13})`}
          fill={k < Math.round(rating) ? "#F59E0B" : "#E5E7EB"}
        />
      ))}
    </Svg>
  );
}

const PlaceCard = React.memo(function PlaceCard({ place, width }: { place: Place; width: number }) {
  return (
    <View style={[styles.card, { width }]}>
      <View style={[styles.thumb, { backgroundColor: place.color }]}>
        <LinearGradient
          colors={["#0000", "#0005"]}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Icon name={place.icon} size={34} color="#fff" />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.cardKind}>{place.kind}</Text>
        <View style={styles.rating}>
          <Stars rating={place.rating} />
          <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.distance}>{place.distance}</Text>
        <View style={styles.tags}>
          {place.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
});

const HEADER_H = 102; // search bar + chips
const CARD_H = 148;
const CAROUSEL_H = CARD_H + 32; // room for the card shadow
const TAB_H = 56;

function MapExplorer() {
  const { width, height, insets } = useScene();
  const carousel = React.useRef<CarouselRef>(null);
  const progress = useSharedValue(0);

  const itemSize = width - 72;
  const cardsTop = height - insets.bottom - TAB_H - CAROUSEL_H;
  // The selected pin sits a bit below the middle of the open map, leaving room for its name tag.
  const focus = [width / 2, (insets.top + HEADER_H + cardsTop) / 2 + 40];

  const itemAnimation = React.useCallback<CarouselItemAnimation>(
    (value) => {
      "worklet";
      const d = Math.abs(value);
      return {
        transform: [
          { translateX: value * itemSize + (width - itemSize) / 2 },
          { scale: interpolate(d, [0, 1], [1, 0.94], Extrapolation.CLAMP) },
        ],
        opacity: interpolate(d, [0, 1, 2], [1, 0.85, 0.4], Extrapolation.CLAMP),
      };
    },
    [width, itemSize]
  );

  const renderItem = React.useCallback<CarouselRenderItem<Place>>(
    ({ item }) => (
      <View style={styles.slot}>
        <PlaceCard place={item} width={itemSize - 12} />
      </View>
    ),
    [itemSize]
  );

  const showPlace = React.useCallback((index: number) => carousel.current?.scrollTo({ index }), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <CityMap progress={progress} focus={focus} onPinPress={showPlace} />
      <LinearGradient
        colors={["#EEF0EAF2", "#EEF0EA00"]}
        style={[styles.topFade, { height: insets.top + 24 }]}
      />
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <SearchHeader />
        <View style={styles.spacer} />
        <MapButtons />
        <Carousel
          ref={carousel}
          data={PLACES}
          loop
          autoplay
          autoplayInterval={2600}
          itemSize={itemSize}
          style={{ width, height: CAROUSEL_H }}
          progress={progress}
          animation={{ type: "timing", duration: 800, easing: Easing.out(Easing.poly(4)) }}
          itemAnimation={itemAnimation}
          renderItem={renderItem}
        />
        <TabBar bottom={insets.bottom} />
      </View>
    </View>
  );
}

const FONTS: SceneFont[] = [
  "Bricolage-Bold",
  "Instrument-Regular",
  "Instrument-Medium",
  "Instrument-SemiBold",
];

export default function Scene() {
  return (
    <SceneScreen background="#EEF0EA" statusBar="dark" fonts={FONTS}>
      <MapExplorer />
    </SceneScreen>
  );
}

const font = (fontFamily: SceneFont, fontSize: number, color: string, lineHeight?: number) => ({
  fontFamily,
  fontSize,
  color,
  lineHeight,
});
const shadow = (y: number, blur: number, alpha: number) =>
  `0 ${y}px ${blur}px rgba(0, 0, 0, ${alpha})`;
const center = { alignItems: "center", justifyContent: "center" } as const;

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, pointerEvents: "box-none" },
  spacer: { flex: 1, pointerEvents: "none" },
  topFade: { position: "absolute", left: 0, right: 0, top: 0, pointerEvents: "none" },
  map: { position: "absolute", width: MAP_W, height: MAP_H, backgroundColor: "#EEF0EA" },
  area: { ...font("Instrument-Medium", 15, "#9AA3A8"), position: "absolute", letterSpacing: 5 },
  water: { color: "#6FA6CC" },
  road: {
    ...font("Instrument-Medium", 10.5, "#8A9399", 14),
    position: "absolute",
    width: 120,
    textAlign: "center",
  },
  pin: {
    position: "absolute",
    width: 36,
    height: 40,
    alignItems: "center",
    transformOrigin: "50% 100%",
  },
  pinHead: {
    ...center,
    width: 30,
    height: 30,
    marginTop: 1,
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    borderWidth: 2,
    borderColor: "#fff",
    transform: [{ rotate: "-45deg" }],
    boxShadow: shadow(4, 10, 0.25),
  },
  pinGlyph: { transform: [{ rotate: "45deg" }] },
  pinTag: {
    position: "absolute",
    bottom: 46,
    width: 200,
    alignItems: "center",
    pointerEvents: "none",
  },
  pinBubble: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#fff",
    boxShadow: shadow(4, 12, 0.15),
  },
  pinTagText: font("Instrument-SemiBold", 11, "#1F2937", 13),
  me: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#2563EB",
    boxShadow: "0 0 0 6px rgba(37, 99, 235, 0.2)",
  },
  header: { paddingTop: 8 },
  search: {
    height: 48,
    marginHorizontal: 16,
    paddingLeft: 16,
    paddingRight: 8,
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    boxShadow: shadow(6, 18, 0.12),
  },
  searchText: { ...font("Instrument-Regular", 15, "#8A9399"), flex: 1 },
  avatar: { ...center, width: 32, height: 32, borderRadius: 16, backgroundColor: "#6D5BF0" },
  avatarText: font("Instrument-SemiBold", 12, "#fff"),
  chips: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 },
  chip: {
    ...center,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: "#fff",
    boxShadow: shadow(3, 10, 0.08),
  },
  chipOn: { backgroundColor: "#111827" },
  chipText: font("Instrument-Medium", 13.5, "#374151"),
  chipTextOn: { color: "#fff" },
  mapButtons: {
    alignSelf: "flex-end",
    marginRight: 16,
    marginBottom: 4,
    borderRadius: 14,
    backgroundColor: "#fff",
    boxShadow: shadow(6, 18, 0.12),
  },
  mapButton: { ...center, width: 44, height: 44 },
  rule: { height: StyleSheet.hairlineWidth, marginHorizontal: 8, backgroundColor: "#E5E7EB" },
  slot: { flex: 1, alignItems: "center", paddingTop: 8 },
  card: {
    height: CARD_H,
    padding: 12,
    gap: 12,
    flexDirection: "row",
    borderRadius: 20,
    backgroundColor: "#fff",
    boxShadow: "0 14px 30px -12px rgba(0, 0, 0, 0.3)",
  },
  thumb: { ...center, width: 96, borderRadius: 13, overflow: "hidden" },
  cardBody: { flex: 1, paddingTop: 2 },
  cardName: font("Bricolage-Bold", 17, "#111827", 21),
  cardKind: { ...font("Instrument-Regular", 12.5, "#6B7280", 16), marginTop: 1 },
  rating: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  ratingText: font("Instrument-SemiBold", 12.5, "#111827"),
  distance: { ...font("Instrument-Regular", 12.5, "#4B5563", 16), marginTop: 4 },
  tags: { flexDirection: "row", gap: 6, marginTop: "auto" },
  tag: {
    ...font("Instrument-Medium", 11, "#374151"),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  tab: { ...center, flex: 1, height: TAB_H, gap: 3 },
  tabText: font("Instrument-Medium", 11, "#9CA3AF"),
  tabTextOn: { color: "#111827" },
});

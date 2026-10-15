import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  Carousel,
  type CarouselItemAnimation,
  type CarouselRef,
  type CarouselRenderItem,
  Pagination,
} from "react-native-reanimated-carousel";
import Svg, { Circle, Path } from "react-native-svg";

import { SceneScreen, useScene } from "@/features/scenes/kit";

interface Story {
  section: string;
  title: string;
  dek: string;
  author: string;
  minutes: number;
  sky: [string, string];
  layers: Layer[];
}

// One parallax layer: SVG paths on a 456 x 240 grid, moved by relativeProgress × depth.
interface Layer {
  depth: number;
  paths: { d: string; fill?: string; stroke?: string; width?: number; opacity?: number }[];
}

// Card art is drawn on a 456 x 240 grid: the 296 pt wide art plus 80 pt of overscan per side.
const W = 456;
const H = 240;
const VIEWBOX = `0 0 ${W} ${H}`;

const STORIES: Story[] = [
  {
    section: "Travel",
    title: "Quiet Hours in Kyoto",
    dek: "Temple bells, empty lanes and the best matcha before the tour buses arrive.",
    author: "Mira Lin",
    minutes: 6,
    sky: ["#F4A99A", "#FBE5D3"],
    layers: [sun("#FF7A59", 104, 30), ...hills(3, ["#C3909A", "#9A6478", "#6B4462"])],
  },
  {
    section: "Photo",
    title: "Waiting for the Northern Lights",
    dek: "Five nights in Tromsø, one good forecast, and what it takes to wait it out.",
    author: "Jonas Berg",
    minutes: 9,
    sky: ["#061730", "#1B4466"],
    layers: [stars(11), aurora(), ...hills(11, ["#2D4E6B", "#1B3550", "#0D1F33"])],
  },
  {
    section: "Outdoors",
    title: "Camping Under Desert Stars",
    dek: "A night in Wadi Rum, where the Milky Way is bright enough to cast shadows.",
    author: "Amir Haddad",
    minutes: 7,
    sky: ["#FF9450", "#FFE2B8"],
    layers: [sun("#FFF6DF", 86, 30), ...hills(7, ["#EDA460", "#D9843B", "#B5602A"], true)],
  },
  {
    section: "Life",
    title: "A Slow Week by the Lake",
    dek: "No plans, a borrowed canoe and seven mornings of mist on the water.",
    author: "Lucy Zhao",
    minutes: 5,
    sky: ["#86C5EE", "#E6F6FF"],
    layers: [sun("#FFFFFF", 64, 30), ...hills(21, ["#8DB0C9", "#6390AF", "#3F7298"], false, true)],
  },
  {
    section: "Running",
    title: "The Night Runner's City Guide",
    dek: "Twelve routes that stay lit, safe and quiet after the city goes to sleep.",
    author: "Theo Park",
    minutes: 4,
    sky: ["#1E1342", "#6E43A6"],
    layers: [stars(5), sun("#FFE7A8", 58, 18), ...city(5)],
  },
];

// en-US names, so the header reads the same on every platform and locale.
const DAYS = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ");
const MONTHS = `January February March April May June July August
  September October November December`.split(/\s+/);
const INK = "#2B2622";
const RUST = "#B4532A";

// Seeded random numbers, so every launch draws the same landscapes.
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function round(v: number) {
  return Math.round(v * 10) / 10;
}

// A circle as path data, so many dots can share one <Path>.
function circle(x: number, y: number, r: number) {
  return `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
}

function sun(fill: string, y: number, r: number): Layer {
  return { depth: 0.15, paths: [{ d: circle(W / 2 + 40, y, r), fill }] };
}

function stars(seed: number): Layer {
  const r = rng(seed * 7);
  const dots = ["", ""]; // dim, bright
  for (let k = 0; k < 40; k++) {
    const [x, y, size] = [round(r() * W), round(r() * 130), round(r() * 1.2 + 0.3)];
    dots[r() > 0.5 ? 1 : 0] += circle(x, y, size);
  }
  return {
    depth: 0.08,
    paths: dots.map((d, i) => ({ d, fill: "#FFFFFF", opacity: i ? 0.85 : 0.45 })),
  };
}

function band(d: string, stroke: string, width: number, opacity: number) {
  return { d, stroke, width, opacity };
}

function aurora(): Layer {
  return {
    depth: 0.2,
    paths: [
      band("M0 90C90 30 170 120 260 60S400 40 456 80", "#6EF3C5", 26, 0.35),
      band("M0 100C100 50 180 130 270 72S400 60 456 92", "#A8FFE0", 8, 0.55),
    ],
  };
}

// Three ridges, far to near; `smooth` makes dunes, `lake` adds water in front of the middle one.
function hills(seed: number, colors: string[], smooth = false, lake = false): Layer[] {
  const ridge = (k: number) => {
    const r = rng(seed + k * 13);
    const n = [6, 8, 10][k];
    const base = [150, 178, 208][k] + (lake && k === 2 ? 30 : 0);
    const pts = Array.from({ length: n + 1 }, (_, i) => [
      round(-10 + ((W + 20) * i) / n),
      round(base - r() * [72, 52, 36][k]),
    ]);
    const mid = (i: number) =>
      `${round((pts[i][0] + pts[i + 1][0]) / 2)} ${round((pts[i][1] + pts[i + 1][1]) / 2)}`;
    let d = `M-10 ${H}L${pts[0].join(" ")}`;
    if (smooth) {
      d += `L${mid(0)}`;
      for (let i = 1; i < n; i++) d += `Q${pts[i].join(" ")} ${mid(i)}`;
      d += `L${pts[n].join(" ")}`;
    } else {
      for (let i = 1; i <= n; i++) d += `L${pts[i].join(" ")}`;
    }
    return `${d}L${W + 10} ${H}Z`;
  };
  return colors.map((fill, k) => ({
    depth: [0.35, 0.6, 0.9][k],
    paths: [
      { d: ridge(k), fill },
      ...(lake && k === 1
        ? [
            { d: `M0 200H${W}V${H}H0Z`, fill: "#5FA8D8" },
            band("M30 214h60M160 222h80M300 212h50", "#D9F0FF", 2, 0.7),
          ]
        : []),
    ],
  }));
}

// Far towers, then near towers with lit windows.
function city(seed: number): Layer[] {
  const r = rng(seed);
  let far = "";
  let near = "";
  let windows = "";
  for (let x = 0; x < W; x += 26 + r() * 10)
    far += `M${round(x)} ${round(110 + r() * 60)}h24V${H}h-24Z`;
  for (let x = -6; x < W; x += 38 + r() * 14) {
    const y = round(130 + r() * 60);
    const w = round(32 + r() * 10);
    near += `M${round(x)} ${y}h${w}V${H}h${-w}Z`;
    for (let wy = y + 8; wy < H - 8; wy += 12)
      for (let wx = x + 5; wx < x + w - 6; wx += 9)
        if (r() < 0.32) windows += `M${round(wx)} ${round(wy)}h4v5h-4Z`;
  }
  return [
    { depth: 0.45, paths: [{ d: far, fill: "#3B2770" }] },
    {
      depth: 0.9,
      paths: [
        { d: near, fill: "#170E33" },
        { d: windows, fill: "#FFD27A", opacity: 0.85 },
      ],
    },
  ];
}

export default function Scene() {
  return (
    <SceneScreen
      background="#F6F2EC"
      statusBar="dark"
      fonts={[
        "Fraunces-Bold",
        "Instrument-Regular",
        "Instrument-Medium",
        "Instrument-SemiBold",
        "JetBrainsMono-SemiBold",
      ]}
    >
      <EditorialCards />
    </SceneScreen>
  );
}

function EditorialCards() {
  const { width, insets } = useScene();
  const itemSize = width * 0.76;
  const cardWidth = itemSize - 16;
  // The card takes what the header and tab bar leave, up to a 1 : 1.7 ratio. The carousel adds
  // 12 pt above the card and 40 pt below it for the shadow; the dots and 24 pt margins follow.
  const [heroHeight, setHeroHeight] = React.useState(0);
  const cardHeight = Math.min(heroHeight - 12 - 40 - 6 - 48, cardWidth * 1.7);

  const ref = React.useRef<CarouselRef>(null);
  const progress = useSharedValue(0);
  const [index, setIndex] = React.useState(0);
  const today = new Date();
  // Long dates ("Wednesday, September 30") shrink to stay on one line beside the avatar.
  const date = `${DAYS[today.getDay()]}, ${MONTHS[today.getMonth()]} ${today.getDate()}`;
  const dateSize = Math.min(26, (width - 104) / (date.length * 0.56));

  const itemAnimation = React.useCallback<CarouselItemAnimation>(
    (value) => {
      "worklet";
      const d = Math.abs(value);
      return {
        transform: [
          { translateX: value * itemSize + (width - itemSize) / 2 },
          { translateY: interpolate(d, [0, 1], [0, 16], Extrapolation.CLAMP) },
          { scale: interpolate(d, [0, 1], [1, 0.9], Extrapolation.CLAMP) },
        ],
        zIndex: Math.round(100 - d * 10),
      };
    },
    [width, itemSize]
  );

  const renderItem = React.useCallback<CarouselRenderItem<Story>>(
    ({ item, relativeProgress }) => (
      <StoryCard story={item} width={cardWidth} height={cardHeight} progress={relativeProgress} />
    ),
    [cardWidth, cardHeight]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>
            TODAY'S PICKS · ISSUE {String(today.getDate()).padStart(2, "0")}
          </Text>
          <Text style={[styles.date, { fontSize: dateSize }]}>{date}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>R</Text>
        </View>
      </View>

      <View style={styles.sections}>
        {STORIES.map((story, i) => (
          <Pressable
            key={story.section}
            hitSlop={8}
            onPress={() => ref.current?.scrollTo({ index: i })}
          >
            <Text style={[styles.section, i === index && styles.sectionOn]}>{story.section}</Text>
            <View style={[styles.underline, i === index && styles.underlineOn]} />
          </Pressable>
        ))}
      </View>

      <View style={styles.hero} onLayout={(e) => setHeroHeight(e.nativeEvent.layout.height)}>
        {cardHeight > 0 && (
          <Carousel
            ref={ref}
            loop
            autoplay
            autoplayInterval={3200}
            data={STORIES}
            style={{ width, height: cardHeight + 52 }}
            itemSize={itemSize}
            itemAnimation={itemAnimation}
            animation={{ type: "timing", duration: 650, easing: Easing.out(Easing.poly(4)) }}
            progress={progress}
            onSnapToItem={setIndex}
            renderItem={renderItem}
          />
        )}
        <Pagination
          count={STORIES.length}
          progress={progress}
          containerStyle={styles.dots}
          dotStyle={{ width: 6, height: 6, backgroundColor: "#CFC6B8" }}
          activeDotStyle={{ width: 18, backgroundColor: INK }}
        />
      </View>

      <TabBar bottom={insets.bottom} />
    </View>
  );
}

const StoryCard = React.memo(function StoryCard(props: {
  story: Story;
  width: number;
  height: number;
  progress: SharedValue<number>;
}) {
  const { story, width, height, progress } = props;
  const s = width / 296; // the art is drawn for a 296 pt wide card
  const artHeight = height - 188; // the rest is the text block
  return (
    <View style={styles.slide}>
      <View style={[styles.card, { width, height }]}>
        <View style={styles.cardClip}>
          <LinearGradient colors={story.sky} style={{ height: artHeight }}>
            {story.layers.map((layer, k) => (
              <ParallaxLayer key={k} layer={layer} scale={s} progress={progress} />
            ))}
          </LinearGradient>
          <View style={styles.cardBody}>
            <Text style={styles.tag}>{story.section.toUpperCase()}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {story.title}
            </Text>
            <Text style={styles.dek} numberOfLines={2}>
              {story.dek}
            </Text>
            <View style={styles.byline}>
              <Text style={styles.author}>
                By {story.author} · {story.minutes} min read
              </Text>
              <Icon d={BOOKMARK} color="#8C8178" size={20} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

// Near layers move further than far ones: 80 pt × depth per item of progress.
// The grid is scaled to cover the art box and pinned to the ground (xMidYMax slice).
function ParallaxLayer(props: { layer: Layer; scale: number; progress: SharedValue<number> }) {
  const { layer, scale, progress } = props;
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: -progress.value * layer.depth * 80 * scale }],
  }));
  return (
    <Animated.View style={[styles.layer, { left: -80 * scale, width: W * scale }, style]}>
      <Svg width="100%" height="100%" viewBox={VIEWBOX} preserveAspectRatio="xMidYMax slice">
        {layer.paths.map((p, i) => (
          <Path
            key={i}
            d={p.d}
            fill={p.fill ?? "none"}
            stroke={p.stroke}
            strokeWidth={p.width}
            strokeLinecap="round"
            opacity={p.opacity}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

function Icon({ d, color, size = 24 }: { d: string; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={d}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const BOOKMARK = "M7 4h10v16l-5-3.5L7 20z";
const TABS = [
  { label: "Today", d: "M4 6h16M4 12h16M4 18h10" },
  { label: "Explore", d: "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zM15.5 8.5l-2 5-5 2 2-5z" },
  { label: "Saved", d: BOOKMARK },
  { label: "Profile", d: "M12 12a4 4 0 1 0 0-8 4 4 0 1 0 0 8zM5 20c1-4 4-6 7-6s6 2 7 6" },
];

function TabBar({ bottom }: { bottom: number }) {
  return (
    <View style={[styles.tabBar, { paddingBottom: bottom }]}>
      {TABS.map((tab, i) => {
        const color = i === 0 ? INK : "#A39A90";
        return (
          <View key={tab.label} style={styles.tab}>
            <Icon d={tab.d} color={color} />
            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function text(fontFamily: string, fontSize: number, lineHeight: number, color: string) {
  return { fontFamily, fontSize, lineHeight, color };
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F2EC" },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: { ...text("JetBrainsMono-SemiBold", 11, 14, RUST), letterSpacing: 1.3 },
  date: { ...text("Fraunces-Bold", 26, 32, INK), marginTop: 6 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: INK,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: text("Instrument-SemiBold", 15, 18, "#F6F2EC"),
  sections: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDD4C8",
  },
  section: { ...text("Instrument-Medium", 14, 20, "#9A9086"), paddingBottom: 8 },
  sectionOn: { color: INK },
  underline: { height: 2, borderRadius: 1 },
  underlineOn: { backgroundColor: INK },
  hero: { flex: 1, justifyContent: "center" },
  slide: { flex: 1, alignItems: "center", paddingTop: 12 },
  card: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 18px 40px -18px #3C281459",
  },
  cardClip: { flex: 1, borderRadius: 22, overflow: "hidden" },
  layer: { position: "absolute", top: 0, bottom: 0 },
  cardBody: { flex: 1, padding: 16, paddingHorizontal: 18 },
  tag: { ...text("JetBrainsMono-SemiBold", 10.5, 13, RUST), letterSpacing: 1.5 },
  title: { ...text("Fraunces-Bold", 22, 27, INK), marginTop: 8 },
  dek: { ...text("Instrument-Regular", 14, 20, "#6E655D"), marginTop: 8 },
  byline: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  author: text("Instrument-Regular", 12.5, 17, "#8C8178"),
  dots: { alignSelf: "center", gap: 6 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#DDD4C8",
    backgroundColor: "#F6F2EC",
  },
  tab: { flex: 1, height: 56, alignItems: "center", justifyContent: "center", gap: 3 },
  tabLabel: { fontFamily: "Instrument-Medium", fontSize: 11, lineHeight: 13 },
});

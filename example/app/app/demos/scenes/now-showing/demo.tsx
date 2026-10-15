import { SceneScreen, useScene } from "@/features/scenes/kit";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  type SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Carousel, type CarouselItemAnimation } from "react-native-reanimated-carousel";
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { scheduleOnRN } from "react-native-worklets";

type Art = "jelly" | "grid" | "sun" | "dune" | "planet";

interface Movie {
  title: string;
  tagline: string;
  genres: string[];
  rating: number;
  length: string;
  colors: [string, string];
  accent: string;
  art: Art;
  // Soft light for the blurred backdrop: x, y, radius (in % of the screen) and color.
  glows: [number, number, number, string][];
  times: string[];
}

const MOVIES: Movie[] = [
  {
    title: "Echoes of the Deep",
    tagline: "SOME SIGNALS STAY LOST",
    genres: ["Sci-fi", "Mystery"],
    rating: 8.6,
    length: "2h 08m",
    colors: ["#0B3954", "#087E8B"],
    accent: "#7FF5E8",
    art: "jelly",
    glows: [
      [28, 30, 40, "#7FF5E8"],
      [74, 22, 26, "#7FF5E8"],
      [60, 62, 24, "#2EC4B6"],
    ],
    times: ["1:10 PM", "4:20 PM", "7:30 PM", "10:15 PM"],
  },
  {
    title: "Neon City",
    tagline: "THE CITY NEVER LOGS OFF",
    genres: ["Action", "Cyberpunk"],
    rating: 7.9,
    length: "1h 54m",
    colors: ["#2B0A3D", "#D7263D"],
    accent: "#FF4FD8",
    art: "grid",
    glows: [
      [50, 92, 70, "#FF4FD8"],
      [50, 42, 34, "#12051E"],
    ],
    times: ["12:45 PM", "3:30 PM", "6:50 PM", "9:40 PM"],
  },
  {
    title: "The Last Summer",
    tagline: "EVERY SUMMER ENDS",
    genres: ["Drama", "Coming of age"],
    rating: 8.2,
    length: "1h 47m",
    colors: ["#F6AE2D", "#F26419"],
    accent: "#FFF3B0",
    art: "sun",
    glows: [
      [50, 45, 38, "#FFF3B0"],
      [50, 95, 60, "#2E86AB"],
    ],
    times: ["11:30 AM", "2:15 PM", "5:00 PM", "8:10 PM"],
  },
  {
    title: "Song of the Dunes",
    tagline: "THE SAND REMEMBERS",
    genres: ["Adventure"],
    rating: 8.8,
    length: "2h 31m",
    colors: ["#9C4A1A", "#E09F3E"],
    accent: "#FFE8C2",
    art: "dune",
    glows: [
      [72, 22, 26, "#FFE8C2"],
      [40, 96, 66, "#8A3F12"],
    ],
    times: ["12:00 PM", "3:45 PM", "7:15 PM", "10:30 PM"],
  },
  {
    title: "The Star Courier",
    tagline: "4 LIGHT-YEARS. ONE PARCEL.",
    genres: ["Sci-fi", "Comedy"],
    rating: 8.4,
    length: "1h 59m",
    colors: ["#1B1035", "#5B3A9E"],
    accent: "#FFD166",
    art: "planet",
    glows: [
      [50, 44, 34, "#FFD166"],
      [20, 80, 40, "#7B5CD6"],
    ],
    times: ["1:30 PM", "4:40 PM", "7:00 PM", "9:55 PM"],
  },
];

const ACCENTS = MOVIES.map((m) => m.accent);
const TODAY = new Date()
  .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  .toUpperCase();
const EASE_OUT_QUART = Easing.bezier(0.25, 1, 0.5, 1);
const STAR = "M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z";
const circle = (x: number, y: number, r: number) =>
  `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const each = (n: number, part: (k: number) => string) =>
  Array.from({ length: n }, (_, k) => part(k)).join("");
const JELLIES = [
  [70, 120, 34, 150],
  [160, 80, 22, 100],
  [130, 190, 16, 204],
];

// Poster art in a 220 x 320 box, as [path, fill, stroke, strokeWidth] layers.
const ART: Record<Art, [string, string, string?, number?][]> = {
  jelly: [
    [JELLIES.map(([x, y, r]) => circle(x, y, r)).join(""), "rgba(127,245,232,0.45)"],
    [
      JELLIES.map(
        ([x, , , t]) =>
          `M${x - 14} ${t}q4 30-4 50M${x} ${t + 4}q-4 34 4 56M${x + 14} ${t}q6 28-2 46`
      ).join(""),
      "none",
      "rgba(127,245,232,0.6)",
      2,
    ],
  ],
  grid: [
    [
      each(9, (k) => `M${28 * k} 200L${110 + (k - 4) * 70} 320`),
      "none",
      "rgba(255,79,216,0.7)",
      1.5,
    ],
    ["M0 210H220M0 228H220M0 250H220M0 280H220M0 316H220", "none", "rgba(255,79,216,0.7)", 1.5],
    [
      "M20 110h26v90H20zM52 80h34v120H52zM92 126h22v74H92zM120 60h40v140h-40zM166 100h34v100h-34z",
      "#12051E",
    ],
  ],
  sun: [
    [circle(110, 170, 64), "#FFF3B0"],
    ["M0 190h220v130H0z", "#2E86AB"],
    ["M20 214h70M120 232h80M40 256h120", "none", "rgba(255,243,176,0.7)", 3],
  ],
  dune: [
    [circle(160, 80, 26), "#FFE8C2"],
    [
      "M-10 320L-10 198L20 188Q50 178 80 180Q110 182 140 176Q170 169 200 188L230 208L230 320Z",
      "#C46A2B",
    ],
    [
      "M-10 320L-10 240L14 243Q38 246 62 228Q86 211 110 230Q134 250 158 242Q182 235 206 235L230 236L230 320Z",
      "#8A3F12",
    ],
  ],
  planet: [
    [
      each(30, (k) => circle((k * 73 + 11) % 220, (k * 131 + 47) % 320, 0.6 + (k % 3) * 0.4)),
      "rgba(255,255,255,0.8)",
    ],
    [circle(110, 150, 54), "#FFD166"],
    // The ring: an ellipse 96 x 18 tilted by -18 degrees.
    ["M18.7 179.7A96 18 -18 1 0 201.3 120.3A96 18 -18 1 0 18.7 179.7", "none", "#FFF1C1", 5],
  ],
};

const Poster = React.memo(function Poster({ movie, width }: { movie: Movie; width: number }) {
  const k = width / 220;
  const radius = 16 * k;
  return (
    <View
      style={[styles.posterShadow, { width, height: width * (320 / 220), borderRadius: radius }]}
    >
      <LinearGradient
        colors={movie.colors}
        start={{ x: 0.41, y: 0 }}
        end={{ x: 0.59, y: 1 }}
        style={[styles.poster, { borderRadius: radius }]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 220 320" preserveAspectRatio="xMidYMid slice">
          {ART[movie.art].map(([d, fill, stroke, strokeWidth]) => (
            <Path key={d} d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
          ))}
        </Svg>
        <View style={[styles.posterText, { left: 14 * k, right: 14 * k, bottom: 16 * k }]}>
          <Text
            style={[
              styles.posterTitle,
              { color: movie.accent, fontSize: 25 * k, lineHeight: 27 * k },
            ]}
          >
            {movie.title}
          </Text>
          <Text
            style={[
              styles.tagline,
              { fontSize: 9 * k, lineHeight: 12 * k, letterSpacing: 1.8 * k },
            ]}
          >
            {movie.tagline}
          </Text>
        </View>
        <View style={[styles.badge, { top: 12 * k, right: 12 * k }]}>
          <Text style={styles.badgeText}>IMAX</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

// One full-screen layer per movie; its opacity is 1 minus its distance to progress (on a loop).
function Backdrop({
  movie,
  index,
  progress,
}: { movie: Movie; index: number; progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const n = MOVIES.length;
    const d = (((progress.value - index) % n) + n) % n;
    return { opacity: Math.max(0, 1 - Math.min(d, n - d)) };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <LinearGradient
        colors={movie.colors}
        start={{ x: 0.33, y: 0 }}
        end={{ x: 0.67, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          {movie.glows.map(([x, y, r, color], k) => (
            <RadialGradient
              key={k}
              id={`${movie.art}-glow-${k}`}
              cx={x}
              cy={y}
              r={r}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={color} stopOpacity={0.6} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {movie.glows.map((_, k) => (
          <Rect key={k} width={100} height={100} fill={`url(#${movie.art}-glow-${k})`} />
        ))}
      </Svg>
    </Animated.View>
  );
}

// Mounted again (new key) for every movie, so the text fades up into place.
function FadeIn({ children }: { children: React.ReactNode }) {
  const t = useSharedValue(0);
  React.useEffect(() => {
    t.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * 6 }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating / 2);
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }, (_, k) => (
        <Svg key={k} width={16} height={16} viewBox="0 0 24 24">
          <Path
            d={STAR}
            fill={k < full ? "#FFD166" : "none"}
            stroke="#FFD166"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </Svg>
      ))}
    </View>
  );
}

function NowShowing() {
  const { width, height, insets } = useScene();
  const progress = useSharedValue(0);
  const [index, setIndex] = React.useState(0);
  const [time, setTime] = React.useState(2);

  // Tabs, movie details and the button take about 380 pt; the posters get the rest.
  const room = height - insets.top - Math.max(insets.bottom, 16) - 380;
  const posterWidth = Math.round(Math.min(width * 0.6, (room - 40) / (320 / 220)));
  const itemSize = Math.round(posterWidth * 1.05);
  const k = posterWidth / 220; // the prototype's numbers are for a 220 pt poster
  const fit = Math.min(1, width / 402); // keeps the three tabs on one line

  const itemAnimation = React.useCallback<CarouselItemAnimation>(
    (value) => {
      "worklet";
      const d = Math.abs(value);
      return {
        transform: [
          { translateX: value * itemSize + (width - itemSize) / 2 },
          { translateY: interpolate(d, [0, 1], [0, 24 * k], Extrapolation.CLAMP) },
          { scale: interpolate(d, [0, 1], [1, 0.84], Extrapolation.CLAMP) },
        ],
        opacity: interpolate(d, [0, 1, 2], [1, 0.6, 0], Extrapolation.CLAMP),
        zIndex: Math.round(100 - d * 10),
      };
    },
    [itemSize, width, k]
  );

  // Details follow the poster closest to the center.
  useAnimatedReaction(
    () => {
      const n = MOVIES.length;
      return ((Math.round(progress.value) % n) + n) % n;
    },
    (current, previous) => {
      if (current !== previous) scheduleOnRN(setIndex, current);
    }
  );

  // The button blends from one movie's accent to the next while you drag.
  const buttonStyle = useAnimatedStyle(() => {
    const n = ACCENTS.length;
    const i = Math.floor(progress.value);
    const from = ACCENTS[((i % n) + n) % n];
    const to = ACCENTS[(((i + 1) % n) + n) % n];
    return { backgroundColor: interpolateColor(progress.value - i, [0, 1], [from, to]) };
  });

  const renderItem = React.useCallback(
    ({ item }: { item: Movie }) => (
      <View style={[styles.slide, { width: itemSize, paddingTop: 12 }]}>
        <Poster movie={item} width={posterWidth} />
      </View>
    ),
    [itemSize, posterWidth]
  );

  const movie = MOVIES[index];

  return (
    <View style={styles.fill}>
      {MOVIES.map((m, i) => (
        <Backdrop key={m.title} movie={m} index={i} progress={progress} />
      ))}
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.88)"]}
        locations={[0, 0.16, 0.42, 0.68]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.tabs, { marginTop: insets.top + 12 }]}>
        <Text style={[styles.tabOn, { fontSize: 22 * fit }]}>Now Showing</Text>
        <Text style={[styles.tab, { fontSize: 15 * fit }]}>Coming Soon</Text>
        <Text style={[styles.tab, { fontSize: 15 * fit }]}>Cinemas</Text>
      </View>

      <View style={styles.stage}>
        <Carousel
          data={MOVIES}
          loop
          autoplay
          autoplayInterval={3000}
          itemSize={itemSize}
          style={{ width, height: posterWidth * (320 / 220) + 48 * k + 12 }}
          animation={{ type: "timing", duration: 650, easing: EASE_OUT_QUART }}
          progress={progress}
          itemAnimation={itemAnimation}
          renderItem={renderItem}
        />
      </View>

      <View style={[styles.info, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <FadeIn key={movie.title}>
          <Text style={styles.title} numberOfLines={1}>
            {movie.title}
          </Text>
          <View style={styles.chips}>
            {[...movie.genres, movie.length, "PG-13"].map((label) => (
              <View key={label} style={styles.chip}>
                <Text style={styles.chipText}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.rating}>
            <Text style={styles.score}>{movie.rating.toFixed(1)}</Text>
            <Stars rating={movie.rating} />
            <Text style={styles.scoreLabel}>Audience score</Text>
          </View>
        </FadeIn>

        <Text style={styles.label}>TODAY · {TODAY}</Text>
        <View style={styles.times}>
          {movie.times.map((t, i) => (
            <Pressable
              key={t}
              onPress={() => setTime(i)}
              style={[styles.time, i === time && { borderColor: movie.accent }]}
            >
              <Text style={[styles.timeText, i === time && { color: movie.accent }]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <Animated.View style={[styles.button, buttonStyle]}>
            <Text style={styles.buttonText}>Get tickets · {movie.times[time]}</Text>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

export default function Scene() {
  return (
    <SceneScreen
      background="#000000"
      statusBar="light"
      fonts={[
        "Bricolage-Bold",
        "Instrument-Regular",
        "Instrument-Medium",
        "Instrument-Bold",
        "Fraunces-Bold",
        "JetBrainsMono-Medium",
        "JetBrainsMono-SemiBold",
        "JetBrainsMono-Bold",
      ]}
    >
      <NowShowing />
    </SceneScreen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  tabs: { flexDirection: "row", alignItems: "baseline", gap: 16, paddingHorizontal: 24 },
  tabOn: { fontFamily: "Bricolage-Bold", fontSize: 22, lineHeight: 28, color: "#FFFFFF" },
  tab: {
    fontFamily: "Instrument-Medium",
    fontSize: 15,
    lineHeight: 20,
    color: "rgba(255,255,255,0.6)",
  },
  stage: { flex: 1, justifyContent: "center" },
  slide: { alignItems: "center" },
  posterShadow: { boxShadow: "0 24px 40px -16px rgba(0,0,0,0.7)" },
  poster: { flex: 1, overflow: "hidden" },
  posterText: { position: "absolute", gap: 4 },
  posterTitle: {
    fontFamily: "Fraunces-Bold",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  tagline: { fontFamily: "JetBrainsMono-SemiBold", color: "rgba(255,255,255,0.8)" },
  badge: {
    position: "absolute",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  badgeText: {
    fontFamily: "JetBrainsMono-Bold",
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0.9,
    color: "#FFFFFF",
  },
  info: { paddingHorizontal: 24 },
  title: { fontFamily: "Fraunces-Bold", fontSize: 30, lineHeight: 36, color: "#FFFFFF" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  chipText: { fontFamily: "Instrument-Medium", fontSize: 12, lineHeight: 14, color: "#FFFFFF" },
  rating: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  score: { fontFamily: "Bricolage-Bold", fontSize: 24, lineHeight: 28, color: "#FFFFFF" },
  stars: { flexDirection: "row", gap: 3 },
  scoreLabel: {
    fontFamily: "Instrument-Regular",
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.55)",
  },
  label: {
    fontFamily: "JetBrainsMono-Medium",
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.55)",
    marginTop: 22,
  },
  times: { flexDirection: "row", gap: 8, marginTop: 10, marginBottom: 20 },
  time: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: { fontFamily: "Instrument-Medium", fontSize: 13, lineHeight: 16, color: "#FFFFFF" },
  button: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  buttonText: { fontFamily: "Instrument-Bold", fontSize: 16, lineHeight: 20, color: "#111111" },
});

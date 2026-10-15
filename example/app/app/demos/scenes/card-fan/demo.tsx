import { SceneScreen, useScene } from "@/features/scenes/kit";
import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Carousel,
  type CarouselItemAnimation,
  type CarouselRef,
} from "react-native-reanimated-carousel";
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { scheduleOnRN } from "react-native-worklets";

type Suit = "spades" | "hearts" | "clubs" | "diamonds";
type PlayingCard = { rank: string; suit: Suit; meaning: string };

const HAND: PlayingCard[] = (
  [
    ["A", "spades", "A clean slate. Finish one thing before you start the next."],
    ["K", "hearts", "A generous ally is closer than you think. Ask for help."],
    ["Q", "clubs", "Confident and warm. People follow your lead today."],
    ["J", "diamonds", "News is on its way. Read the fine print before you sign."],
    ["10", "spades", "A long day ends well. Rest is part of the plan."],
    ["9", "hearts", "The wish card. Say out loud what you want."],
    ["8", "clubs", "Busy hours and quick calls. Trust your first instinct."],
    ["7", "diamonds", "Small bets, small wins. Keep the stakes low today."],
    ["6", "spades", "Steady progress. One step at a time still gets you there."],
    ["5", "hearts", "Let go of a small regret and make room for something new."],
    ["4", "clubs", "Plans may shift. Stay flexible and keep your options open."],
    ["3", "diamonds", "Put it in writing. A clear note saves a long talk."],
    ["2", "spades", "A choice between two paths. Neither one is wrong."],
  ] as const
).map(([rank, suit, meaning]) => ({ rank, suit, meaning }));

const N = HAND.length;
const RANK_NAME: Record<string, string> = { A: "Ace", K: "King", Q: "Queen", J: "Jack" };
const cardName = ({ rank, suit }: PlayingCard) =>
  `${RANK_NAME[rank] ?? rank} of ${suit[0].toUpperCase()}${suit.slice(1)}`;
const TODAY = new Date()
  .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  .toUpperCase();

const RED = "#C62B3A";
const INK = "#1B1B1F";
const GOLD = "#E8C766";
const CREAM = "#F6EBD3";

// Suit shapes in a 100 x 100 box.
const SUIT_PATH: Record<Suit, string> = {
  hearts:
    "M50 92C34 77 5 58 5 32 5 17 16 7 29 7c10 0 17 6 21 14 4-8 11-14 21-14 13 0 24 10 24 25 0 26-29 45-45 60Z",
  diamonds: "M50 4Q64 28 86 50 64 72 50 96 36 72 14 50 36 28 50 4Z",
  spades:
    "M50 5C62 24 94 40 94 63c0 13-10 21-22 21-9 0-16-5-19-12 1 10 5 18 12 23H35c7-5 11-13 12-23-3 7-10 12-19 12C16 84 6 76 6 63 6 40 38 24 50 5Z",
  clubs:
    "M31 30a19 19 0 1 1 38 0 19 19 0 1 1-38 0ZM9 60a19 19 0 1 1 38 0 19 19 0 1 1-38 0Zm44 0a19 19 0 1 1 38 0 19 19 0 1 1-38 0ZM40 44h20v18H40ZM47 62c0 16-5 26-13 33h32c-8-7-13-17-13-33Z",
};

// Pip layouts: points [x, y] as fractions of the card. Pips below the middle are upside down.
const col = (x: number, ...ys: number[]) => ys.map((y) => [x, y]);
const sides = (...ys: number[]) => [...col(0.3, ...ys), ...col(0.7, ...ys)];
const PIPS: Record<string, number[][]> = {
  A: col(0.5, 0.5),
  "2": col(0.5, 0.2, 0.8),
  "3": col(0.5, 0.2, 0.5, 0.8),
  "4": sides(0.2, 0.8),
  "5": [...sides(0.2, 0.8), ...col(0.5, 0.5)],
  "6": sides(0.2, 0.5, 0.8),
  "7": [...sides(0.2, 0.5, 0.8), ...col(0.5, 0.35)],
  "8": [...sides(0.2, 0.5, 0.8), ...col(0.5, 0.35, 0.65)],
  "9": [...sides(0.2, 0.4, 0.6, 0.8), ...col(0.5, 0.5)],
  "10": [...sides(0.2, 0.4, 0.6, 0.8), ...col(0.5, 0.3, 0.7)],
};

const STEP_DEG = 8; // angle between neighbouring cards
const LIFT = 30; // the current card rises this far along the radius

// Distance between progress and card i around the loop, 0 to N / 2.
const loopDistance = (p: number, i: number) => {
  "worklet";
  return Math.abs(((((p - i) % N) + N + N / 2) % N) - N / 2);
};

export default function Scene() {
  return (
    <SceneScreen
      background="#0D3B26"
      statusBar="light"
      fonts={["Fraunces-Bold", "Instrument-Regular", "Instrument-Medium", "Instrument-SemiBold"]}
    >
      <CardFan />
    </SceneScreen>
  );
}

function CardFan() {
  const { width, height, insets } = useScene();
  const s = width / 402;
  const card = { w: Math.round(146 * s), h: Math.round(210 * s) };
  const item = Math.round(44 * s); // drag distance per card
  const radius = 360 * s; // from a card's centre down to the pivot
  const fanH = Math.round(card.h + 180 * s);
  const cardTop = LIFT + 12;
  const pivotY = cardTop + card.h / 2 + radius;

  const ref = React.useRef<CarouselRef>(null);
  const progress = useSharedValue(0);
  const [current, setCurrent] = React.useState(0);

  // Swap the caption as soon as another card reaches the middle, mid-drag too.
  useAnimatedReaction(
    () => ((Math.round(progress.value) % N) + N) % N,
    (index, prev) => {
      if (index !== prev) scheduleOnRN(setCurrent, index);
    }
  );

  const itemAnimation = React.useCallback<CarouselItemAnimation>(
    (value) => {
      "worklet";
      const d = Math.abs(value);
      return {
        transform: [
          { translateX: (width - item) / 2 },
          { rotateZ: `${value * STEP_DEG}deg` },
          { translateY: -LIFT * Math.max(0, 1 - d) },
        ],
        transformOrigin: [item / 2, pivotY, 0],
        zIndex: Math.round(100 - d * 5),
        opacity: interpolate(d, [4, 5], [1, 0], "clamp"), // cards wrapping round the back
      };
    },
    [width, item, pivotY]
  );

  const renderItem = React.useCallback(
    ({ item: c }: { item: PlayingCard }) => (
      <View style={{ position: "absolute", left: (item - card.w) / 2, top: cardTop }}>
        <CardFace card={c} w={card.w} h={card.h} />
      </View>
    ),
    [item, card.w, card.h, cardTop]
  );

  const shuffle = () => {
    const now = ref.current?.getCurrentIndex() ?? 0;
    let next = Math.floor(Math.random() * N);
    if (next === now) next = (next + 5) % N;
    ref.current?.scrollTo({ index: next });
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Felt width={width} height={height} />
      <TopBar top={insets.top} s={s} />

      <View style={styles.table}>
        <View style={[styles.rim, { top: 4 * s, bottom: 4 * s }]} />
        <Text style={[styles.kicker, { fontSize: 12 * s }]}>{TODAY}</Text>
        <Carousel
          ref={ref}
          loop
          autoplay
          autoplayInterval={1600}
          data={HAND}
          itemSize={item}
          style={{ width, height: fanH }}
          animation={{ type: "timing", duration: 700, easing: Easing.bezier(0.25, 1, 0.5, 1) }}
          itemAnimation={itemAnimation}
          progress={progress}
          renderItem={renderItem}
        />
        <Caption card={HAND[current]} s={s} />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 * s }]}>
        <View style={styles.strip}>
          {HAND.map((c, i) => (
            <RankDot
              key={c.rank}
              rank={c.rank}
              index={i}
              progress={progress}
              onPress={() => ref.current?.scrollTo({ index: i })}
            />
          ))}
        </View>
        <Pressable
          onPress={shuffle}
          style={({ pressed }) => [styles.shuffle, { height: 52 * s }, pressed && styles.pressed]}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" stroke={GOLD} {...LINE}>
            <Path d="M3 7h3.5c2.2 0 3.6 1.2 4.8 3.2l1.4 2.6c1.2 2 2.6 3.2 4.8 3.2H21" />
            <Path d="M3 17h3.5c1.4 0 2.5-.5 3.4-1.4M14.1 8.4c.9-.9 2-1.4 3.4-1.4H21" />
            <Path d="M18 4l3 3-3 3M18 13l3 3-3 3" />
          </Svg>
          <Text style={[styles.shuffleText, { fontSize: 16 * s }]}>Shuffle</Text>
        </Pressable>
      </View>
    </View>
  );
}

const LINE = {
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Felt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient
          id="felt"
          cx={width / 2}
          cy={height * 0.4}
          r={Math.hypot(width / 2, height * 0.6)}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#1F7A4D" />
          <Stop offset="0.68" stopColor="#0D3B26" />
          <Stop offset="1" stopColor="#072417" />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#felt)" />
    </Svg>
  );
}

function TopBar({ top, s }: { top: number; s: number }) {
  return (
    <View style={[styles.topBar, { marginTop: top, height: 56 * s }]}>
      <View style={styles.roundButton}>
        <Svg width={18} height={18} viewBox="0 0 24 24" stroke={CREAM} {...LINE}>
          <Path d="M15 5l-7 7 7 7" strokeWidth={2.4} />
        </Svg>
      </View>
      <Text style={[styles.title, { fontSize: 20 * s }]}>Daily Draw</Text>
      <View style={styles.chips}>
        <Svg width={18} height={18} viewBox="0 0 20 20">
          <Circle cx={10} cy={10} r={9} fill={GOLD} />
          <Circle cx={10} cy={10} r={5.5} stroke="#8A6A1C" {...LINE} strokeDasharray="2.2 2.2" />
        </Svg>
        <Text style={styles.chipsText}>1,250</Text>
      </View>
    </View>
  );
}

function Caption({ card, s }: { card: PlayingCard; s: number }) {
  const shown = useSharedValue(1);
  React.useEffect(() => {
    shown.value = 0;
    shown.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) });
  }, [card, shown]);
  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * 6 }],
  }));
  return (
    <View style={[styles.caption, { marginTop: -24 * s }]}>
      <Text style={[styles.drew, { fontSize: 14 * s }]}>You drew the</Text>
      <Animated.View style={[styles.captionBody, style]}>
        <Text style={[styles.pick, { fontSize: 28 * s, lineHeight: 36 * s }]}>
          {cardName(card)}
        </Text>
        <Text style={[styles.meaning, { fontSize: 15 * s, lineHeight: 21 * s, maxWidth: 280 * s }]}>
          {card.meaning}
        </Text>
      </Animated.View>
    </View>
  );
}

type FaceProps = { card: PlayingCard; color: string; k: number };

const CardFace = React.memo(function CardFace(props: { card: PlayingCard; w: number; h: number }) {
  const { card, w, h } = props;
  const color = card.suit === "hearts" || card.suit === "diamonds" ? RED : INK;
  const k = w / 110; // the prototype's card was 110 pt wide
  const pip = (card.rank === "A" ? 60 : 24) * k;
  return (
    <View style={[styles.card, { width: w, height: h, borderRadius: 10 * k }]}>
      {card.rank in PIPS ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          {PIPS[card.rank].map(([x, y]) => (
            <Path
              key={`${x}-${y}`}
              d={SUIT_PATH[card.suit]}
              fill={color}
              transform={`translate(${x * w} ${y * h}) rotate(${y > 0.5 ? 180 : 0}) scale(${pip / 100}) translate(-50 -50)`}
            />
          ))}
        </Svg>
      ) : (
        <FacePanel card={card} color={color} k={k} w={w - 40 * k} h={h - 44 * k} />
      )}
      <CornerIndex card={card} color={color} k={k} />
      <CornerIndex card={card} color={color} k={k} flipped />
    </View>
  );
});

function CornerIndex({ card, color, k, flipped }: FaceProps & { flipped?: boolean }) {
  const place = flipped
    ? { right: 6 * k, bottom: 7 * k, transform: [{ rotate: "180deg" }] }
    : { left: 6 * k, top: 7 * k };
  return (
    <View style={[styles.index, { width: 22 * k }, place]}>
      <Text style={[styles.serif, { color, fontSize: 18 * k, lineHeight: 20 * k }]}>
        {card.rank}
      </Text>
      <Svg width={13 * k} height={13 * k} viewBox="0 0 100 100">
        <Path d={SUIT_PATH[card.suit]} fill={color} />
      </Svg>
    </View>
  );
}

// Jack, Queen and King: a framed panel with gold hatching behind a big letter.
function FacePanel({ card, color, k, w, h }: FaceProps & { w: number; h: number }) {
  let hatch = "";
  for (let c = 8; c < w + h; c += 11) {
    const x1 = Math.min(c, w);
    const y2 = Math.min(c, h);
    hatch += `M${x1} ${c - x1}L${c - y2} ${y2}`;
  }
  return (
    <View
      style={[
        styles.panel,
        { left: 20 * k, top: 22 * k, width: w, height: h },
        { borderColor: color },
      ]}
    >
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        <Path d={hatch} stroke="rgba(232,199,102,0.3)" strokeWidth={2} />
      </Svg>
      <Text style={[styles.serif, { color, fontSize: 44 * k, lineHeight: 48 * k }]}>
        {card.rank}
      </Text>
      <Svg width={20 * k} height={20 * k} viewBox="0 0 100 100">
        <Path d={SUIT_PATH[card.suit]} fill={color} />
      </Svg>
    </View>
  );
}

type RankDotProps = {
  rank: string;
  index: number;
  progress: SharedValue<number>;
  onPress: () => void;
};

function RankDot({ rank, index, progress, onPress }: RankDotProps) {
  const dot = useAnimatedStyle(() => {
    const t = Math.min(loopDistance(progress.value, index), 1);
    return {
      backgroundColor: interpolateColor(t, [0, 1], [GOLD, "rgba(232,199,102,0)"]),
      transform: [{ scale: 1 - 0.14 * t }],
    };
  });
  const label = useAnimatedStyle(() => ({
    color: interpolateColor(
      Math.min(loopDistance(progress.value, index), 1),
      [0, 1],
      ["#0D3B26", "rgba(246,235,211,0.6)"]
    ),
  }));
  return (
    <Pressable onPress={onPress} hitSlop={6} style={styles.rankHit}>
      <Animated.View style={[styles.rankDot, dot]}>
        <Animated.Text style={[styles.rankLabel, label]}>{rank}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  title: { fontFamily: "Fraunces-Bold", color: CREAM },
  chips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingLeft: 9,
    paddingRight: 12,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  chipsText: { fontFamily: "Instrument-SemiBold", fontSize: 14, color: GOLD },
  table: { flex: 1, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  rim: {
    position: "absolute",
    left: 12,
    right: 12,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(232,199,102,0.35)",
    boxShadow: "inset 0px 0px 60px rgba(0,0,0,0.4)",
  },
  kicker: {
    fontFamily: "Instrument-SemiBold",
    letterSpacing: 1.4,
    color: "rgba(232,199,102,0.75)",
  },
  caption: { alignSelf: "stretch", alignItems: "center", gap: 2, paddingHorizontal: 40 },
  captionBody: { alignItems: "center" },
  drew: { fontFamily: "Instrument-Medium", color: "rgba(246,235,211,0.6)" },
  pick: { fontFamily: "Fraunces-Bold", color: GOLD, textAlign: "center" },
  meaning: {
    fontFamily: "Instrument-Regular",
    color: "rgba(246,235,211,0.7)",
    textAlign: "center",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    boxShadow: "0px 8px 18px rgba(0,0,0,0.35)",
  },
  index: { position: "absolute", alignItems: "center", gap: 1 },
  serif: { fontFamily: "Fraunces-Bold", includeFontPadding: false },
  panel: {
    position: "absolute",
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  bottom: { paddingHorizontal: 16, gap: 16 },
  strip: { flexDirection: "row", justifyContent: "space-between" },
  rankHit: { flex: 1, alignItems: "center" },
  rankDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  rankLabel: {
    fontFamily: "Instrument-SemiBold",
    fontSize: 12,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  shuffle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  shuffleText: { fontFamily: "Instrument-SemiBold", color: GOLD },
  pressed: { opacity: 0.7 },
});

import type { SceneFont } from "@/features/scenes/fonts";
import { SceneScreen, useScene } from "@/features/scenes/kit";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
import Svg, { Path, Rect } from "react-native-svg";

type Kind = "bank" | "whale" | "metro" | "pass" | "coffee" | "gym";

interface WalletCard {
  kind: Kind;
  name: string;
  detail: string;
  footer: string;
  colors: [string, string, ...string[]];
  ink: string;
}

// Dates are relative to today, so the wallet never looks stale.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (offset: number) => {
  const d = new Date(Date.now() + offset * 86_400_000);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
};
const when = (daysAgo: number) =>
  daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : dayLabel(-daysAgo);
const expiry = `03/${(new Date().getFullYear() + 1) % 100}`;

const CARDS: WalletCard[] = [
  {
    kind: "bank",
    name: "Galaxy Bank",
    detail: "Platinum Credit",
    footer: "•••• 4821",
    colors: ["#2C2C2E", "#5A5A5E", "#1C1C1E"],
    ink: "#E5E5EA",
  },
  {
    kind: "whale",
    name: "Blue Whale",
    detail: "Travel Rewards",
    footer: "•••• 0937",
    colors: ["#1D4ED8", "#0EA5E9"],
    ink: "#FFFFFF",
  },
  {
    kind: "metro",
    name: "City Transit",
    detail: "Balance $86.50",
    footer: "Metro · Bus",
    colors: ["#059669", "#A3E635"],
    ink: "#06281D",
  },
  {
    kind: "pass",
    name: "Boarding Pass",
    detail: `SFO → PVG · ${dayLabel(4).toUpperCase()}`,
    footer: "Gate G92 · Seat 34K",
    colors: ["#FFFFFF", "#F3F4F6"],
    ink: "#111827",
  },
  {
    kind: "coffee",
    name: "Daylight Coffee",
    detail: "Stamp card · 2 to go",
    footer: "8 / 10",
    colors: ["#8B5E3C", "#C69C72"],
    ink: "#FFF7ED",
  },
  {
    kind: "gym",
    name: "PULSE Fitness",
    detail: `Annual · Valid thru ${expiry}`,
    footer: "PRO",
    colors: ["#111111", "#2A0A2A"],
    ink: "#FFFFFF",
  },
];

const ACTIVITY = [
  { name: "Daylight Coffee", card: 0, daysAgo: 0, amount: -5.4 },
  { name: "Transit reload", card: 1, daysAgo: 1, amount: -40 },
  { name: "City Parking", card: 0, daysAgo: 3, amount: -36 },
  { name: "Corner Books", card: 1, daysAgo: 4, amount: 18.99 },
  { name: "PULSE Fitness", card: 1, daysAgo: 14, amount: -49 },
  { name: "Seabreeze Bakery", card: 0, daysAgo: 15, amount: -12.75 },
];

const money = (n: number) => `${n < 0 ? "−" : "+"}$${Math.abs(n).toFixed(2)}`;

// ---------- card faces ----------

function barcode(pattern: string) {
  let x = 0;
  return [...pattern].map((digit) => {
    const bar = { x, w: Number(digit) * 1.4 };
    x += bar.w + 2;
    return bar;
  });
}
const BARS = barcode("3121311221312113121321123121");

function Chip({ top }: { top: number }) {
  return (
    <LinearGradient
      colors={["#F7E3A1", "#C9A24B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.chip, { top }]}
    />
  );
}

function CardBody({ card, height }: { card: WalletCard; height: number }) {
  const mid = height * 0.36;
  switch (card.kind) {
    case "whale":
      return (
        <>
          <Chip top={mid} />
          <Svg width={160} height={80} viewBox="0 0 120 60" style={styles.whale}>
            <Path
              d="M10 40C30 10 80 10 100 30c8-8 16-12 18-20 0 14-6 24-14 28C90 56 30 58 10 40z"
              fill="#fff"
              opacity={0.18}
            />
          </Svg>
        </>
      );
    case "metro":
      return (
        <View style={[styles.lines, { top: mid + 6 }]}>
          {["#E11D48", "#F59E0B", "#2563EB", "#7C3AED"].map((c) => (
            <View key={c} style={[styles.line, { backgroundColor: c }]} />
          ))}
        </View>
      );
    case "pass":
      return (
        <>
          <View style={[styles.route, { top: mid - 12 }]}>
            <View>
              <Text style={styles.airport}>SFO</Text>
              <Text style={styles.city}>San Francisco</Text>
            </View>
            <Svg width={28} height={28} viewBox="0 0 24 24">
              <Path
                d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5z"
                fill="#2563EB"
                transform="rotate(90 12 12)"
              />
            </Svg>
            <View style={styles.alignEnd}>
              <Text style={styles.airport}>PVG</Text>
              <Text style={styles.city}>Shanghai</Text>
            </View>
          </View>
          <Svg width={124} height={28} style={styles.barcode}>
            {BARS.map((bar) => (
              <Rect key={bar.x} x={bar.x} width={bar.w} height={28} fill="#111827" />
            ))}
          </Svg>
        </>
      );
    case "coffee":
      return (
        <View style={[styles.stamps, { top: mid - 4 }]}>
          {Array.from({ length: 10 }, (_, k) => (
            <View key={k} style={styles.stampCell}>
              <View style={[styles.stamp, k < 8 ? styles.stampOn : styles.stampOff]}>
                {k < 8 && <View style={styles.stampDot} />}
              </View>
            </View>
          ))}
        </View>
      );
    case "gym":
      return (
        <>
          <LinearGradient colors={["#FF2E88", "#7C3AED"]} style={styles.slash} />
          <Chip top={mid} />
        </>
      );
    default:
      return <Chip top={mid} />;
  }
}

type CardProps = {
  card: WalletCard;
  index: number;
  width: number;
  height: number;
  onSelect: (index: number) => void;
};
const CardFace = React.memo(function CardFace({ card, index, width, height, onSelect }: CardProps) {
  // A Tap gesture fails once the finger moves 10 pt, so swiping the stack never selects a card.
  const tap = React.useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(10)
        .runOnJS(true)
        .onEnd((_event, success) => {
          if (success) onSelect(index);
        }),
    [index, onSelect]
  );
  const big = card.kind === "gym" || card.kind === "coffee";
  return (
    <GestureDetector gesture={tap}>
      <View
        accessibilityRole="button"
        accessibilityLabel={card.name}
        style={[styles.card, { width, height }]}
      >
        <LinearGradient
          colors={card.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <CardBody card={card} height={height} />
        <View style={styles.cardTop}>
          <Text style={[styles.cardName, { color: card.ink }]}>{card.name}</Text>
          <Text style={[styles.cardDetail, { color: card.ink }]} numberOfLines={1}>
            {card.detail}
          </Text>
        </View>
        <Text
          style={[
            styles.cardFooter,
            big && styles.cardFooterBig,
            card.kind === "pass" && styles.cardFooterSmall,
            { color: card.ink },
          ]}
        >
          {card.footer}
        </Text>
      </View>
    </GestureDetector>
  );
});

// ---------- the stack ----------

const TOP = 20; // where the current card sits
const PEEK = 52; // visible top edge of each card further down
const GAP = 18;

/** Card offset from the top of the stack for a given relative progress. */
const stackY = (value: number, cardH: number) => {
  "worklet";
  if (value <= 0) return TOP + value * 16; // passed cards tuck in behind, a little higher
  if (value <= 1) return TOP + value * (cardH + GAP); // the next card slides up from below
  return TOP + cardH + GAP + (value - 1) * PEEK; // the rest only show their top edge
};

type ActivityProps = { progress: SharedValue<number>; top: number; cardH: number; bottom: number };
function Activity({ progress, top, cardH, bottom }: ActivityProps) {
  // The list sits right under the last card, so it rises as the stack gets shorter.
  const followStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: stackY(CARDS.length - 1 - progress.value, cardH) + cardH + 28 }],
  }));
  return (
    <View style={[styles.activityClip, { top, bottom }]}>
      <Animated.View style={followStyle}>
        <View style={styles.activityHead}>
          <Text style={styles.activityTitle}>Latest Transactions</Text>
          <Text style={styles.link}>See All</Text>
        </View>
        <View style={styles.list}>
          {ACTIVITY.map((row, i) => (
            <View key={row.name} style={[styles.row, i > 0 && styles.rowRule]}>
              <LinearGradient
                colors={CARDS[row.card].colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.thumb}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{row.name}</Text>
                <Text style={styles.rowMeta}>
                  {CARDS[row.card].name} · {when(row.daysAgo)}
                </Text>
              </View>
              <Text style={[styles.amount, row.amount > 0 && styles.refund]}>
                {money(row.amount)}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
      <LinearGradient colors={["#0B0B0D00", "#0B0B0D"]} style={styles.fade} />
    </View>
  );
}

function WalletStack() {
  const { width, height, insets } = useScene();
  const carousel = React.useRef<CarouselRef>(null);
  const progress = useSharedValue(0);
  const [direction, setDirection] = React.useState<"forward" | "backward">("forward");

  const cardW = width - 40;
  const cardH = Math.round(cardW * 0.63);
  const stackTop = insets.top + 60;
  const stackH = height - insets.bottom - stackTop;

  const itemAnimation = React.useCallback<CarouselItemAnimation>(
    (value) => {
      "worklet";
      return {
        transform: [
          { translateY: stackY(value, cardH) },
          { scale: value < 0 ? Math.max(0.84, 1 + value * 0.08) : 1 },
        ],
        transformOrigin: "center top",
        opacity: interpolate(value, [-2, -1, -0.7], [0, 0.6, 1], Extrapolation.CLAMP),
        zIndex: 100 + Math.round(value * 10),
      };
    },
    [cardH]
  );

  const select = React.useCallback((index: number) => carousel.current?.scrollTo({ index }), []);
  const renderItem = React.useCallback<CarouselRenderItem<WalletCard>>(
    ({ item, index }) => (
      <View style={styles.slot}>
        <CardFace card={item} index={index} width={cardW} height={cardH} onSelect={select} />
      </View>
    ),
    [cardW, cardH, select]
  );

  // Autoplay deals the cards to the last one, then folds them back.
  const onSnapToItem = React.useCallback((i: number) => {
    if (i === CARDS.length - 1) setDirection("backward");
    if (i === 0) setDirection("forward");
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.header, { marginTop: insets.top + 8 }]}>
        <Text style={styles.title}>Wallet</Text>
        <View style={styles.plus}>
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path d="M9 2v14M2 9h14" stroke="#0A84FF" strokeWidth={2.4} strokeLinecap="round" />
          </Svg>
        </View>
      </View>
      <Activity progress={progress} top={stackTop} cardH={cardH} bottom={insets.bottom} />
      <Carousel
        ref={carousel}
        data={CARDS}
        orientation="vertical"
        itemSize={120}
        autoplay
        autoplayInterval={2200}
        autoplayDirection={direction}
        style={{ position: "absolute", top: stackTop, width, height: stackH }}
        progress={progress}
        animation={{ type: "timing", duration: 650, easing: Easing.out(Easing.poly(4)) }}
        itemAnimation={itemAnimation}
        onSnapToItem={onSnapToItem}
        renderItem={renderItem}
      />
    </View>
  );
}

const FONTS: SceneFont[] = [
  "Bricolage-Bold",
  "Instrument-Regular",
  "Instrument-Medium",
  "Instrument-SemiBold",
  "JetBrainsMono-Medium",
];

export default function Scene() {
  return (
    <SceneScreen background="#0B0B0D" statusBar="light" fonts={FONTS}>
      <WalletStack />
    </SceneScreen>
  );
}

const font = (fontFamily: SceneFont, fontSize: number, color: string, lineHeight?: number) => ({
  fontFamily,
  fontSize,
  color,
  lineHeight,
});

const center = { alignItems: "center", justifyContent: "center" } as const;
const spread = { flexDirection: "row", justifyContent: "space-between" } as const;
const inset = { position: "absolute", left: 20, right: 20 } as const; // 20 pt card padding

const styles = StyleSheet.create({
  header: { ...spread, height: 48, alignItems: "center", paddingHorizontal: 20 },
  title: font("Bricolage-Bold", 34, "#FFFFFF", 40),
  plus: { ...center, width: 36, height: 36, borderRadius: 18, backgroundColor: "#1C1C1E" },
  slot: { flex: 1, alignItems: "center" },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 18,
    boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.45)",
  },
  cardTop: { ...spread, alignItems: "baseline", gap: 8 },
  cardName: font("Bricolage-Bold", 18, "#fff", 22),
  cardDetail: { ...font("Instrument-Regular", 12, "#fff", 16), opacity: 0.8, flexShrink: 1 },
  cardFooter: {
    ...font("JetBrainsMono-Medium", 15, "#fff", 18),
    position: "absolute",
    left: 20,
    bottom: 18,
    letterSpacing: 1.5,
  },
  cardFooterBig: { fontFamily: "Bricolage-Bold", fontSize: 24, lineHeight: 28, letterSpacing: 2 },
  cardFooterSmall: {
    fontFamily: "Instrument-Medium",
    fontSize: 12.5,
    letterSpacing: 0,
    opacity: 0.7,
  },
  chip: {
    position: "absolute",
    left: 20,
    width: 44,
    height: 34,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#00000026",
  },
  whale: { position: "absolute", right: -10, bottom: 22 },
  lines: { ...inset, gap: 7 },
  line: { height: 6, borderRadius: 3, opacity: 0.85 },
  route: { ...inset, ...spread, alignItems: "center" },
  airport: font("Bricolage-Bold", 36, "#111827", 40),
  city: font("Instrument-Regular", 11.5, "#6B7280", 16),
  alignEnd: { alignItems: "flex-end" },
  barcode: { position: "absolute", right: 20, bottom: 16 },
  stamps: { ...inset, flexDirection: "row", flexWrap: "wrap", rowGap: 10 },
  stampCell: { width: "20%", alignItems: "center" },
  stamp: { ...center, width: 32, height: 32, borderRadius: 16 },
  stampOn: { backgroundColor: "#F59E0B" },
  stampOff: { borderWidth: 2, borderStyle: "dashed", borderColor: "#FFF7ED99" },
  stampDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFF7ED" },
  slash: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 140,
    height: 340,
    transform: [{ rotate: "28deg" }],
    opacity: 0.85,
  },
  fade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 40, pointerEvents: "none" },
  activityClip: { ...StyleSheet.absoluteFillObject, overflow: "hidden", paddingHorizontal: 20 },
  activityHead: { ...spread, alignItems: "baseline", marginBottom: 10 },
  activityTitle: font("Instrument-SemiBold", 20, "#FFFFFF", 26),
  link: font("Instrument-Medium", 15, "#0A84FF", 20),
  list: { borderRadius: 16, backgroundColor: "#1C1C1E", paddingHorizontal: 16 },
  row: { height: 64, flexDirection: "row", alignItems: "center", gap: 12 },
  rowRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#38383A" },
  thumb: { width: 40, height: 26, borderRadius: 5 },
  rowText: { flex: 1, gap: 2 },
  rowName: font("Instrument-Medium", 15.5, "#FFFFFF", 20),
  rowMeta: font("Instrument-Regular", 13, "#8E8E93", 17),
  amount: font("Instrument-Medium", 15.5, "#FFFFFF", 20),
  refund: { color: "#30D158" },
});

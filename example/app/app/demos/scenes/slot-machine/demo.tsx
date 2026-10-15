import { SceneScreen, useScene } from "@/features/scenes/kit";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  Carousel,
  type CarouselAnimation,
  type CarouselItemAnimation,
  type CarouselRef,
  type CarouselRenderItem,
} from "react-native-reanimated-carousel";
import Svg, { Circle, Defs, Path, Stop } from "react-native-svg";
import { LinearGradient as SvgLinearGradient } from "react-native-svg";

type Kind = "seven" | "bar" | "star" | "diamond" | "heart" | "club" | "dollar" | "spade";

// Each reel is two shuffled runs of the eight symbols.
const REELS = [
  "heart spade diamond dollar club bar seven star star diamond bar dollar spade seven club heart",
  "diamond bar seven heart club spade dollar star seven star diamond bar dollar club heart spade",
  "seven club diamond bar spade dollar heart star bar seven diamond dollar club heart spade star",
].map((reel) => reel.split(" ") as Kind[]);

const SPIN_COST = 5;
const START_CREDITS = 100;
const PAYS: { label: string; kinds: Kind[]; win: number }[] = [
  { label: "Jackpot", kinds: ["seven", "seven", "seven"], win: 300 },
  { label: "Any three", kinds: ["star", "star", "star"], win: 100 },
  { label: "Any pair", kinds: ["diamond", "diamond"], win: 10 },
];
const RESULT_TEXT: Record<number, string> = {
  0: "So close. Try again.",
  10: "Two of a kind! +10",
  100: "Three of a kind! +100",
  300: "JACKPOT! +300",
};

// Same easing on every reel, longer durations so they stop left to right.
const REEL_ANIMATIONS: CarouselAnimation[] = [0, 1, 2].map((k) => ({
  type: "timing",
  duration: 1500 + k * 550,
  easing: Easing.bezier(0.12, 0.75, 0.2, 1),
}));

// Card suits and the star in a 100 x 100 box, each with a top-to-bottom gradient.
const GLYPHS: Partial<Record<Kind, { d: string; colors: [string, string] }>> = {
  heart: {
    d: "M50 90C47 87 6 62 6 33C6 18 17 8 30 8C39 8 46 13 50 21C54 13 61 8 70 8C83 8 94 18 94 33C94 62 53 87 50 90Z",
    colors: ["#F0559A", "#C81E64"],
  },
  diamond: { d: "M50 4L81 50L50 96L19 50Z", colors: ["#5B9BFF", "#1D4ED8"] },
  spade: {
    d: "M50 4C60 22 93 38 93 60C93 74 82 82 70 82C63 82 57 79 53 73C54 84 58 91 66 96H34C42 91 46 84 47 73C43 79 37 82 30 82C18 82 7 74 7 60C7 38 40 22 50 4Z",
    colors: ["#3A3A3A", "#0A0A0A"],
  },
  club: { d: "M46 60C46 78 42 88 33 96H67C58 88 54 78 54 60Z", colors: ["#22A04E", "#0F6A32"] },
  star: {
    d: "M50 7L61.5 38.2L94.7 39.5L68.5 60L77.6 92L50 73.5L22.4 92L31.5 60L5.3 39.5L38.5 38.2Z",
    colors: ["#FFC824", "#D99400"],
  },
};

function payout([a, b, c]: Kind[]) {
  if (a === b && b === c) return a === "seven" ? 300 : 100;
  if (a === b || b === c || a === c) return 10;
  return 0;
}

export default function Scene() {
  return (
    <SceneScreen
      background="#14031F"
      statusBar="light"
      fonts={["Bricolage-Bold", "JetBrainsMono-Regular", "JetBrainsMono-Medium"]}
    >
      <SlotMachine />
    </SceneScreen>
  );
}

function SlotMachine() {
  const { width, height, insets } = useScene();
  // The cabinet fills the width (14 pt side padding, 10 pt between reels);
  // on short screens the reels shrink so the controls still fit.
  const cabW = width - 40;
  const reelW = (cabW - 2 * (9 + 14 + 10)) / 3;
  const room = height - insets.top - insets.bottom - 430;
  const itemSize = Math.round(Math.min(reelW * 0.94, room / 3.3));
  const reelH = Math.round(itemSize * 3.3);

  const reels = [
    React.useRef<CarouselRef>(null),
    React.useRef<CarouselRef>(null),
    React.useRef<CarouselRef>(null),
  ];
  const round = React.useRef({ active: false, stopped: 0, got: REELS.map((r) => r[0]) });
  const [spinning, setSpinning] = React.useState(false);
  const [credits, setCredits] = React.useState(START_CREDITS);
  const [win, setWin] = React.useState(0);
  const [message, setMessage] = React.useState("Feeling lucky? Hit SPIN.");

  const spin = () => {
    if (round.current.active) return;
    round.current = { ...round.current, active: true, stopped: 0 };
    setCredits((c) => (c < SPIN_COST ? START_CREDITS : c) - SPIN_COST);
    setSpinning(true);
    setWin(0);
    setMessage("Spinning…");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reels.forEach((ref, k) => {
      ref.current?.next({ count: 24 + Math.floor(Math.random() * 16) + k * 6 });
    });
  };

  // Stable, so the reels' pan gestures are not rebuilt on every render.
  const onReelStop = React.useCallback((k: number, index: number) => {
    const r = round.current;
    r.got[k] = REELS[k][index];
    if (!r.active) return; // a reel dragged by hand
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (++r.stopped < 3) return;
    r.active = false;
    const amount = payout(r.got);
    if (amount) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSpinning(false);
    setWin(amount);
    setCredits((c) => c + amount);
    setMessage(RESULT_TEXT[amount]);
  }, []);

  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom + 8 }}>
      <LinearGradient
        colors={["#4A1275", "#2B0A47", "#14031F"]}
        locations={[0, 0.35, 0.8]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topBar}>
        <RoundIcon d="M14.5 5.5L8 12l6.5 6.5" />
        <MarqueeLights fast={spinning} />
        <RoundIcon d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
      </View>

      <View style={styles.column}>
        <View>
          <Text style={[styles.title, NEON, styles.titleHalo]}>LUCKY 7</Text>
          <Text style={[styles.title, NEON]}>LUCKY 7</Text>
        </View>

        <LinearGradient
          colors={["#F8DA7E", "#E9B949", "#B9832A"]}
          style={[styles.cabinet, { width: cabW }]}
        >
          <LinearGradient colors={["#9B111E", "#5E0A12"]} style={styles.cabinetInner}>
            {reels.map((ref, k) => (
              <Reel
                key={k}
                reel={k}
                reelRef={ref}
                width={reelW}
                height={reelH}
                itemSize={itemSize}
                scrollEnabled={!spinning}
                onStop={onReelStop}
              />
            ))}
            <View style={styles.payline} />
          </LinearGradient>
        </LinearGradient>

        <View style={{ width: cabW, alignItems: "center", gap: 16 }}>
          <SwapText text={message} />
          <View style={[styles.row, { alignSelf: "stretch", gap: 12 }]}>
            <Meter label="CREDITS" value={credits} />
            <SpinButton onPress={spin} />
            <Meter label="WIN" value={win} />
          </View>
        </View>

        <Paytable width={cabW} />
      </View>
    </View>
  );
}

const Reel = React.memo(function Reel(props: {
  reel: number;
  reelRef: React.RefObject<CarouselRef | null>;
  width: number;
  height: number;
  itemSize: number;
  scrollEnabled: boolean;
  onStop: (reel: number, index: number) => void;
}) {
  const { reel, reelRef, width, height, itemSize, scrollEnabled, onStop } = props;
  // Symbols ride a cylinder, 24° apart, and vanish once they turn edge-on.
  const radius = itemSize * 2.39;
  const itemAnimation = React.useCallback<CarouselItemAnimation>(
    (value) => {
      "worklet";
      const theta = Math.max(-90, Math.min(90, value * 24));
      return {
        transform: [
          { perspective: 600 },
          { translateY: (height - itemSize) / 2 + radius * Math.sin((theta * Math.PI) / 180) },
          { rotateX: `${-theta}deg` },
        ],
      };
    },
    [height, itemSize, radius]
  );
  const onSnapToItem = React.useCallback((index: number) => onStop(reel, index), [onStop, reel]);
  const renderItem = React.useCallback<CarouselRenderItem<Kind>>(
    ({ item }) => (
      <View style={styles.center}>
        <SlotSymbol kind={item} size={itemSize * 0.54} />
      </View>
    ),
    [itemSize]
  );

  return (
    <View style={[styles.reel, { width, height }]}>
      <LinearGradient
        colors={["#E9E4D8", "#FFFDF6", "#FFFDF6", "#E2DCCD"]}
        locations={[0, 0.4, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Carousel
        ref={reelRef}
        orientation="vertical"
        loop
        data={REELS[reel]}
        itemSize={itemSize}
        style={{ width, height }}
        animation={REEL_ANIMATIONS[reel]}
        scrollEnabled={scrollEnabled}
        itemAnimation={itemAnimation}
        onSnapToItem={onSnapToItem}
        renderItem={renderItem}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
        locations={[0, 0.3, 0.7, 1]}
        style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
      />
    </View>
  );
});

const SlotSymbol = React.memo(function SlotSymbol({ kind, size }: { kind: Kind; size: number }) {
  if (kind === "seven" || kind === "dollar") {
    const [char, color, shade] =
      kind === "seven" ? ["7", "#E11D48", "#7F1D1D"] : ["$", "#B45309", "#6B2F06"];
    const font = { fontSize: size * 1.1, lineHeight: size * 1.2 };
    const offset = size * 0.04;
    return (
      <View>
        <Text
          style={[
            styles.glyph,
            font,
            { position: "absolute", left: offset, top: offset, color: shade },
          ]}
        >
          {char}
        </Text>
        <Text style={[styles.glyph, font, { color }]}>{char}</Text>
      </View>
    );
  }
  if (kind === "bar") {
    const badge = {
      paddingVertical: size * 0.14,
      paddingHorizontal: size * 0.2,
      borderRadius: size * 0.12,
    };
    return (
      <View style={[styles.bar, badge, { borderWidth: Math.max(1.5, size * 0.04) }]}>
        <Text
          style={[
            styles.glyph,
            { fontSize: size * 0.4, letterSpacing: size * 0.025, color: "#fff" },
          ]}
        >
          BAR
        </Text>
      </View>
    );
  }
  const { d, colors } = GLYPHS[kind]!;
  const fill = `url(#sl-${kind})`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <SvgLinearGradient id={`sl-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="1" stopColor={colors[1]} />
        </SvgLinearGradient>
      </Defs>
      {kind === "club" && (
        <>
          <Circle cx="50" cy="27" r="19" fill={colors[0]} />
          <Circle cx="27" cy="56" r="19" fill={fill} />
          <Circle cx="73" cy="56" r="19" fill={fill} />
          <Circle cx="50" cy="50" r="12" fill={fill} />
        </>
      )}
      <Path d={d} fill={fill} />
    </Svg>
  );
});

function RoundIcon({ d }: { d: string }) {
  return (
    <View style={styles.roundIcon}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d={d} stroke="#F3E8FF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

// Bulbs blink in two alternating sets, four times faster while the reels spin.
function MarqueeLights({ fast }: { fast: boolean }) {
  const tick = useSharedValue(0);
  React.useEffect(() => {
    tick.value = 0;
    const duration = fast ? 300 : 1200;
    tick.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1);
    return () => cancelAnimation(tick);
  }, [fast, tick]);
  const even = useAnimatedStyle(() => ({ opacity: tick.value < 0.5 ? 1 : 0.2 }));
  const odd = useAnimatedStyle(() => ({ opacity: tick.value < 0.5 ? 0.2 : 1 }));

  return (
    <View style={[styles.row, { gap: 11 }]}>
      {Array.from({ length: 12 }, (_, i) => (
        <Animated.View key={i} style={[styles.bulb, i % 2 ? odd : even]} />
      ))}
    </View>
  );
}

// Fades and lifts the message in whenever it changes.
function SwapText({ text }: { text: string }) {
  const shown = useSharedValue(1);
  React.useEffect(() => {
    shown.value = 0;
    shown.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) });
  }, [text, shown]);
  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * 6 }],
  }));
  return <Animated.Text style={[styles.message, style]}>{text}</Animated.Text>;
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.meter}>
      <Text style={styles.caption}>{label}</Text>
      <Text style={styles.meterValue}>{value}</Text>
    </View>
  );
}

function SpinButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Spin">
      {({ pressed }) => (
        <View style={styles.spin}>
          <View style={styles.spinLip} />
          <LinearGradient
            colors={["#FF4D6D", "#C9184A"]}
            style={[styles.spinFace, { transform: [{ translateY: pressed ? 4 : 0 }] }]}
          >
            <Text style={styles.spinText}>SPIN</Text>
          </LinearGradient>
        </View>
      )}
    </Pressable>
  );
}

function Paytable({ width }: { width: number }) {
  return (
    <View style={[styles.paytable, { width }]}>
      <View style={styles.row}>
        <Text style={styles.caption}>PAYOUTS</Text>
        <Text style={styles.caption}>{SPIN_COST} CREDITS PER SPIN</Text>
      </View>
      <View style={[styles.row, { gap: 8 }]}>
        {PAYS.map((pay) => (
          <View key={pay.label} style={styles.payCell}>
            <View style={[styles.row, { height: 20, gap: 2 }]}>
              {pay.kinds.map((kind, i) => (
                <SlotSymbol key={i} kind={kind} size={18} />
              ))}
            </View>
            <Text style={styles.payWin}>{pay.win}</Text>
            <Text style={styles.payLabel}>{pay.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const GOLD = "#FFE27A";
const LILAC = "#C9B6E4";
const row = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
} as const;

// Pink neon glow for the title; the halo copy behind it widens the radius to 26.
const NEON = {
  textShadowColor: "#FF4FD8",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
};

const styles = StyleSheet.create({
  topBar: { ...row, height: 52, paddingHorizontal: 16 },
  column: { flex: 1, alignItems: "center", justifyContent: "space-evenly" },
  row,
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  roundIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  bulb: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: GOLD,
    boxShadow: `0 0 8px ${GOLD}`,
  },
  title: {
    fontFamily: "Bricolage-Bold",
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 2.8,
    color: GOLD,
    textAlign: "center",
  },
  titleHalo: { position: "absolute", left: 0, right: 0, textShadowRadius: 26 },
  cabinet: { padding: 6, borderRadius: 24, boxShadow: "0 24px 40px -12px rgba(0,0,0,0.8)" },
  cabinetInner: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#8A6512",
  },
  reel: { borderRadius: 10, overflow: "hidden" },
  payline: {
    position: "absolute",
    left: 4,
    right: 4,
    top: "50%",
    height: 4,
    marginTop: -2,
    borderRadius: 2,
    backgroundColor: "rgba(255,226,122,0.7)",
    boxShadow: "0 0 10px #FFE27A",
    pointerEvents: "none",
  },
  glyph: { fontFamily: "Bricolage-Bold", textAlign: "center", includeFontPadding: false },
  bar: { backgroundColor: "#111111", borderColor: "#E9B949" },
  message: { fontFamily: "Bricolage-Bold", fontSize: 19, lineHeight: 24, color: GOLD },
  meter: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    backgroundColor: "#0E0217",
    borderWidth: 1,
    borderColor: "rgba(233,185,73,0.35)",
  },
  caption: { fontFamily: "JetBrainsMono-Medium", fontSize: 10, letterSpacing: 1.6, color: LILAC },
  meterValue: { fontFamily: "JetBrainsMono-Medium", fontSize: 22, lineHeight: 26, color: GOLD },
  spin: { width: 140, height: 64 },
  spinLip: {
    position: "absolute",
    top: 6,
    left: 0,
    right: 0,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#800F2F",
    boxShadow: "0 14px 24px rgba(0,0,0,0.5)",
  },
  spinFace: { height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  spinText: { fontFamily: "Bricolage-Bold", fontSize: 22, letterSpacing: 2.6, color: "#FFFFFF" },
  paytable: {
    padding: 14,
    gap: 10,
    borderRadius: 18,
    backgroundColor: "rgba(10,0,20,0.45)",
    borderWidth: 1,
    borderColor: "rgba(233,185,73,0.22)",
  },
  payCell: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  payWin: { fontFamily: "JetBrainsMono-Medium", fontSize: 15, lineHeight: 18, color: GOLD },
  payLabel: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, color: LILAC },
});

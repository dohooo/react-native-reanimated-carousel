import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SCENE_FONT_FILES, type SceneFont } from "./fonts";

/**
 * iPhone 17 Pro in points: 402 x 874 at 3x (1206 x 2622 px, 460 ppi),
 * portrait safe area 62 pt on top and 34 pt at the bottom.
 * The docs site renders each scene in an iframe of exactly this size and
 * draws the status bar, Dynamic Island and home indicator over it.
 */
export const IPHONE_17_PRO = {
  width: 402,
  height: 874,
  safeArea: { top: 62, bottom: 34, left: 0, right: 0 },
} as const;

/** Widest a scene gets on a desktop browser outside the docs frame. */
const WEB_MAX_WIDTH = 430;

export interface SceneInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SceneInfo {
  /** Width of the scene's screen in points. */
  width: number;
  /** Height of the scene's screen in points, including the safe areas. */
  height: number;
  /** Safe-area insets to keep content clear of the status bar and home indicator. */
  insets: SceneInsets;
  /** True when rendered inside the docs iPhone frame. */
  framed: boolean;
}

const SceneContext = React.createContext<SceneInfo>({
  width: IPHONE_17_PRO.width,
  height: IPHONE_17_PRO.height,
  insets: IPHONE_17_PRO.safeArea,
  framed: false,
});

export const useScene = () => React.useContext(SceneContext);

// The docs page adds `frame=iphone` to the iframe URL. Read it after mount so
// the static web build hydrates with the same markup it was rendered with.
function useFramed() {
  const [framed, setFramed] = React.useState(false);
  React.useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    setFramed(new URLSearchParams(window.location.search).get("frame") === "iphone");
  }, []);
  return framed;
}

function useMounted() {
  const [mounted, setMounted] = React.useState(Platform.OS !== "web");
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

interface SceneScreenProps {
  /** Screen background, also used behind the status bar. */
  background: string;
  /** Status bar content colour: "light" for dark scenes, "dark" for light ones. */
  statusBar?: "light" | "dark";
  /** Typefaces the scene uses, from `fonts.ts`. */
  fonts?: readonly SceneFont[];
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Full-screen container for a scene. Children render edge to edge; read
 * `useScene().insets` to keep text and controls inside the safe area.
 */
export function SceneScreen({
  background,
  statusBar = "dark",
  fonts = [],
  style,
  children,
}: SceneScreenProps) {
  const framed = useFramed();
  const mounted = useMounted();
  const safe = useSafeAreaInsets();
  const screen = useWindowDimensions();

  const fontMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const name of fonts) map[name] = SCENE_FONT_FILES[name];
    return map;
  }, [fonts.join(",")]);
  const [fontsLoaded, fontError] = useFonts(fontMap);

  const isWeb = Platform.OS === "web";
  const width = isWeb && !framed ? Math.min(screen.width, WEB_MAX_WIDTH) : screen.width;
  // The static web build is rendered with a 0 x 0 window. Hydration keeps the
  // server's inline styles, so leave the width unset until after mount.
  const screenWidth = mounted ? width : undefined;
  const insets = framed ? IPHONE_17_PRO.safeArea : safe;

  const info = React.useMemo<SceneInfo>(
    () => ({ width, height: screen.height, insets, framed }),
    [width, screen.height, insets.top, insets.bottom, insets.left, insets.right, framed]
  );

  const ready = mounted && (fontsLoaded || !!fontError);

  // Tell the docs page the first frame is up, so it can swap its poster for the live scene.
  React.useEffect(() => {
    if (!ready || !framed || typeof window === "undefined" || window.parent === window) return;
    const id = setTimeout(() => {
      window.parent.postMessage({ type: "sceneReady", path: window.location.pathname }, "*");
    }, 300);
    return () => clearTimeout(id);
  }, [ready, framed]);

  return (
    <View style={[styles.outer, { backgroundColor: isWeb && !framed ? "#000" : background }]}>
      <StatusBar style={statusBar} />
      <View style={[styles.screen, { width: screenWidth, backgroundColor: background }, style]}>
        {ready ? <SceneContext.Provider value={info}>{children}</SceneContext.Provider> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: "center",
  },
  screen: {
    flex: 1,
    overflow: "hidden",
  },
});

import "expo-dev-client";

import { useEffect, useState } from "react";
import { I18nManager, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TamaguiProvider, XStack, YStack } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { HeaderRight } from "@/components/HeaderRight";
import { IS_WEB } from "@/constants/platform";
import { MAX_WIDTH } from "@/constants/sizes";
import { useInDoc } from "@/hooks/useInDoc";
import { CaptureProvider } from "@/store/CaptureProvider";
import { useWebContext } from "@/store/WebProvider";
import { Link } from "expo-router";
import Stack from "expo-router/stack";
import { useReducedMotion } from "react-native-reanimated";
import { routes } from "./routes";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const webHeaderShown = !useWebContext()?.page;
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  const { inDoc } = useInDoc();

  const backgroundColor = inDoc
    ? tamaguiConfig.themes.dark.background.val
    : tamaguiConfig.themes.light.background.val;

  const reduceMotion = useReducedMotion();

  // post message to parent doc
  useEffect(() => {
    if (!inDoc) {
      return;
    }

    window.parent.postMessage(
      {
        type: "reduceMotion",
        reduceMotion,
      },
      "*"
    );
  }, [reduceMotion]);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={inDoc ? "dark" : "light"}>
      <Providers>
        <XStack flex={1} justifyContent="center" backgroundColor={backgroundColor}>
          <YStack minWidth={IS_WEB ? MAX_WIDTH : "100%"} height={"100%"}>
            {IS_WEB && !inDoc && reduceMotion && (
              <XStack paddingHorizontal={"$2"} width={MAX_WIDTH}>
                <Text
                  style={{
                    color: "red",
                    textAlign: "center",
                    opacity: 0.75,
                    fontSize: 12,
                  }}
                >
                  It looks like reduced motion is turned on in your system preferences. Some of the
                  animations may be skipped.{" "}
                  <Link
                    target="_blank"
                    style={{ textDecorationLine: "underline" }}
                    href={
                      "https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility/#reduced-motion-in-animations"
                    }
                  >
                    Learn more
                  </Link>
                </Text>
              </XStack>
            )}
            <Stack
              initialRouteName="index"
              screenOptions={{
                headerShown: !inDoc && webHeaderShown,
                contentStyle: {
                  flex: 1,
                  backgroundColor,
                },
                headerRight: ({ tintColor }) => (
                  <HeaderRight tintColor={tintColor} isRTL={isRTL} setIsRTL={setIsRTL} />
                ),
              }}
            >
              <Stack.Screen name="index" />
              {routes
                .flatMap((item) => item.demos.map((demo) => ({ ...demo, kind: item.kind })))
                .map((item) => (
                  <Stack.Screen
                    key={item.name}
                    name={`demos/${item.kind}/${item.name}/index`}
                    options={{
                      title: item.title,
                    }}
                  />
                ))}
            </Stack>
          </YStack>
        </XStack>
      </Providers>
    </TamaguiProvider>
  );
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <CaptureProvider>{children}</CaptureProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

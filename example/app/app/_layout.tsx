import { useEffect, useState } from "react";
import { I18nManager, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import Stack from "expo-router/stack";
import { useWebContext } from "@/store/WebProvider";
import {
  CustomAnimationsDemos,
  ExperimentDemos,
  LayoutsDemos,
} from "./demos/routes";
import { CaptureProvider } from "@/store/CaptureProvider";
import { HeaderRight } from "@/components/HeaderRight";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "/",
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
  const headerShown = !useWebContext()?.page;
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={"light"}>
      <View style={{ flex: 1 }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={DefaultTheme}>
            <CaptureProvider>
              <Stack
                initialRouteName="/"
                screenOptions={{
                  headerShown,
                  contentStyle: {
                    flex: 1,
                  },
                  headerRight: ({ tintColor }) => (
                    <HeaderRight
                      tintColor={tintColor}
                      isRTL={isRTL}
                      setIsRTL={setIsRTL}
                    />
                  ),
                }}
              >
                <Stack.Screen name="index" />
                {[
                  ...LayoutsDemos,
                  ...CustomAnimationsDemos,
                  ...ExperimentDemos,
                ].map((item) => (
                  <Stack.Screen
                    key={item.name}
                    name={`demos/${item.name}/index`}
                    options={{
                      title: item.title,
                    }}
                  />
                ))}
              </Stack>
            </CaptureProvider>
          </ThemeProvider>
        </GestureHandlerRootView>
      </View>
    </TamaguiProvider>
  );
}

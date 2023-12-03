import React, { useMemo } from "react";
import { I18nManager, Text, View, Platform } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Updates from "expo-updates";

import { QRCode } from "../components/QRCode";
import Home, { CustomAnimations, LayoutsPage, ExperimentPage } from "../Home";
import { isWeb } from "../utils";
import { useColor } from "../hooks/useColor";
import { useWebContext } from "../store/WebProvider";

const Restart = () => {
  if (Platform.OS === "web")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window.location.reload();
  else
    Updates.reloadAsync();
};

const Stack = createStackNavigator<any>();

export const RootNavigator = () => {
  const headerShown = !useWebContext()?.page
  const { isDark, colors } = useColor()
  const [isRTL, setIsRTL] = React.useState(I18nManager.isRTL);

  const theme = useMemo(() => {
    const { background, text } = colors
    DefaultTheme.colors = {
      ...DefaultTheme.colors,
      card: background,
      border: background,
      background,
      text,
    };

    return { ...DefaultTheme };
  }, [isDark, colors]);


  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          cardStyle: {
            flex: 1,
          },
          headerShown,
          headerRight: ({ tintColor }: { tintColor: string }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {isWeb && (
                <>
                  <QRCode tintColor={tintColor} />
                  <Text style={{ color: tintColor }}>
                    {" "}
                    |{" "}
                  </Text>
                </>
              )}
              <TouchableWithoutFeedback
                onPress={() => {
                  I18nManager.forceRTL(!isRTL);
                  setIsRTL(!isRTL);
                  Restart();
                }}
              >
                <Text style={{ color: tintColor, marginRight: 12 }}>
                  {isRTL ? "LTR" : "RTL"}
                </Text>
              </TouchableWithoutFeedback>
            </View>
          ),
        }}
      >

        <Stack.Screen name="Home" component={Home} />
        {[
          ...LayoutsPage,
          ...CustomAnimations,
          ...ExperimentPage,
        ].map((item) => {
          return (
            <Stack.Screen
              key={item.name}
              name={item.name}
              component={item.page}
            />
          );
        })}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

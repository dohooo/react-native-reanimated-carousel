import React from "react";
import { I18nManager, Text, View, Platform } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Updates from "expo-updates";

import { QRCode } from "../components/QRCode";
import Home, { CustomAnimations, LayoutsPage, OtherPage } from "../Home";
import { isWeb } from "../utils";

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
  const [isRTL, setIsRTL] = React.useState(I18nManager.isRTL);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          cardStyle: {
            flex: 1,
            backgroundColor: "white",
          },
          headerRight: ({ tintColor }) => (
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
                <Text style={{ color: tintColor }}>
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
          ...OtherPage,
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

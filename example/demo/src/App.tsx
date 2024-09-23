import * as React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { window } from "./constants";
import { RootNavigator } from "./navigation/root";
import { isWeb } from "./utils";
import { WebProvider } from "./store/WebProvider";

const WebContainer: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <WebProvider>
      <View
        style={{
          height: "100%",
          width: window.width,
          alignSelf: "center",
          margin: "auto",
        }}
      >
        {children}
      </View>
    </WebProvider>
  );
};

function App() {
  const app = (
    <React.Suspense fallback={null}>
      <View style={{ flex: 1 }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootNavigator />
        </GestureHandlerRootView>
      </View>
    </React.Suspense>
  );

  if (isWeb)
    return <WebContainer>{app}</WebContainer>;

  return app;
}

export default App;

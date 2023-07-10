import React from "react";
import { SafeAreaView, Text, useColorScheme, Dimensions, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { Colors } from "react-native/Libraries/NewAppScreen";

const { width: PAGE_WIDTH } = Dimensions.get("window");
const App = () => {
  const isDarkMode = useColorScheme() === "dark";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={[backgroundStyle, { alignItems: "center", justifyContent: "center", flex: 1 }]}>
      <Carousel
        loop
        width={PAGE_WIDTH}
        height={PAGE_WIDTH / 2}
        data={[...new Array(6).keys()]}
        renderItem={({ index }) => (
          <View key={index} style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
            <Text>Hello</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default App;

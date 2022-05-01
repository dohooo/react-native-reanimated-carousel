import React from 'react';
import Carousel from 'react-native-reanimated-carousel';
import {SafeAreaView, Text, useColorScheme} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Dimensions} from 'react-native';
import {View} from 'react-native';

const {width: PAGE_WIDTH} = Dimensions.get('window');
const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <Text>111</Text>
      <Carousel
        loop
        width={PAGE_WIDTH}
        height={PAGE_WIDTH / 2}
        data={[...new Array(6).keys()]}
        renderItem={({index}) => (
          <View key={index}>
            <Text>111</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default App;

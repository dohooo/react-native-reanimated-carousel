import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// @ts-ignore
import { Restart } from 'fiction-expo-restart';

import Home from './home';
import NormalComponent from './normal';
import ParallaxComponent from './parallax';
import StackComponent from './stack';
import ComplexComponent from './complex';
import SnapCarouselComplexComponent from './snap-carousel-complex';
import SnapCarouselLoopComponent from './snap-carousel-loop';
import { I18nManager } from 'react-native';
import { Text } from 'react-native-ui-lib';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
    Home: undefined;
    Normal: undefined;
    Parallax: undefined;
    Stack: undefined;
    Complex: undefined;
    SnapCarouselComplex: undefined;
    SnapCarouselLoop: undefined;
};

function App() {
    const [isRTL, setIsRTL] = React.useState(I18nManager.isRTL);
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    contentStyle: {
                        flex: 1,
                        backgroundColor: 'white',
                    },
                    headerRight: ({ tintColor }) => (
                        <TouchableWithoutFeedback
                            onPress={() => {
                                I18nManager.forceRTL(!isRTL);
                                setIsRTL(!isRTL);
                                Restart();
                            }}
                        >
                            <Text color={tintColor}>
                                {isRTL ? 'LTR' : 'RTL'}
                            </Text>
                        </TouchableWithoutFeedback>
                    ),
                }}
            >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Normal" component={NormalComponent} />
                <Stack.Screen name="Parallax" component={ParallaxComponent} />
                <Stack.Screen name="Stack" component={StackComponent} />
                <Stack.Screen name="Complex" component={ComplexComponent} />
                <Stack.Screen
                    name="SnapCarouselComplex"
                    component={SnapCarouselComplexComponent}
                />
                <Stack.Screen
                    name="SnapCarouselLoop"
                    component={SnapCarouselLoopComponent}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;

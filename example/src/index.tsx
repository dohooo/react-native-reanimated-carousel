import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// @ts-ignore
import { Restart } from 'fiction-expo-restart';
import { I18nManager } from 'react-native';
import { Text } from 'react-native-ui-lib';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import Home from './home';
import NormalComponent from './normal';
import ParallaxComponent from './parallax';
import StackComponent from './stack';
import ComplexComponent from './complex';
import SnapCarouselComplexComponent from './snap-carousel-complex';
import SnapCarouselLoopComponent from './snap-carousel-loop';
import AdvancedParallaxComponent from './advanced-parallax';
import PauseAdvancedParallaxComponent from './pause-advanced-parallax';
import ScaleFadeInOutComponent from './scale-fade-in-out';
import RotateInOutComponent from './rotate-in-out';
import RotateScaleFadeInOutComponent from './rotate-scale-fade-in-out';
import AnimTabBarComponent from './anim-tab-bar';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
    Home: undefined;
    Normal: undefined;
    Parallax: undefined;
    Stack: undefined;

    Complex: undefined;
    AdvancedParallax: undefined;
    PauseAdvancedParallax: undefined;
    ScaleFadeInOut: undefined;
    RotateInOut: undefined;
    RotateScaleFadeInOut: undefined;
    AnimTabBar: undefined;

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
                    name="AdvancedParallax"
                    component={AdvancedParallaxComponent}
                />
                <Stack.Screen
                    name="PauseAdvancedParallax"
                    component={PauseAdvancedParallaxComponent}
                />
                <Stack.Screen
                    name="ScaleFadeInOut"
                    component={ScaleFadeInOutComponent}
                />
                <Stack.Screen
                    name="RotateInOut"
                    component={RotateInOutComponent}
                />
                <Stack.Screen
                    name="RotateScaleFadeInOut"
                    component={RotateScaleFadeInOutComponent}
                />
                <Stack.Screen
                    name="AnimTabBar"
                    component={AnimTabBarComponent}
                />

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

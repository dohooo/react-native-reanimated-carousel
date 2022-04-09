import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// @ts-ignore
import { Restart } from 'fiction-expo-restart';
import { I18nManager } from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import Home from './home';
import NormalComponent from './normal';
import ParallaxComponent from './parallax';
import StackComponent from './stack';
import ComplexComponent from './complex';
import AdvancedParallaxComponent from './advanced-parallax';
import PauseAdvancedParallaxComponent from './pause-advanced-parallax';
import ScaleFadeInOutComponent from './scale-fade-in-out';
import RotateInOutComponent from './rotate-in-out';
import RotateScaleFadeInOutComponent from './rotate-scale-fade-in-out';
import AnimTabBarComponent from './anim-tab-bar';
import MarqueeComponent from './marquee';
import MultipleComponent from './multiple';
import Flow from './flow';
import ParallaxLayers from './parallax-layers';
import { isWeb } from './utils';
import { window } from './constants';
import { QRCode } from './components/QRCode';

// Not support to WEB (react-native-snap-carousel)
const SnapCarouselComplexComponent = React.lazy(
    () => import('./snap-carousel-complex')
);
const SnapCarouselLoopComponent = React.lazy(
    () => import('./snap-carousel-loop')
);

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
    Home: undefined;
    Normal: undefined;
    Parallax: undefined;
    Stack: undefined;

    Flow: undefined;
    ParallaxLayers: undefined;
    Complex: undefined;
    AdvancedParallax: undefined;
    PauseAdvancedParallax: undefined;
    ScaleFadeInOut: undefined;
    RotateInOut: undefined;
    RotateScaleFadeInOut: undefined;
    AnimTabBar: undefined;
    Marquee: undefined;
    Multiple: undefined;

    SnapCarouselComplex: undefined;
    SnapCarouselLoop: undefined;
};

const WebContainer: React.FC = ({ children }) => {
    return (
        <View
            style={{
                height: '100%',
                width: window.width,
                alignSelf: 'center',
            }}
        >
            {children}
        </View>
    );
};

function App() {
    const [isRTL, setIsRTL] = React.useState(I18nManager.isRTL);

    const app = (
        <React.Suspense fallback={null}>
            <View flex>
                <NavigationContainer>
                    <Stack.Navigator
                        initialRouteName="Home"
                        screenOptions={{
                            contentStyle: {
                                flex: 1,
                                backgroundColor: 'white',
                            },
                            headerRight: ({ tintColor }) => (
                                <View row centerV>
                                    {isWeb && (
                                        <>
                                            <QRCode tintColor={tintColor} />
                                            <Text color={tintColor}> | </Text>
                                        </>
                                    )}
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
                                </View>
                            ),
                        }}
                    >
                        <Stack.Screen name="Home" component={Home} />
                        <Stack.Screen
                            name="Normal"
                            component={NormalComponent}
                        />
                        <Stack.Screen
                            name="Parallax"
                            component={ParallaxComponent}
                        />
                        <Stack.Screen name="Stack" component={StackComponent} />
                        <Stack.Screen name="Flow" component={Flow} />
                        <Stack.Screen
                            name="ParallaxLayers"
                            component={ParallaxLayers}
                        />
                        <Stack.Screen
                            name="Complex"
                            component={ComplexComponent}
                        />
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
                            name="Marquee"
                            component={MarqueeComponent}
                        />
                        <Stack.Screen
                            name="Multiple"
                            component={MultipleComponent}
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
            </View>
        </React.Suspense>
    );

    if (isWeb) {
        return <WebContainer>{app}</WebContainer>;
    }

    return app;
}

export default App;

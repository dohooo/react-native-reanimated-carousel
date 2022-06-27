import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// @ts-ignore
import { Restart } from 'fiction-expo-restart';
import { I18nManager, Text, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import Home, { CustomAnimations, LayoutsPage, OtherPage } from './Home';
import { isWeb } from './utils';
import { window } from './constants';
import { QRCode } from './components/QRCode';

const Stack = createNativeStackNavigator();

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
            <View style={{ flex: 1 }}>
                <NavigationContainer>
                    <Stack.Navigator
                        initialRouteName="Home"
                        screenOptions={{
                            contentStyle: {
                                flex: 1,
                                backgroundColor: 'white',
                            },
                            headerRight: ({ tintColor }) => (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    {isWeb && (
                                        <>
                                            <QRCode tintColor={tintColor} />
                                            <Text style={{ color: tintColor }}>
                                                {' '}
                                                |{' '}
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
                                            {isRTL ? 'LTR' : 'RTL'}
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
            </View>
        </React.Suspense>
    );

    if (isWeb) {
        return <WebContainer>{app}</WebContainer>;
    }

    return app;
}

export default App;

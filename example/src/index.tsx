import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './home';
import NormalComponent from './normal';
import ParallaxComponent from './parallax';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
    Home: undefined;
    Normal: undefined;
    Parallax: undefined;
};

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    contentStyle: {
                        backgroundColor: 'white',
                        flex: 1,
                        alignItems: 'center',
                        paddingTop: 100,
                    },
                }}
            >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Normal" component={NormalComponent} />
                <Stack.Screen name="Parallax" component={ParallaxComponent} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;

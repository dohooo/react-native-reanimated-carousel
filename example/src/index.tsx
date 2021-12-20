import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './home';
import NormalComponent from './normal';
import ParallaxComponent from './parallax';
import StackComponent from './stack';
import ComplexComponent from './complex';
import SnapCarouselComplexComponent from './snap-carousel-complex';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
    Home: undefined;
    Normal: undefined;
    Parallax: undefined;
    Stack: undefined;
    Complex: undefined;
    SnapCarouselComplex: undefined;
};

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    contentStyle: {
                        flex: 1,
                        backgroundColor: 'white',
                    },
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;

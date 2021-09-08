/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Button, Dimensions, Text, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { ICarouselInstance } from '../../src/Carousel';

import Carousel from '../../src/index';

const { width } = Dimensions.get('window');

export default function App() {
    const r = React.useRef<ICarouselInstance | null>(null);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: 'black',
            }}
        >
            <View style={{ height: 300 }}>
                <Carousel<{ color: string }>
                    ref={r}
                    mode="parallax"
                    width={width}
                    data={[
                        { color: 'red' },
                        { color: 'purple' },
                        { color: 'blue' },
                        { color: 'yellow' },
                    ]}
                    parallaxScrollingScale={0.8}
                    onSnapToItem={(index) => {
                        console.log('current index:', index);
                    }}
                    renderItem={({ color }, index) => {
                        return (
                            <View
                                style={{
                                    backgroundColor: color,
                                    flex: 1,
                                }}
                            >
                                <TouchableWithoutFeedback
                                    style={{ flex: 1 }}
                                    containerStyle={{ flex: 1 }}
                                    onPress={() => {
                                        console.log(color);
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            backgroundColor: color,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text>{index}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        );
                    }}
                />
            </View>
            <Button
                title="pre"
                onPress={() => {
                    r.current.prev();
                }}
            />
            <Button
                title="next"
                onPress={() => {
                    r.current.next();
                }}
            />
        </View>
    );
}

/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Alert, Button, Dimensions, Text, TextInput, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { ICarouselInstance } from '../../src/Carousel';

import Carousel from '../../src/index';

const { width } = Dimensions.get('window');

const data = [
    { color: 'red' },
    { color: 'purple' },
    { color: 'blue' },
    { color: 'yellow' },
];

export default function App() {
    const [index, setIndex] = React.useState<string>('');
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
                    onScrollBegin={() => {
                        console.log('scroll start');
                    }}
                    onScrollEnd={(pre, current) => {
                        console.log(
                            'scroll end',
                            'pre:',
                            pre,
                            'current:',
                            current
                        );
                    }}
                    timingConfig={{ duration: 500 }}
                    autoPlayInterval={2000}
                    ref={r}
                    mode="parallax"
                    width={width}
                    data={data}
                    // loop={false}
                    parallaxScrollingScale={0.8}
                    onSnapToItem={(i) => {
                        console.log('current index:', i);
                    }}
                    renderItem={({ color }, i) => {
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
                                        <Text style={{ fontSize: 80 }}>
                                            {i}
                                        </Text>
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
            <TextInput
                placeholder={'Set go to index'}
                placeholderTextColor="white"
                style={{ color: 'white' }}
                value={index}
                onChangeText={setIndex}
            />
            <Button
                title="GoTo"
                onPress={() => {
                    const idx = Number(index);
                    if (idx < 0 || idx >= data.length) {
                        Alert.alert('invalid index');
                        return;
                    }
                    r.current.goToIndex(idx, true);
                }}
            />
        </View>
    );
}

/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Button, Dimensions, View } from 'react-native';
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
                    width={width}
                    data={[
                        { color: 'red' },
                        { color: 'purple' },
                        { color: 'yellow' },
                    ]}
                    renderItem={({ color }) => {
                        return (
                            <View
                                style={{
                                    backgroundColor: color,
                                    justifyContent: 'center',
                                    flex: 1,
                                }}
                            />
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

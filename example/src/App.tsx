/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Dimensions, Image, ImageSourcePropType, View } from 'react-native';
import Carousel from '../../src/index';
import type { ICarouselInstance } from '../../src/Carousel';

const { width } = Dimensions.get('window');

const data: ImageSourcePropType[] = [
    require('../assets/carousel-0.jpg'),
    require('../assets/carousel-1.jpg'),
    require('../assets/carousel-2.jpg'),
];

export default function App() {
    const r = React.useRef<ICarouselInstance | null>(null);
    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: 'black',
                paddingTop: 100,
            }}
        >
            <View style={{ height: 300 }}>
                <Carousel<ImageSourcePropType>
                    ref={r}
                    width={width}
                    data={data}
                    parallaxScrollingScale={0.8}
                    renderItem={(source) => (
                        <View style={{ flex: 1 }}>
                            <Image
                                source={source}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </View>
                    )}
                />
            </View>
            <View style={{ height: 300 }}>
                <Carousel<ImageSourcePropType>
                    ref={r}
                    mode="parallax"
                    width={width}
                    data={data}
                    parallaxScrollingScale={0.8}
                    renderItem={(source) => (
                        <View style={{ flex: 1 }}>
                            <Image
                                source={source}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </View>
                    )}
                />
            </View>
        </View>
    );
}

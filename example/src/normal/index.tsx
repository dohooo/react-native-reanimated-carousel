import * as React from 'react';
import { Button, Dimensions, Text, View } from 'react-native';
import Carousel from '../../../src/index';
import type { ICarouselInstance } from '../../../src/types';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

interface DataItem {
    text: string;
    backgroundColor: string;
}

const data: DataItem[] = [
    { text: 'Walter, Wintheiser and Von', backgroundColor: '#ffbb96' },
    { text: 'Herman, Dicki and Wintheiser', backgroundColor: '#ff9c6e' },
    { text: 'Wiza, Borer and Muller', backgroundColor: '#ff7a45' },
    { text: 'Kulas Group', backgroundColor: '#fa541c' },
    { text: 'Rowe, Gerhold and Corkery', backgroundColor: '#d4380d' },
    { text: 'Lang - Doyle', backgroundColor: '#ad2102' },
    { text: "Anderson, Leuschke and O'Keefe", backgroundColor: '#871400' },
];

function Index() {
    const r = React.useRef<ICarouselInstance | null>(null);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: '#f1f1f1',
                paddingTop: 100,
            }}
        >
            <View style={{ width: PAGE_WIDTH, height: 240 }}>
                <Carousel
                    defaultIndex={0}
                    ref={r}
                    width={PAGE_WIDTH}
                    parallaxScrollingScale={0.8}
                    data={data}
                    renderItem={({ backgroundColor, text }) => (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor,
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 30 }}>
                                {text}
                            </Text>
                        </View>
                    )}
                />
            </View>
            <View
                style={{
                    marginTop: 24,
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                }}
            >
                <Button
                    title="Prev"
                    onPress={() => {
                        r.current?.prev();
                    }}
                />
                <Button
                    title="Next"
                    onPress={() => {
                        r.current?.next();
                    }}
                />
            </View>
        </View>
    );
}

export default Index;

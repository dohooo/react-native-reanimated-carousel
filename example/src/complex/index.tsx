import * as React from 'react';
import { Button, Dimensions, ScrollView, Text, View } from 'react-native';
import Carousel from '../../../src/index';
import type { ICarouselInstance } from '../../../src/types';

const window = Dimensions.get('window');
const PAGE_WIDTH = window.width;

interface DataItem {
    text: string;
    backgroundColor: string;
}

const data: DataItem[] = [
    { text: '0', backgroundColor: '#ffbb96' },
    { text: '1', backgroundColor: '#ff9c6e' },
    { text: '2', backgroundColor: '#ff7a45' },
    { text: '3', backgroundColor: '#fa541c' },
    { text: '4', backgroundColor: '#d4380d' },
    { text: '5', backgroundColor: '#ad2102' },
    { text: '6', backgroundColor: '#871400' },
    { text: '7', backgroundColor: '#ffbb96' },
    { text: '8', backgroundColor: '#ff9c6e' },
    { text: '9', backgroundColor: '#ff7a45' },
    { text: '10', backgroundColor: '#fa541c' },
    { text: '11', backgroundColor: '#d4380d' },
    { text: '12', backgroundColor: '#ad2102' },
    { text: '13', backgroundColor: '#871400' },
    { text: '14', backgroundColor: '#ffbb96' },
    { text: '15', backgroundColor: '#ff9c6e' },
    { text: '16', backgroundColor: '#ff7a45' },
    { text: '17', backgroundColor: '#fa541c' },
    { text: '18', backgroundColor: '#d4380d' },
    { text: '19', backgroundColor: '#ad2102' },
    { text: '20', backgroundColor: '#871400' },
    { text: '21', backgroundColor: '#ffbb96' },
    { text: '22', backgroundColor: '#ff9c6e' },
    { text: '23', backgroundColor: '#ffbb96' },
    { text: '24', backgroundColor: '#ff9c6e' },
    { text: '25', backgroundColor: '#ff7a45' },
    { text: '26', backgroundColor: '#fa541c' },
    { text: '27', backgroundColor: '#d4380d' },
    { text: '28', backgroundColor: '#ad2102' },
    { text: '29', backgroundColor: '#871400' },
    { text: '30', backgroundColor: '#ffbb96' },
    { text: '31', backgroundColor: '#ff9c6e' },
    { text: '32', backgroundColor: '#ff7a45' },
    { text: '33', backgroundColor: '#fa541c' },
    { text: '34', backgroundColor: '#d4380d' },
    { text: '35', backgroundColor: '#ad2102' },
    { text: '36', backgroundColor: '#871400' },
    { text: '37', backgroundColor: '#ffbb96' },
    { text: '38', backgroundColor: '#ff9c6e' },
    { text: '39', backgroundColor: '#ff7a45' },
    { text: '40', backgroundColor: '#ff7a45' },
    { text: '41', backgroundColor: '#ff7a45' },
    { text: '42', backgroundColor: '#ff7a45' },
    { text: '43', backgroundColor: '#ff7a45' },
    { text: '44', backgroundColor: '#ff7a45' },
    { text: '45', backgroundColor: '#ff7a45' },
    { text: '46', backgroundColor: '#ff7a45' },
    { text: '47', backgroundColor: '#ff7a45' },
    { text: '48', backgroundColor: '#ff7a45' },
    { text: '49', backgroundColor: '#ff7a45' },
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
                    data={data}
                    mode="parallax"
                    windowSize={3}
                    renderItem={({ backgroundColor, text }, index) => (
                        <View
                            key={index}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor,
                                padding: 16,
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 30 }}>
                                {`${index}-${text}`}
                            </Text>
                            <ScrollView style={{ width: '100%' }}>
                                {new Array(100).fill(0).map((_, i) => {
                                    return (
                                        <View
                                            key={i}
                                            style={{
                                                borderWidth: 1,
                                                borderColor: '#0000001a',
                                                padding: 16,
                                            }}
                                        >
                                            <Text>{i}</Text>
                                        </View>
                                    );
                                })}
                            </ScrollView>
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

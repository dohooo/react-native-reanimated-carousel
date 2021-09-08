/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Button, Dimensions, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { ICarouselInstance } from '../../src/Carousel';

import Carousel from '../../src/index';

const { width } = Dimensions.get('window');

export default function App() {
    const r = React.useRef<ICarouselInstance | null>(null);


    // return <View>
    //     <View style={{ position: "absolute" }}>
    //         <TouchableWithoutFeedback onPress={() => {
    //             console.log("red")
    //         }}>
    //             <View style={{ width: 200, height: 200, backgroundColor: "red" }}></View>
    //         </TouchableWithoutFeedback>
    //     </View>
    //     <View style={{ position: "absolute",top: 300+200*0.4,left:200*0.4 }}>
    //         <TouchableWithoutFeedback onPress={() => {
    //             console.log("blue")
    //         }}>
    //             <View style={{ 
    //                 width: 200*0.2,
    //                  height: 200*0.2,
    //                   backgroundColor: "blue"
    //                    }}></View>
    //         </TouchableWithoutFeedback>
    //     </View>
    // <View style={{width:100,height:100,backgroundColor:"black"}}>

    // </View>
    // </View>

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
                        { color: 'blue' },
                        { color: 'pink' },
                        { color: 'green' },
                    ]}
                    parallaxScrollingScale={0.9}
                    renderItem={({ color }) => {
                        return (
                                <View
                                    style={{
                                        backgroundColor: color,
                                        flex:1,
                                    }}
                                >
                                <TouchableWithoutFeedback
                                    style={{flex:1}}
                                    containerStyle={{flex:1}}
                                    onPress={() => {
                                        console.log(color);
                                    }}
                                >
                                    <View style={{flex:1,backgroundColor:color}}>

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

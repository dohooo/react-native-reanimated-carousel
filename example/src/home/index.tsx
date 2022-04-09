import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableHighlight,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../index';
import { Colors } from 'react-native-ui-lib';
import { isAndroid, isIos } from '../utils';

const LayoutsPage: Array<Record<'name', keyof RootStackParamList>> = [
    {
        name: 'Normal',
    },
    {
        name: 'Parallax',
    },
    {
        name: 'Stack',
    },
];

const CustomAnimations: Array<Record<'name', keyof RootStackParamList>> = [
    {
        name: 'Flow',
    },
    {
        name: 'ParallaxLayers',
    },
    {
        name: 'AdvancedParallax',
    },
    {
        name: 'PauseAdvancedParallax',
    },
    {
        name: 'ScaleFadeInOut',
    },
    {
        name: 'RotateInOut',
    },
    {
        name: 'RotateScaleFadeInOut',
    },
    {
        name: 'AnimTabBar',
    },
    {
        name: 'Marquee',
    },
    {
        name: 'Multiple',
    },
];

const OtherPage: Array<Record<'name', keyof RootStackParamList>> = [
    {
        name: 'Complex',
    },
];

if (isIos || isAndroid) {
    OtherPage.push(
        {
            name: 'SnapCarouselComplex',
        },
        {
            name: 'SnapCarouselLoop',
        }
    );
}

const Index = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    return (
        <ScrollView
            style={{ flex: 1 }}
            stickyHeaderIndices={[
                0,
                LayoutsPage.length + 1,
                LayoutsPage.length + CustomAnimations.length + 2,
            ]}
        >
            <View style={styles.section}>
                <Text style={styles.sectionText}>{'Layouts'}</Text>
            </View>
            {LayoutsPage.map(({ name }, index) => {
                return (
                    <TouchableHighlight
                        key={index}
                        onPress={() => navigation.navigate(name)}
                    >
                        <View style={styles.listItem}>
                            <Text style={styles.text}>{name}</Text>
                        </View>
                    </TouchableHighlight>
                );
            })}
            <View style={styles.section}>
                <Text style={styles.sectionText}>{'CustomAnimations'}</Text>
            </View>
            {CustomAnimations.map(({ name }, index) => {
                return (
                    <TouchableHighlight
                        key={index}
                        onPress={() => navigation.navigate(name)}
                    >
                        <View style={styles.listItem}>
                            <Text style={styles.text}>{name}</Text>
                        </View>
                    </TouchableHighlight>
                );
            })}
            <View style={styles.section}>
                <Text style={styles.sectionText}>{'Others'}</Text>
            </View>
            {OtherPage.map(({ name }, index) => {
                return (
                    <TouchableHighlight
                        key={index}
                        onPress={() => navigation.navigate(name)}
                    >
                        <View style={styles.listItem}>
                            <Text style={styles.text}>{name}</Text>
                        </View>
                    </TouchableHighlight>
                );
            })}
        </ScrollView>
    );
};

export default Index;

const styles = StyleSheet.create({
    listItem: {
        alignItems: 'flex-start',
        borderColor: Colors.grey60,
        borderBottomWidth: 0.5,
        padding: 16,
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 16,
    },
    section: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.grey60,
    },
    sectionText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

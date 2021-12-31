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
    {
        name: 'Complex',
    },
    {
        name: 'SnapCarouselComplex',
    },
    {
        name: 'SnapCarouselLoop',
    },
];

const Index = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    return (
        <ScrollView style={{ flex: 1 }}>
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
        </ScrollView>
    );
};

export default Index;

const styles = StyleSheet.create({
    listItem: {
        alignItems: 'center',
        borderColor: Colors.grey60,
        borderBottomWidth: 0.5,
        padding: 16,
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 16,
    },
});

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../index';
import { Colors, ListItem } from 'react-native-ui-lib';

const LayoutsPage: Array<Record<'name', keyof RootStackParamList>> = [
    {
        name: 'Normal',
    },
    {
        name: 'Parallax',
    },
];

const Index = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    return (
        <View style={StyleSheet.absoluteFill}>
            {LayoutsPage.map(({ name }, index) => {
                return (
                    <ListItem
                        key={index}
                        onPress={() => navigation.navigate(name)}
                        style={{
                            alignItems: 'center',
                            borderColor: Colors.grey60,
                            borderBottomWidth: 1,
                        }}
                    >
                        <Text>{name}</Text>
                    </ListItem>
                );
            })}
        </View>
    );
};

export default Index;

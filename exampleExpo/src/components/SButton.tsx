import React from 'react';
import { View, Text } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
export interface ISButtonProps {
    visible?: boolean;
    onPress?: () => void;
}

const SButton: React.FC<ISButtonProps> = (props) => {
    const { children, visible = true, onPress } = props;

    if (!visible) {
        return <></>;
    }

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <TouchableWithoutFeedback onPress={onPress}>
                <View
                    style={{
                        marginTop: 20,
                        backgroundColor: '#26292E',
                        borderRadius: 50,
                        paddingHorizontal: 20,
                        padding: 10,
                    }}
                >
                    <Text style={{ color: 'white' }}>{children}</Text>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

export default SButton;

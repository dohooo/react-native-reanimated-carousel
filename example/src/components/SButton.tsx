import React from 'react';
import { View, Button, ButtonProps, Text } from 'react-native-ui-lib';

export interface ISButtonProps {}

const SButton: React.FC<ISButtonProps & ButtonProps> = (props) => {
    return (
        <View row centerH>
            <Button {...props} marginT-20 backgroundColor="#26292E">
                <Text color="white">{props.children}</Text>
            </Button>
        </View>
    );
};

export default SButton;

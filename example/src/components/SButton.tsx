import React from 'react';
import { View, Button, ButtonProps, Text } from 'react-native-ui-lib';

export interface ISButtonProps {
    visible?: boolean;
}

const SButton: React.FC<ISButtonProps & ButtonProps> = (props) => {
    const { children, visible = true } = props;

    if (!visible) {
        return <></>;
    }

    return (
        <View row centerH>
            <Button {...props} marginT-20 backgroundColor="#26292E">
                <Text color="white">{children}</Text>
            </Button>
        </View>
    );
};

export default SButton;

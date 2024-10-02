import React from "react";
import { ColorValue, I18nManager, Platform, Text, View } from "react-native";
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { QRCode } from "@/components/QRCode";
import { IS_WEB } from "@/constants/platform";
import { reloadAsync } from "expo-updates";
import { IS_DEV } from "@/constants/env";
import { useCapture } from "@/store/CaptureProvider";
import { Camera } from "@tamagui/lucide-icons";
import { XStack } from "tamagui";

interface HeaderRightProps {
  tintColor?: ColorValue;
  isRTL: boolean;
  setIsRTL: React.Dispatch<React.SetStateAction<boolean>>;
}

const Restart = () => {
  if (Platform.OS === "web") window.location.reload();
  else reloadAsync();
};

export const HeaderRight: React.FC<HeaderRightProps> = ({
  tintColor,
  isRTL,
  setIsRTL,
}) => {
  const { capture } = useCapture();

  return (
    <XStack alignItems="center" justifyContent="center" gap={8}>
      {IS_WEB && (
        <>
          <QRCode tintColor={tintColor} />
          <Text style={{ color: tintColor }}> | </Text>
        </>
      )}
      {IS_DEV && !IS_WEB && (
        <TouchableOpacity onPress={capture}>
          <Camera size={20} />
        </TouchableOpacity>
      )}
      <TouchableWithoutFeedback
        onPress={() => {
          I18nManager.forceRTL(!isRTL);
          setIsRTL(!isRTL);
          Restart();
        }}
      >
        <Text style={{ color: tintColor, marginRight: 12 }}>
          {isRTL ? "LTR" : "RTL"}
        </Text>
      </TouchableWithoutFeedback>
    </XStack>
  );
};

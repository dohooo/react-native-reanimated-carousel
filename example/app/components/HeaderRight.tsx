import { QRCode } from "@/components/QRCode";
import { IS_DEV } from "@/constants/env";
import { IS_WEB } from "@/constants/platform";
import { useCapture } from "@/store/CaptureProvider";
import { Box, Camera } from "@tamagui/lucide-icons";
import { usePathname, useRouter } from "expo-router";
import { reloadAsync } from "expo-updates";
import React from "react";
import { ColorValue, I18nManager, Platform, Text } from "react-native";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native-gesture-handler";
import { XStack } from "tamagui";

type IconProps = {
  size?: number;
  color?: string;
};

const BoxIcon = Box as React.ComponentType<IconProps>;
const CameraIcon = Camera as React.ComponentType<IconProps>;

interface HeaderRightProps {
  tintColor?: ColorValue;
  isRTL: boolean;
  setIsRTL: React.Dispatch<React.SetStateAction<boolean>>;
}

const Restart = () => {
  if (Platform.OS === "web") window.location.reload();
  else reloadAsync();
};

export const HeaderRight: React.FC<HeaderRightProps> = ({ tintColor, isRTL, setIsRTL }) => {
  const { capture } = useCapture();
  const pathname = usePathname();
  const inDemos = pathname.startsWith("/demos");
  const router = useRouter();

  function demoToggle() {
    const isDemoPage = pathname.endsWith("/demo");
    if (isDemoPage) {
      router.replace(pathname.replace(/\/demo$/, "") as never);
    } else {
      router.replace(`${pathname}/demo` as never);
    }
  }

  return (
    <XStack alignItems="center" justifyContent="center" gap={8}>
      {IS_WEB && (
        <>
          <QRCode tintColor={tintColor} />
          <Text style={{ color: tintColor }}> | </Text>
        </>
      )}

      {IS_DEV && !IS_WEB && inDemos && (
        <>
          <TouchableOpacity onPress={demoToggle}>
            <BoxIcon size={20} />
          </TouchableOpacity>
          <Text>|</Text>
        </>
      )}
      {IS_DEV && !IS_WEB && inDemos && (
        <>
          <TouchableOpacity onPress={capture}>
            <CameraIcon size={20} />
          </TouchableOpacity>
          <Text>|</Text>
        </>
      )}
      <TouchableWithoutFeedback
        onPress={() => {
          I18nManager.forceRTL(!isRTL);
          setIsRTL(!isRTL);
          Restart();
        }}
      >
        <Text style={{ color: tintColor, marginRight: 12 }}>{isRTL ? "LTR" : "RTL"}</Text>
      </TouchableWithoutFeedback>
    </XStack>
  );
};

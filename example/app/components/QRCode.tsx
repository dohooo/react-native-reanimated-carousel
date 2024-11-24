import * as React from "react";
import type { ColorValue } from "react-native";
import { StyleSheet, Text } from "react-native";
import { AlertDialog } from "tamagui";
import { Image, Stack } from "tamagui";

export const QRCode: React.FC<{ tintColor?: ColorValue }> = ({ tintColor }) => {
  return (
    <Stack flex={1}>
      <AlertDialog>
        <AlertDialog.Trigger asChild>
          <Text>QR CODE</Text>
        </AlertDialog.Trigger>

        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            animation={[
              "quick",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            scale={1}
            opacity={1}
            y={0}
          >
            <AlertDialog.Cancel asChild>
              <Stack width={200} height={200}>
                <Image
                  position={"absolute"}
                  width={"100%"}
                  height={"100%"}
                  borderRadius={5}
                  borderWidth={3}
                  borderColor={"#26292E"}
                  source={require("@/assets/images/web-example-qrcode.png")}
                />
              </Stack>
            </AlertDialog.Cancel>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>

      {/* <Text style={{ color: tintColor }}>{"QR CODE"}</Text>
        {visible && (
          <Stack
            position={"absolute"}
            bottom={-10}
            right={0}
            width={200}
            height={200}
            transform={[{ translateY: "100%" }]}
          >
            <Image
              position={"absolute"}
              width={"100%"}
              height={"100%"}
              borderRadius={5}
              borderWidth={3}
              borderColor={"#26292E"}
              source={require("@/assets/images/web-example-qrcode.png")}
            />
          </Stack>
        )} */}
    </Stack>
  );
};

const styles = StyleSheet.create({
  qrCodeContainer: {
    position: "absolute",
    bottom: -10,
    transform: [{ translateY: "100%" }],
    height: 200,
    width: 200,
    right: 0,
  },
  qrCodeImage: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 3,
    borderColor: "#26292E",
  },
});

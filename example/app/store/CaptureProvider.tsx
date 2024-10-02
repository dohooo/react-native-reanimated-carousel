import { saveToLibraryAsync } from "expo-media-library";
import React, {
  ComponentProps,
  createContext,
  PropsWithChildren,
  useContext,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import { captureRef } from "react-native-view-shot";
import { Stack, YStack } from "tamagui";

const CaptureContext = createContext<{
  setImageRef: (ref: React.RefObject<any>) => void;
  capture: () => Promise<string | null>;
}>({
  capture: () => Promise.resolve(null),
  setImageRef: () => {},
});

export const CaptureProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [imageRef, setImageRef] = useState<React.RefObject<any> | null>(null);

  const capture = async () => {
    if (imageRef && imageRef.current) {
      try {
        const uri = await captureRef(imageRef.current, {
          format: "png",
          quality: 1,
        });

        await saveToLibraryAsync(uri);

        if (uri) {
          Alert.alert("📸 Picture taken successfully!");
        }
      } catch (error) {
        return null;
      }
    } else {
      Alert.alert("There is no ref to capture");
    }

    return null;
  };

  return (
    <CaptureContext.Provider value={{ capture, setImageRef }}>
      {children}
    </CaptureContext.Provider>
  );
};

export const CaptureWrapper: React.FC<
  PropsWithChildren & ComponentProps<typeof Stack>
> = ({ children, ...props }) => {
  const imageRef = useRef(null);
  const { setImageRef: setImageRef } = useContext(CaptureContext);

  React.useEffect(() => {
    setImageRef(imageRef);
  }, [setImageRef]);

  return (
    <YStack ref={imageRef} {...props}>
      {children}
    </YStack>
  );
};

export const useCapture = () => {
  const { capture } = useContext(CaptureContext);

  return { capture };
};

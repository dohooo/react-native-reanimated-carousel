import * as React from "react";
import { useSharedValue } from "react-native-reanimated";
import { Carousel, CarouselRef, Pagination } from "react-native-reanimated-carousel";

import { defaultDataWith6Colors } from "@/components/CarouselBasicSettingsPanel";
import { window } from "@/constants/sizes";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { renderItem } from "@/utils/render-item";
import { Stack, YStack } from "tamagui";

const PAGE_WIDTH = window.width;

function Index() {
  const progress = useSharedValue<number>(0);
  const baseOptions = {
    orientation: "horizontal",
  } as const;

  const ref = React.useRef<CarouselRef>(null);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      index,
      animated: true,
    });
  };

  return (
    <YStack gap={"$2"}>
      <Stack mb={"$4"}>
        <Carousel
          ref={ref}
          {...baseOptions}
          loop
          progress={progress}
          contentContainerStyle={{ width: PAGE_WIDTH }}
          style={{ width: PAGE_WIDTH, height: PAGE_WIDTH * 0.6 }}
          data={defaultDataWith6Colors}
          renderItem={renderItem({ rounded: true })}
        />
      </Stack>

      <CaptureWrapper>
        <Pagination
          count={defaultDataWith6Colors.length}
          progress={progress}
          dotStyle={{ backgroundColor: "#262626" }}
          activeDotStyle={{ backgroundColor: "#f1f1f1" }}
          containerStyle={{ gap: 5, marginBottom: 10 }}
          onPress={onPressPagination}
          getItemAccessibilityLabel={(index, count) => `Color slide ${index + 1} of ${count}`}
        />

        <Pagination
          count={defaultDataWith6Colors.length}
          progress={progress}
          dotStyle={{
            width: 25,
            height: 4,
            backgroundColor: "#262626",
          }}
          activeDotStyle={{
            backgroundColor: "#f1f1f1",
          }}
          containerStyle={{
            gap: 10,
            marginBottom: 10,
          }}
          onPress={onPressPagination}
          getItemAccessibilityLabel={(index, count) => `Color ${index + 1} of ${count}`}
        />

        <Pagination
          count={defaultDataWith6Colors.length}
          progress={progress}
          dotStyle={{
            width: 20,
            height: 20,
            borderRadius: 100,
            backgroundColor: "#262626",
          }}
          activeDotStyle={{
            borderRadius: 100,
            backgroundColor: "#f1f1f1",
          }}
          containerStyle={[
            {
              gap: 5,
              marginBottom: 10,
            },
          ]}
        />

        <Pagination
          count={defaultDataWith6Colors.length}
          progress={progress}
          dotStyle={{
            width: 20,
            height: 20,
            borderRadius: 16,
            backgroundColor: "#262626",
          }}
          activeDotStyle={{
            borderRadius: 8,
            width: 40,
            height: 30,
            backgroundColor: "#f1f1f1",
          }}
          containerStyle={{
            gap: 5,
            marginBottom: 10,
            alignItems: "center",
            minHeight: 30,
          }}
          onPress={onPressPagination}
        />
      </CaptureWrapper>
    </YStack>
  );
}

export default Index;

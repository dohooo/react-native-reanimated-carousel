import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
} from "react-native";

import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

import AdvancedParallaxComponent from "./pages/advanced-parallax";
import AnimTabBarComponent from "./pages/anim-tab-bar";
import BlurParallax from "./pages/blur-parallax";
import BlurRotate from "./pages/blur-rotate";
import Circular from "./pages/circular";
import ComplexComponent from "./pages/complex";
import Cube3D from "./pages/cube-3d";
import Curve from "./pages/curve";
import Flow from "./pages/flow";
import Fold from "./pages/fold";
import LeftAlignComponent from "./pages/left-align";
import MarqueeComponent from "./pages/marquee";
import MultipleComponent from "./pages/multiple";
import NormalComponent from "./pages/normal";
import ParallaxComponent from "./pages/parallax";
import ParallaxLayers from "./pages/parallax-layers";
import PauseAdvancedParallaxComponent from "./pages/pause-advanced-parallax";
import PressSwipe from "./pages/press-swipe";
import RotateInOutComponent from "./pages/rotate-in-out";
import RotateScaleFadeInOutComponent from "./pages/rotate-scale-fade-in-out";
import ScaleFadeInOutComponent from "./pages/scale-fade-in-out";
import StackComponent from "./pages/stack";
import StackCards from "./pages/stack-cards";
import Tear from "./pages/tear";
import { isAndroid, isIos } from "./utils";

export const LayoutsPage = [
  {
    name: "Normal",
    page: NormalComponent,
  },
  {
    name: "Parallax",
    page: ParallaxComponent,
  },
  {
    name: "Stack",
    page: StackComponent,
  },
  {
    name: "LeftAlign",
    page: LeftAlignComponent,
  },
];

export const CustomAnimations = [
  {
    name: "BlurRotate",
    page: BlurRotate,
  },
  {
    name: "Curve",
    page: Curve,
  },
  {
    name: "BlurParallax",
    page: BlurParallax,
  },
  {
    name: "Cube3D",
    page: Cube3D,
  },
  {
    name: "PressSwipe",
    page: PressSwipe,
  },
  {
    name: "Tear",
    page: Tear,
  },
  {
    name: "StackCards",
    page: StackCards,
  },
  {
    name: "Fold",
    page: Fold,
  },
  {
    name: "Circular",
    page: Circular,
  },
  {
    name: "Flow",
    page: Flow,
  },
  {
    name: "ParallaxLayers",
    page: ParallaxLayers,
  },
  {
    name: "AdvancedParallax",
    page: AdvancedParallaxComponent,
  },
  {
    name: "PauseAdvancedParallax",
    page: PauseAdvancedParallaxComponent,
  },
  {
    name: "ScaleFadeInOut",
    page: ScaleFadeInOutComponent,
  },
  {
    name: "RotateInOut",
    page: RotateInOutComponent,
  },
  {
    name: "RotateScaleFadeInOut",
    page: RotateScaleFadeInOutComponent,
  },
  {
    name: "AnimTabBar",
    page: AnimTabBarComponent,
  },
  {
    name: "Marquee",
    page: MarqueeComponent,
  },
  {
    name: "Multiple",
    page: MultipleComponent,
  },
];

export const OtherPage = [
  {
    name: "Complex",
    page: ComplexComponent,
  },
];

if (isIos || isAndroid) {
  // Not support to WEB (react-native-snap-carousel)
  const SnapCarouselComplexComponent = React.lazy(
    () => import("./pages/snap-carousel-complex"),
  );
  const SnapCarouselLoopComponent = React.lazy(
    () => import("./pages/snap-carousel-loop"),
  );

  OtherPage.push(
    {
      name: "SnapCarouselComplex",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      page: SnapCarouselComplexComponent,
    },
    {
      name: "SnapCarouselLoop",
      page: SnapCarouselLoopComponent,
    },
  );
}

const Index = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <ScrollView
      style={{ flex: 1 }}
      stickyHeaderIndices={[
        0,
        LayoutsPage.length + 1,
        LayoutsPage.length + CustomAnimations.length + 2,
      ]}
    >
      <View style={styles.section}>
        <Text style={styles.sectionText}>Layouts</Text>
      </View>
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
      <View style={styles.section}>
        <Text style={styles.sectionText}>{"CustomAnimations"}</Text>
      </View>
      {CustomAnimations.map(({ name }, index) => {
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
      <View style={styles.section}>
        <Text style={styles.sectionText}>{"Others"}</Text>
      </View>
      {OtherPage.map(({ name }, index) => {
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
    alignItems: "flex-start",
    borderColor: "#e8ecf0",
    borderBottomWidth: 0.5,
    padding: 16,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
  },
  section: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#e8ecf0",
  },
  sectionText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

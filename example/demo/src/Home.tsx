import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

// @ts-ignore
import type { NavigationProp } from "@react-navigation/native";
// @ts-ignore
import { useNavigation } from "@react-navigation/native";

import AdvancedParallaxComponent from "./pages/advanced-parallax";
import AnimTabBarComponent from "./pages/anim-tab-bar";
import BlurParallax from "./pages/blur-parallax";
import BlurRotate from "./pages/blur-rotate";
import Tinder from "./pages/tinder";
import Circular from "./pages/circular";
import ComplexComponent from "./pages/complex";
import Cube3D from "./pages/cube-3d";
import Curve from "./pages/curve";
import Flow from "./pages/flow";
import Fold from "./pages/fold";
import LeftAlignComponent from "./pages/left-align";
import RightAlignComponent from "./pages/right-align";
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
import QuickSwipe from "./pages/quick-swipe";
import Material3 from "./pages/material-3";
import { useWebContext } from "./store/WebProvider";
import { convertName } from "./utils/helpers";
import { useColor } from "./hooks/useColor";
import { TouchableOpacity } from "react-native-gesture-handler";

export const LayoutsPage = [
  {
    name: "normal",
    page: NormalComponent,
  },
  {
    name: "parallax",
    page: ParallaxComponent,
  },
  {
    name: 'stack',
    page: StackComponent,
  },
  {
    name: "left-align",
    page: LeftAlignComponent,
  },
  {
    name: "right-align",
    page: RightAlignComponent
  }
];

export const CustomAnimations = [
  {
    name: 'quick-swipe',
    page: QuickSwipe,
  },
  {
    name: 'tinder',
    page: Tinder,
  },
  {
    name: 'blur-rotate',
    page: BlurRotate,
  },
  {
    name: 'material-3',
    page: Material3
  },
  {
    name: "curve",
    page: Curve,
  },
  {
    name: "blur-parallax",
    page: BlurParallax,
  },
  {
    name: "cube-3d",
    page: Cube3D,
  },
  {
    name: "press-swipe",
    page: PressSwipe,
  },
  {
    name: "tear",
    page: Tear,
  },
  {
    name: "stack-cards",
    page: StackCards,
  },
  {
    name: "fold",
    page: Fold,
  },
  {
    name: "circular",
    page: Circular,
  },
  {
    name: "flow",
    page: Flow,
  },
  {
    name: "parallax-layers",
    page: ParallaxLayers,
  },
  {
    name: "advanced-parallax",
    page: AdvancedParallaxComponent,
  },
  {
    name: "pause-advanced-parallax",
    page: PauseAdvancedParallaxComponent,
  },
  {
    name: "scale-fade-in-out",
    page: ScaleFadeInOutComponent,
  },
  {
    name: 'rotate-in-out',
    page: RotateInOutComponent,
  },
  {
    name: "rotate-scale-fade-in-out",
    page: RotateScaleFadeInOutComponent,
  },
  {
    name: "anim-tab-bar",
    page: AnimTabBarComponent,
  },
  {
    name: "marquee",
    page: MarqueeComponent,
  },
  {
    name: "multiple",
    page: MultipleComponent,
  },
];

export const ExperimentPage = [
  {
    name: "complex",
    page: ComplexComponent,
  },
];

const ListItem = ({ name, onPress, color }: { name: string; onPress: () => void; color: string }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.listItem}>
      <Text style={[styles.text, { color: color }]}>{name.split('-').join(' ')}</Text>
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title, color }: { title: string; color: any }) => (
  <View style={[styles.section, { backgroundColor: color.background }]}>
    <View style={{ width: 5, height: 20, backgroundColor: color.text, marginRight: 12 }} />
    <Text style={[styles.sectionText, { color: color.text }]}>{title}</Text>
  </View>
);

interface PageItem {
  name: string;
  page: React.FC;
}

const Index = () => {
  const webCtx = useWebContext();
  const { colors } = useColor()
  const navigation = useNavigation<NavigationProp<any>>();

  React.useEffect(() => {
    if (webCtx?.page) {
      navigation.navigate(webCtx.page)
    }
  }, [webCtx])

  const renderSection = (title: string, data: PageItem[]) => (
    [
      <SectionHeader key={title} title={title} color={colors} />,
      ...(data.map((item, index) => (
        <ListItem
          key={index}
          name={item.name}
          onPress={() => navigation.navigate(item.name)}
          color={colors.text}
        />
      )))
    ]
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 64 }} stickyHeaderIndices={[0, LayoutsPage.length + 1, LayoutsPage.length + CustomAnimations.length + 2]}>
      {renderSection('Layouts', LayoutsPage)}
      {renderSection('CustomAnimations', CustomAnimations)}
      {renderSection('Experiment', ExperimentPage)}
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
  },
  text: {
    fontSize: 16,
  },
  section: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  sectionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

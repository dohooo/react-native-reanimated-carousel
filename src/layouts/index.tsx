import { normalLayout } from "./normal";
import { parallaxLayout } from "./parallax";
import { horizontalStackLayout, verticalStackLayout } from "./stack";

export type TMode = "parallax" | "horizontal-stack" | "vertical-stack";

export const Layouts = {
  normal: normalLayout,
  parallax: parallaxLayout,
  horizontalStack: horizontalStackLayout,
  verticalStack: verticalStackLayout,
};

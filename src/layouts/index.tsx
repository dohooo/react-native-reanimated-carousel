import { normalLayout } from './normal';
import { parallaxLayout } from './parallax';
import { horizontalStackLayout, verticalStackLayout } from './stack';
export { ParallaxLayout } from './ParallaxLayout';
export { StackLayout } from './StackLayout';
export { NormalLayout } from './NormalLayout';

export type TMode =
    | 'default'
    | 'parallax'
    | 'stack'
    | 'horizontal-stack'
    | 'vertical-stack';

export const Layouts = {
    normal: normalLayout,
    parallax: parallaxLayout,
    horizontalStack: horizontalStackLayout,
    verticalStack: verticalStackLayout,
};

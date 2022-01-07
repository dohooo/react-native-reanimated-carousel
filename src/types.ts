import type { ViewStyle } from 'react-native';
import type { PanGestureHandlerProps } from 'react-native-gesture-handler';
import type { ILayoutConfig as IStackLayoutConfig } from './layouts/stack';
import type { ILayoutConfig as IParallaxLayoutConfig } from './layouts/parallax';

export type ComputedDirectionTypes<T, VP = {}, HP = {}> =
    | (T &
          VP & {
              /**
               * Layout items vertically instead of horizontally
               */
              vertical: true;
              /**
               * Layout items vertically instead of horizontally
               */
              /**
               * Specified carousel container width.
               */
              width?: number;
              height: number;
          })
    | (T &
          HP & {
              /**
               * Layout items vertically instead of horizontally
               */
              vertical?: false;
              /**
               * Layout items vertically instead of horizontally
               */
              /**
               * Specified carousel container width.
               */
              width: number;
              height?: number;
          });

type TParallaxModeProps = ComputedDirectionTypes<{
    /**
     * Carousel Animated transitions.
     */
    mode?: 'parallax';
    modeConfig?: IParallaxLayoutConfig;
}>;

type TStackModeProps = ComputedDirectionTypes<{
    /**
     * Carousel Animated transitions.
     */
    mode?: 'horizontal-stack' | 'vertical-stack';
    /**
     * Stack animation style.
     * @default
     *     mode: 'vertical',
     *     snapDirection: 'right',
     *     moveSize: window.width,
     *     stackInterval: 30,
     *     scaleInterval: 0.08,
     *     rotateZDeg: 135,
     */
    modeConfig?: IStackLayoutConfig;
}>;

export type TCarouselProps<T = any> = {
    ref?: React.Ref<ICarouselInstance>;
    /**
     * Carousel loop playback.
     * @default true
     */
    loop?: boolean;
    /**
     * Carousel items data set.
     */
    data: T[];
    /**
     * Default index
     * @default 0
     */
    defaultIndex?: number;
    /**
     * Auto play
     */
    autoPlay?: boolean;
    /**
     * Auto play
     * @description reverse playback
     */
    autoPlayReverse?: boolean;
    /**
     * Auto play
     * @description playback interval
     */
    autoPlayInterval?: number;
    /**
     * Carousel container style
     */
    style?: ViewStyle;
    /**
     * PanGestureHandler props
     */
    panGestureHandlerProps?: Omit<
        Partial<PanGestureHandlerProps>,
        'onHandlerStateChange'
    >;
    /**
     * Determines the maximum number of items will respond to pan gesture events,
     * windowSize={11} will active visible item plus up to 5 items above and 5 below the viewpor,
     * Reducing this number will reduce the calculation of the animation value and may improve performance.
     * @default 0 all items will respond to pan gesture events.
     */
    windowSize?: number;
    /**
     * When true, the scroll view stops on multiples of the scroll view's size when scrolling.
     * @default true
     */
    pagingEnabled?: boolean;
    /**
     * If enabled, releasing the touch will scroll to the nearest item.
     * valid when pagingEnabled=false
     * @default true
     */
    enableSnap?: boolean;
    /**
     * Render carousel item.
     */
    renderItem: (data: T, index: number) => React.ReactNode;
    /**
     * Callback fired when navigating to an item
     */
    onSnapToItem?: (index: number) => void;
    /**
     * On scroll begin
     */
    onScrollBegin?: () => void;
    /**
     * On scroll end
     */
    onScrollEnd?: (previous: number, current: number) => void;
    /**
     * On progress change
     * @param offsetProgress Total of offset distance (0 390 780 ...)
     * @param absoluteProgress Convert to index (0 1 2 ...)
     */
    onProgressChange?: (
        offsetProgress: number,
        absoluteProgress: number
    ) => void;
} & (TParallaxModeProps | TStackModeProps);

export interface ICarouselInstance {
    /**
     * Play the last one
     */
    prev: () => void;
    /**
     * Play the next one
     */
    next: () => void;
    /**
     * Get current item index
     */
    getCurrentIndex: () => number;
    /**
     * Go to index
     */
    goToIndex: (index: number, animated?: boolean) => void;
}

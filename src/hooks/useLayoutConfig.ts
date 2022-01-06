import React from 'react';
import { Layouts } from '../layouts';
import type { TLayoutConfig } from '../layouts/BaseLayout';
import type { TInitializeCarouselProps } from './useInitProps';

type TLayoutConfigOpts<T> = TInitializeCarouselProps<T> & { size: number };

export function useLayoutConfig<T>(opts: TLayoutConfigOpts<T>): TLayoutConfig {
    const {
        mode,
        size,
        vertical,
        parallaxScrollingOffset,
        parallaxScrollingScale,
        showLength,
        data,
        animationConfig,
    } = opts as Required<TLayoutConfigOpts<T>>;

    const parallaxConfig = React.useMemo(
        () =>
            Layouts.parallax({
                size,
                vertical,
                parallaxScrollingOffset,
                parallaxScrollingScale,
            }),
        [size, vertical, parallaxScrollingOffset, parallaxScrollingScale]
    );

    const horizontalStackConfig = React.useMemo(
        () =>
            Layouts.horizontalStack({
                size,
                showLength: showLength || data.length - 1,
                animationConfig,
            }),
        [size, data, showLength, animationConfig]
    );

    const verticalStackConfig = React.useMemo(
        () =>
            Layouts.verticalStack({
                size,
                showLength: showLength || data.length - 1,
                animationConfig,
            }),
        [size, showLength, data, animationConfig]
    );

    const normalConfig = React.useMemo(
        () => Layouts.normal({ size, vertical }),
        [size, vertical]
    );

    switch (mode) {
        case 'parallax':
            return parallaxConfig;
        case 'horizontal-stack':
            return horizontalStackConfig;
        case 'vertical-stack':
            return verticalStackConfig;
        case 'default':
        default:
            return normalConfig;
    }
}

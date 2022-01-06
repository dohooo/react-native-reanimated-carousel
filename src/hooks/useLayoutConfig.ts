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

    return React.useMemo(() => {
        switch (mode) {
            case 'parallax':
                return Layouts.parallax({
                    size,
                    vertical,
                    parallaxScrollingOffset,
                    parallaxScrollingScale,
                });
            case 'horizontal-stack':
                return Layouts.horizontalStack({
                    size,
                    showLength: showLength || data.length - 1,
                    animationConfig,
                });
            case 'vertical-stack':
                return Layouts.verticalStack({
                    size,
                    showLength: showLength || data.length - 1,
                    animationConfig,
                });
            case 'default':
            default:
                return Layouts.normal({ size, vertical });
        }
    }, [
        mode,
        size,
        data,
        vertical,
        showLength,
        animationConfig,
        parallaxScrollingScale,
        parallaxScrollingOffset,
    ]);
}

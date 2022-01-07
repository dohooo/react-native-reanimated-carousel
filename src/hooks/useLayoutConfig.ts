import React from 'react';
import type { TAnimationStyle } from 'src/layouts/BaseLayout';
import { Layouts } from '../layouts';
import type { TInitializeCarouselProps } from './useInitProps';

type TLayoutConfigOpts<T> = TInitializeCarouselProps<T> & { size: number };

export function useLayoutConfig<T>(
    opts: TLayoutConfigOpts<T>
): TAnimationStyle {
    const {
        mode,
        size,
        vertical,
        parallaxScrollingOffset,
        parallaxScrollingScale,
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
                return Layouts.horizontalStack(animationConfig);
            case 'vertical-stack':
                return Layouts.verticalStack(animationConfig);
            default:
                return Layouts.normal({ size, vertical });
        }
    }, [
        mode,
        animationConfig,
        size,
        vertical,
        parallaxScrollingScale,
        parallaxScrollingOffset,
    ]);
}

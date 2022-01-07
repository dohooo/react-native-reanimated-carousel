import React from 'react';
import type { TAnimationStyle } from 'src/layouts/BaseLayout';
import { Layouts } from '../layouts';
import type { TInitializeCarouselProps } from './useInitProps';

type TLayoutConfigOpts<T> = TInitializeCarouselProps<T> & { size: number };

export function useLayoutConfig<T>(
    opts: TLayoutConfigOpts<T>
): TAnimationStyle {
    const { size, vertical } = opts as Required<TLayoutConfigOpts<T>>;

    return React.useMemo(() => {
        const baseConfig = { size, vertical };
        switch (opts.mode) {
            case 'parallax':
                return Layouts.parallax(baseConfig, opts.animationConfig);
            case 'horizontal-stack':
                return Layouts.horizontalStack(opts.animationConfig);
            case 'vertical-stack':
                return Layouts.verticalStack(opts.animationConfig);
            default:
                return Layouts.normal(baseConfig);
        }
    }, [opts.mode, opts.animationConfig, size, vertical]);
}

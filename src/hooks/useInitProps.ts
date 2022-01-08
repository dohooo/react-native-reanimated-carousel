import React from 'react';
import { DATA_LENGTH } from '../constants';
import type { TCarouselProps } from '../types';

export type TInitializeCarouselProps<T> = TCarouselProps<T> & {
    defaultIndex: Required<TCarouselProps>['defaultIndex'];
    loop: Required<TCarouselProps>['loop'];
    width: Required<TCarouselProps>['width'];
    height: Required<TCarouselProps>['height'];
};

export function useInitProps<T>(
    props: TCarouselProps<T>
): TInitializeCarouselProps<T> {
    const {
        defaultIndex = 0,
        data: _data = [],
        loop = true,
        autoPlayInterval = 1000,
        style = {},
        panGestureHandlerProps = {},
        pagingEnabled = true,
        enableSnap = true,
        width: _width,
        height: _height,
    } = props;

    const width = Math.round(_width || 0);
    const height = Math.round(_height || 0);

    const data = React.useMemo<T[]>(() => {
        if (!loop) return _data;

        if (_data.length === DATA_LENGTH.SINGLE_ITEM) {
            return [_data[0], _data[0], _data[0]];
        }

        if (_data.length === DATA_LENGTH.DOUBLE_ITEM) {
            return [_data[0], _data[1], _data[0], _data[1]];
        }

        return _data;
    }, [_data, loop]);

    if (props.mode === 'vertical-stack' || props.mode === 'horizontal-stack') {
        if (!props.modeConfig) {
            props.modeConfig = {};
        }
        props.modeConfig.showLength =
            props.modeConfig?.showLength ?? data.length - 1;
    }
    return {
        ...props,
        defaultIndex,
        data,
        loop,
        autoPlayInterval,
        style,
        panGestureHandlerProps,
        pagingEnabled,
        enableSnap,
        width,
        height,
    };
}

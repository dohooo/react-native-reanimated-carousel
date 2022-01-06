import React from 'react';
import { DATA_LENGTH } from '../constants';
import type { TCarouselProps } from '../types';

export type TInitializeCarouselProps<T> = TCarouselProps<T> & {
    defaultIndex: Required<TCarouselProps>['defaultIndex'];
    loop: Required<TCarouselProps>['loop'];
};

export function useInitProps<T>(
    props: TCarouselProps<T>
): TInitializeCarouselProps<T> {
    const {
        defaultIndex = 0,
        data: _data = [],
        loop = true,
        mode = 'default',
        autoPlayInterval = 1000,
        style = {},
        panGestureHandlerProps = {},
        pagingEnabled = true,
        enableSnap = true,
    } = props;

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

    return {
        ...props,
        defaultIndex,
        data,
        loop,
        mode,
        autoPlayInterval,
        style,
        panGestureHandlerProps,
        pagingEnabled,
        enableSnap,
    };
}

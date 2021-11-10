import React from 'react';
import type { ICarouselProps } from 'src/Carousel';

export function usePropsErrorBoundary(props: ICarouselProps<unknown>) {
    React.useEffect(() => {
        const { defaultIndex, data } = props;
        if (typeof defaultIndex === 'number') {
            if (defaultIndex < 0 || defaultIndex >= data.length) {
                throw Error(
                    'DefaultIndex must be in the range of data length.'
                );
            }
        }
    }, [props]);
}

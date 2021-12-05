import React from 'react';
import type { ICarouselProps } from 'src/Carousel';

export function usePropsErrorBoundary(
    props: ICarouselProps & { viewCount: number }
) {
    React.useEffect(() => {
        const { defaultIndex, viewCount } = props;
        if (typeof defaultIndex === 'number' && viewCount > 0) {
            if (defaultIndex < 0 || defaultIndex >= viewCount) {
                throw Error(
                    'DefaultIndex must be in the range of data length.'
                );
            }
        }
    }, [props]);
}

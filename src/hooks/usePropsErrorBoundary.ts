import React from 'react';
import type { ICarouselProps } from 'src/types';

export function usePropsErrorBoundary(
    props: ICarouselProps & { viewCount: number }
) {
    React.useEffect(() => {
        const { defaultIndex, viewCount, vertical, height, width } = props;

        if (typeof defaultIndex === 'number' && viewCount > 0) {
            if (defaultIndex < 0 || defaultIndex >= viewCount) {
                throw Error(
                    'DefaultIndex must be in the range of data length.'
                );
            }
        }
        if (!vertical && !width) {
            throw Error('`width` must be specified for vertical carousels.');
        }
        if (vertical && !height) {
            throw Error('`height` must be specified for vertical carousels.');
        }
    }, [props]);
}

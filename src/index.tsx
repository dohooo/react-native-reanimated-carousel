if (!('__reanimatedWorkletInit' in global)) {
    Object.assign(global, { __reanimatedWorkletInit: () => {} });
}

export type { TCarouselProps, ICarouselInstance } from './types';
import Carousel from './Carousel';

export default Carousel;

import { useSharedValue } from 'react-native-reanimated';
export interface ILockController {
    lock(): void;
    unLock(): void;
    isLock(): boolean;
}

/**
 * Cannot operate while animation is locking
 */
export function useLockController(): ILockController {
    // This value is true if the animation is executing
    const _lock = useSharedValue<boolean>(false);
    function lock() {
        'worklet';
        _lock.value = true;
    }
    function unLock() {
        'worklet';
        _lock.value = false;
    }
    function isLock() {
        'worklet';
        return _lock.value;
    }
    return {
        lock,
        unLock,
        isLock,
    };
}

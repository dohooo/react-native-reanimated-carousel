import { Platform } from "react-native";

/**
 * Reanimated only reads hook dependency arrays in its Web implementation when the
 * worklets Babel plugin is not used. Native derives them from the worklet closure
 * and, since Reanimated 4.6, warns on every render when an array is passed.
 */
export function webOnlyDependencies<T extends unknown[]>(dependencies: T): T | undefined {
  return Platform.OS === "web" ? dependencies : undefined;
}

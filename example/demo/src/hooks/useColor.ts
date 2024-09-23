import { isWeb } from "../utils";
import { useWebContext } from "../store/WebProvider"

export const useColor = () => {
    const isDark = useWebContext()?.color === 'dark'
    const background = isDark ? "#121212" : "#ffffff";
    const text = isDark ? "#ffffff" : "#121212";

    if (isWeb) {
        // @ts-ignore
        document && (document.body.style.backgroundColor = background);
    }

    return {
        isDark,
        isLight: !isDark,
        colors: {
            background,
            text
        }
    }
}
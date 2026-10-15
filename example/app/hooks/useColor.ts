import { IS_WEB } from "@/constants/platform";
import { useEffect } from "react";
import { useWebContext } from "../store/WebProvider";

export const useColor = () => {
  const isDark = useWebContext()?.color === "dark";
  const background = isDark ? "#121212" : "#ffffff";
  const text = isDark ? "#ffffff" : "#121212";

  useEffect(() => {
    if (IS_WEB) {
      document.body.style.backgroundColor = background;
    }
  }, [background]);

  return {
    isDark,
    isLight: !isDark,
    colors: {
      background,
      text,
    },
  };
};

import React from "react";

import { findLegacyProps, formatLegacyPropsWarning } from "../utils/legacy-props";

/**
 * Development-only: warns once per prop when a component receives a v4 prop
 * that v5 ignores. Pass the props exactly as the caller wrote them.
 */
export function useLegacyPropsWarning(
  component: "Carousel" | "Pagination",
  props: object,
  legacyProps: Readonly<Record<string, string>>
) {
  const warned = React.useRef<Set<string>>(new Set());
  const key = __DEV__ ? findLegacyProps(props, legacyProps).join(",") : "";

  React.useEffect(() => {
    if (!key) return;
    const seen = warned.current;
    const names = key.split(",").filter((name) => !seen.has(name));
    if (names.length === 0) return;
    for (const name of names) seen.add(name);
    console.warn(formatLegacyPropsWarning(component, names, legacyProps));
  }, [component, key, legacyProps]);
}

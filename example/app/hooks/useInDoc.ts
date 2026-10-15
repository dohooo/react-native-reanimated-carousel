import { usePathname } from "expo-router";

import { IS_WEB } from "@/constants/platform";

export function useInDoc() {
  // The docs site embeds `/demos/<kind>/<name>/demo?in_doc=true`. Static rendering does not see
  // the query string, so derive doc mode from the route to keep server and client markup equal.
  const pathname = usePathname();
  const inDoc = IS_WEB && pathname.endsWith("/demo");
  return { inDoc };
}

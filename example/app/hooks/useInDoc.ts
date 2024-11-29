import { useGlobalSearchParams } from "expo-router";

export function useInDoc() {
  const inDoc = useGlobalSearchParams().in_doc === "true";
  return { inDoc };
}

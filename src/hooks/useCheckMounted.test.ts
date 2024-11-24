import { renderHook } from "@testing-library/react-hooks";

import { useCheckMounted } from "./useCheckMounted";

describe("useCheckMounted", () => {
  it("should be mounted after initialization", () => {
    const { result } = renderHook(() => useCheckMounted());

    expect(result.current.current).toBe(true);
  });

  it("should be unmounted after cleanup", () => {
    const { result, unmount } = renderHook(() => useCheckMounted());

    expect(result.current.current).toBe(true);

    unmount();

    expect(result.current.current).toBe(false);
  });

  it("should maintain mounted state during component lifecycle", () => {
    const { result, rerender } = renderHook(() => useCheckMounted());

    expect(result.current.current).toBe(true);

    rerender();

    expect(result.current.current).toBe(true);
  });

  it("should handle multiple mount/unmount cycles", () => {
    // First instance
    const hook1 = renderHook(() => useCheckMounted());
    expect(hook1.result.current.current).toBe(true);

    hook1.unmount();
    expect(hook1.result.current.current).toBe(false);

    // Second instance
    const hook2 = renderHook(() => useCheckMounted());
    expect(hook2.result.current.current).toBe(true);

    hook2.unmount();
    expect(hook2.result.current.current).toBe(false);
  });
});

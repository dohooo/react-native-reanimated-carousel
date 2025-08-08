import { renderHook } from "@testing-library/react-hooks";

import { useUpdateGestureConfig } from "./useUpdateGestureConfig";

describe("useUpdateGestureConfig", () => {
  const mockGesture = {
    enabled: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update gesture enabled state", () => {
    renderHook(() =>
      useUpdateGestureConfig(mockGesture as any, {
        enabled: true,
      })
    );

    expect(mockGesture.enabled).toHaveBeenCalledWith(true);
  });

  it("should handle undefined enabled state", () => {
    renderHook(() => useUpdateGestureConfig(mockGesture as any, {}));

    expect(mockGesture.enabled).not.toHaveBeenCalled();
  });

  it("should update when enabled state changes", () => {
    const { rerender } = renderHook((props) => useUpdateGestureConfig(mockGesture as any, props), {
      initialProps: { enabled: true },
    });

    expect(mockGesture.enabled).toHaveBeenCalledWith(true);

    rerender({ enabled: false });
    expect(mockGesture.enabled).toHaveBeenCalledWith(false);
  });

  it("should not update when enabled state remains the same", () => {
    const { rerender } = renderHook((props) => useUpdateGestureConfig(mockGesture as any, props), {
      initialProps: { enabled: true },
    });

    mockGesture.enabled.mockClear();

    rerender({ enabled: true });
    expect(mockGesture.enabled).not.toHaveBeenCalled();
  });

  it("should handle gesture object changes", () => {
    const newMockGesture = {
      enabled: jest.fn().mockReturnThis(),
    };

    const { rerender } = renderHook(
      ({ gesture, config }) => useUpdateGestureConfig(gesture as any, config),
      {
        initialProps: {
          gesture: mockGesture,
          config: { enabled: true },
        },
      }
    );

    expect(mockGesture.enabled).toHaveBeenCalledWith(true);

    rerender({
      gesture: newMockGesture,
      config: { enabled: true },
    });

    expect(newMockGesture.enabled).toHaveBeenCalledWith(true);
  });

  it("should cleanup properly on unmount", () => {
    const { unmount } = renderHook(() =>
      useUpdateGestureConfig(mockGesture as any, {
        enabled: true,
      })
    );

    mockGesture.enabled.mockClear();
    unmount();

    expect(mockGesture.enabled).not.toHaveBeenCalled();
  });
});

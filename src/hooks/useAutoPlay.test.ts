import { act, renderHook } from "@testing-library/react-hooks";

import { useAutoPlay } from "./useAutoPlay";

describe("useAutoPlay", () => {
  // Mock timer
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // Mock carousel controller
  const mockCarouselController = {
    prev: jest.fn(),
    next: jest.fn(),
    getCurrentIndex: jest.fn(),
    getSharedIndex: jest.fn(),
    scrollTo: jest.fn(),
    index: { value: 0 },
    startMovement: jest.fn(),
    cancelMovement: jest.fn(),
    settle: jest.fn(),
  };

  it("should start autoplay when autoPlay is true", () => {
    renderHook(() =>
      useAutoPlay({
        autoplay: true,
        autoplayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockCarouselController.next).toHaveBeenCalledTimes(1);
  });

  it("should not start autoplay when autoPlay is false", () => {
    renderHook(() =>
      useAutoPlay({
        autoplay: false,
        autoplayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockCarouselController.next).not.toHaveBeenCalled();
  });

  it("should play in reverse when autoPlayReverse is true", () => {
    renderHook(() =>
      useAutoPlay({
        autoplay: true,
        autoplayDirection: "backward",
        autoplayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockCarouselController.prev).toHaveBeenCalledTimes(1);
    expect(mockCarouselController.next).not.toHaveBeenCalled();
  });

  it("should clear timer on unmount", () => {
    const { unmount } = renderHook(() =>
      useAutoPlay({
        autoplay: true,
        autoplayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    // Run the timer once to ensure it's set
    act(() => {
      jest.runOnlyPendingTimers();
    });

    // Clear previous call records
    mockCarouselController.next.mockClear();

    // Then unmount the component and run the timer again
    act(() => {
      unmount();
      jest.runOnlyPendingTimers();
    });

    expect(mockCarouselController.next).not.toHaveBeenCalled();
  });

  it("should pause and resume autoplay", () => {
    const { result } = renderHook(() =>
      useAutoPlay({
        autoplay: true,
        autoplayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    // Run the timer once to ensure it's set
    act(() => {
      jest.runOnlyPendingTimers();
    });

    // Clear previous call records
    mockCarouselController.next.mockClear();

    // Pause autoplay
    act(() => {
      result.current.pause();
      jest.runOnlyPendingTimers();
    });

    expect(mockCarouselController.next).not.toHaveBeenCalled();

    // Resume autoplay
    act(() => {
      result.current.start();
      jest.runOnlyPendingTimers();
    });

    expect(mockCarouselController.next).toHaveBeenCalledTimes(1);
  });

  it("should respect autoPlayInterval timing", () => {
    renderHook(() =>
      useAutoPlay({
        autoplay: true,
        autoplayInterval: 2000,
        carouselController: mockCarouselController,
      })
    );

    // Advance less than interval
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(mockCarouselController.next).not.toHaveBeenCalled();

    // Advance to complete interval
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(1);
  });

  it("starts the next dwell when the step settles", () => {
    const { result } = renderHook(() =>
      useAutoPlay({
        autoplay: true,
        autoplayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(1);

    // Nothing is scheduled while the step is still moving.
    act(() => {
      result.current.onTransitionStart();
      jest.advanceTimersByTime(5000);
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.onTransitionEnd();
      jest.advanceTimersByTime(1000);
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(2);
  });

  it("restarts the dwell after a manual move settles", () => {
    const { result } = renderHook(() =>
      useAutoPlay({
        autoplay: true,
        autoplayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    // A pagination tap or ref command 600 ms into the dwell.
    act(() => {
      jest.advanceTimersByTime(600);
      result.current.onTransitionStart();
      result.current.onTransitionEnd();
    });

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(mockCarouselController.next).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(1);
  });

  it("keeps playing when a manual move interrupts its step", () => {
    const { result } = renderHook(() =>
      useAutoPlay({
        autoplay: true,
        autoplayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(1);

    // The step's animation is cancelled by a manual move, so only the manual move settles.
    act(() => {
      result.current.onTransitionStart();
      result.current.onTransitionEnd();
      jest.advanceTimersByTime(1000);
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(2);
  });

  it("does not resume on settle while paused", () => {
    const { result } = renderHook(() =>
      useAutoPlay({
        autoplay: true,
        autoplayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    act(() => {
      result.current.pause();
      result.current.onTransitionStart();
      result.current.onTransitionEnd();
      jest.advanceTimersByTime(5000);
    });
    expect(mockCarouselController.next).not.toHaveBeenCalled();

    act(() => {
      result.current.start();
      jest.advanceTimersByTime(1000);
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(1);
  });

  it("does not schedule anything when autoplay is off", () => {
    const { result } = renderHook(() =>
      useAutoPlay({
        autoplay: false,
        autoplayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    act(() => {
      result.current.onTransitionStart();
      result.current.onTransitionEnd();
      jest.advanceTimersByTime(5000);
    });
    expect(mockCarouselController.next).not.toHaveBeenCalled();
  });
});

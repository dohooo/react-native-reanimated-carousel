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
  };

  it("should start autoplay when autoPlay is true", () => {
    renderHook(() =>
      useAutoPlay({
        autoPlay: true,
        autoPlayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockCarouselController.next).toHaveBeenCalledTimes(1);
    expect(mockCarouselController.next).toHaveBeenCalledWith(
      expect.objectContaining({
        onFinished: expect.any(Function),
      })
    );
  });

  it("should not start autoplay when autoPlay is false", () => {
    renderHook(() =>
      useAutoPlay({
        autoPlay: false,
        autoPlayInterval: 1000,
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
        autoPlay: true,
        autoPlayReverse: true,
        autoPlayInterval: 1000,
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
        autoPlay: true,
        autoPlayInterval: 1000,
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
        autoPlay: true,
        autoPlayInterval: 1000,
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
        autoPlay: true,
        autoPlayInterval: 2000,
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

  it("should chain autoplay calls correctly", () => {
    renderHook(() =>
      useAutoPlay({
        autoPlay: true,
        autoPlayInterval: 1000,
        carouselController: mockCarouselController,
      })
    );

    // First interval
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(1);

    // Trigger onFinished callback to start the next timer
    const onFinished = mockCarouselController.next.mock.calls[0][0].onFinished;
    act(() => {
      onFinished();
      jest.runOnlyPendingTimers();
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(2);

    // Trigger onFinished callback to start the next timer
    const onFinished2 = mockCarouselController.next.mock.calls[1][0].onFinished;
    act(() => {
      onFinished2();
      jest.runOnlyPendingTimers();
    });
    expect(mockCarouselController.next).toHaveBeenCalledTimes(3);
  });
});
